// React and Redux
// Primereact
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { TabMenu } from 'primereact/tabmenu';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { addSeriesReady, addStudyReady, selectStudy } from '../actions/DisplayTables';
import { addSeries } from '../actions/Series';
import { addSlot, resetRedux } from '../actions/Slots';
// Action functions
import { addStudy, setSlotID } from '../actions/Studies';
import { addWarningsSeries, addWarningsStudy } from '../actions/Warnings';
// DICOM processing
import DicomFile from '../model/DicomFile';
import DicomUploadDictionary from '../model/DicomUploadDictionary';
import { ALREADY_KNOWN_STUDY, NULL_SLOT_ID } from '../model/Warning';
import TreeBuilder from '../util/TreeBuilder';
// Util
import Util from '../util/Util';
import DicomBrowser from './DicomBrowser';
import DicomDropZone from './DicomDropZone';
import DicomParsingDetails from './DicomParsingDetails';
import { DicomStudySelection } from "./DicomStudySelection";
import { DicomSeriesSelection } from "./DicomSeriesSelection";
// Custom GUI components
import SlotPanel from './SlotPanel';
import { TreeSelection } from "./TreeSelection";





/**
 * Uploader component
 */
class Uploader extends Component {

    state = {
        isFilesLoaded: false,
        isParsingFiles: false,
        isUnzipping: false,
        isUploadStarted: false,
        isPaused: false,
        fileParsed: 0,
        fileLoaded: 0,
        zipProgress: 0,
        uploadProgress: 0,
        studyProgress: 0,
        studyLength: 1,
        ignoredFiles: {},
        isAnalysisDone: false,
        // tree: {},
        studyArray: [],
        selectedNodeKeys: [],
        selectedStudy: null,
        selectedSeries: [],
        seriesSelectionState: 0
    }

    seriesSelectionMenuItems = [
        { label: 'All Series', icon: 'pi pi-fw pi-home' },
        { label: 'RT Series Tree View', icon: 'pi pi-fw pi-calendar' }

    ];

    constructor(props) {
        super(props)

        this.config = this.props.config
        this.dicomUploadDictionary = new DicomUploadDictionary()
        this.selectNodes = this.selectNodes.bind(this);
        this.selectStudy = this.selectStudy.bind(this);
        this.selectSeries = this.selectSeries.bind(this);

        //TODO: I would rather use DICOM stow-rs instead of uploading files on file system
    }



    selectNodes(e) {
        this.setState({ selectedNodeKeys: e.value })
    }

    selectStudy(e) {
        this.setState({ selectedStudy: e.value })
    }
    selectSeries(e) {
        this.setState({ selectedSeries: e.value })
    }

    /**
     * Init that fires once after HTML render
     */
    componentDidMount = () => {
        this.loadAvailableUploadSlots()
    }

    /**
     * Will fire when uploader component is removed from DOM
     */
    componentWillUnmount = () => {
        this.props.resetRedux()
    }

    /**
     * Load all available upload slots in slot reducer
     */
    loadAvailableUploadSlots = () => {
        let uploadSlots = this.props.config.availableUploadSlots

        uploadSlots.forEach(uploadSlot => {
            this.props.addSlot(uploadSlot)
        })
    }

    /**
     * Read dropped files (listen to DropZone event)
     * @param {Array} files
     */
    addFile = (files) => {

        // Processing ZIP DICOM study
        if (files.length === 1 && files[0].type === 'application/zip') {
            // TODO: enable later when I decide that we support ZIP processing
            //this.readAsZipFile(files[0])
            return
        }

        // At first drop notify user started action
        if (this.state.fileParsed === 0) {
            // Config provides this function to log to console
            this.config.onStartUsing()
        }

        // Add number of files to be parsed to the previous number (incremental parsing)
        this.setState((previousState) => {
            return {
                fileLoaded: (previousState.fileLoaded + files.length),
                isParsingFiles: true
            }
        })

        // Build promise array for all files reading
        let readPromises = files.map((file) => {
            return this.read(file)
        })

        // Once all promised resolved update state and refresh redux with parsing results
        Promise.all(readPromises).then(() => {
            this.setState({ isFilesLoaded: true, isParsingFiles: false })
            // this.analyseDicomAndUpdateRedux()
            // TODO: State setzen
            this.setState({ isAnalysisDone: true })
            let studyArray = this.dicomUploadDictionary.getStudies();
            for (let studyObject of studyArray) {

                const treeBuilder = new TreeBuilder([studyObject]);
                studyObject.key = studyObject.studyInstanceUID;
                studyObject.rtViewTree = treeBuilder.build();
            }

            this.setState({ studyArray: studyArray });
        })
    }

    /**
     * Read and parse a single dicom file
     * @param {File} file
     */
    read = async (file) => {
        try {
            let dicomFile = new DicomFile(file)
            await dicomFile.readDicomFile()

            // DicomDir do no register file
            if (dicomFile.isDicomDir()) {
                throw Error('DICOMDIR')
            }

            // Register Study, Series, Instance in upload study dictionary
            let studyInstanceUID = dicomFile.getStudyInstanceUID()
            let seriesInstanceUID = dicomFile.getSeriesInstanceUID()

            let study
            if (!this.dicomUploadDictionary.studyExists(studyInstanceUID)) {
                study = this.dicomUploadDictionary.addStudy(dicomFile.getDicomStudyObject())
            } else {
                study = this.dicomUploadDictionary.getStudy(studyInstanceUID)
            }

            let series
            if (!study.seriesExists(seriesInstanceUID)) {
                series = study.addSeries(dicomFile.getDicomSeriesObject())
            } else {
                series = study.getSeries(seriesInstanceUID)
            }

            series.addInstance(dicomFile.getDicomInstanceObject())

            this.setState((previousState) => {
                return { fileParsed: ++previousState.fileParsed }
            })

        } catch (error) {
            // In case of exception register file in ignored file list

            // Save only message of error
            let errorMessage = error
            if (typeof error === 'object') {
                errorMessage = error.message
            }
            this.setState(state => {
                return {
                    ignoredFiles: {
                        ...state.ignoredFiles,
                        [file.name]: errorMessage
                    }
                }
            })
        }
    }

    /**
     * Generate warnings for a given study
     * @param {*} studyRedux
     */
    getStudyWarning = async (studyRedux) => {
        let warnings = []

        // If Slot ID is not set add Null Slot ID (slotID Needs to be assigned)
        if (studyRedux.slotID == null) warnings.push(NULL_SLOT_ID)

        // Check if study is already known by server
        let newStudy = await this.props.config.isNewStudy(studyRedux.studyInstanceUID)
        if (!newStudy) warnings.push(ALREADY_KNOWN_STUDY)

        return warnings
    }

    /**
     * Analyse DICOM studies/series with warning and populate redux
     */
    analyseDicomAndUpdateRedux = async () => {
        this.setState({ isAnalysisDone: false })

        // Scan every study in Model
        let studyArray = this.dicomUploadDictionary.getStudies()


        // let treeBuilder = new TreeBuilder(studyArray);
        // this.setState({ tree: treeBuilder.build() });
        // console.log(JSON.stringify(treeBuilder.build()));

        for (let studyObject of studyArray) {

            // const treeBuilder = new TreeBuilder([studyObject]);
            // studyObject.tree = treeBuilder.build();
            // If unknown studyInstanceUID, add it to Redux
            if (!Object.keys(this.props.studies).includes(studyObject.getStudyInstanceUID())) {
                await this.registerStudyInRedux(studyObject)
            }

            // Scan every series in Model
            let series = studyObject.getSeriesArray()
            for (let seriesObject of series) {
                if (!Object.keys(this.props.series).includes(seriesObject.getSeriesInstanceUID())) {
                    await this.registerSeriesInRedux(seriesObject)
                }
            }
        }

        // Mark check finished to make interface available and select the first study item
        this.setState({ isAnalysisDone: true })

        // When no study being selected, select the first one via action
        if (this.props.selectedStudy === undefined && Object.keys(this.props.studies).length >= 1) {
            this.props.selectStudy(this.props.studies[Object.keys(this.props.studies)[0]].studyInstanceUID)
        }
    }

    /**
     * Determine if all identification keys are matching of a study / slot couple
     * @param {object} studyRedux
     * @param {object} slotObject
     */
    isApproximateMatch = (studyRedux, slotObject) => {

        let birthDate = studyRedux.patientBirthDate
        let sex = studyRedux.patientSex
        let modalities = studyRedux.seriesModalitiesArray

        if (Util.areEqualFields(slotObject.subjectSex.trim().charAt(0), sex.trim().charAt(0)) &&
            Util.isProbablyEqualDates(slotObject.subjectDOB, Util.formatRawDate(birthDate))) {
            return true
        } else {
            return false
        }
    }

    /**
     * Search a perfect match slot for a registered studyInstanceUID in redux
     * @param {string} studyInstanceUID
     */
    searchPerfectMatchStudy = (studyInstanceUID) => {
        let studyRedux = this.props.studies[studyInstanceUID]

        // Linear search through expected upload slots
        for (let slotObject of Object.values(this.props.slots)) {
            if (this.isApproximateMatch(studyRedux, slotObject)) {
                return slotObject;
            }
        }

        return undefined;
    }

    /**
     * Register a study of the DICOM model to the redux state
     * @param {DicomStudy} dicomStudy
     */
    registerStudyInRedux = async (dicomStudy) => {
        this.props.addStudy(
            dicomStudy.getPatientSex(),
            dicomStudy.getPatientBirthDate(),
            dicomStudy.getStudyInstanceUID(),
            dicomStudy.getStudyDescription(),
            dicomStudy.getStudyDate(),
            dicomStudy.getStudyType(),
            dicomStudy.getSeriesModalities(),
            dicomStudy.tree
        )

        const studyInstanceUID = dicomStudy.getStudyInstanceUID()

        // Search for a perfect Match in visit candidates and assign it
        let perfectMatchVisit = this.searchPerfectMatchStudy(studyInstanceUID)
        if (perfectMatchVisit != null) {
            this.props.setSlotID(studyInstanceUID, perfectMatchVisit.slotID)
        }
        // Add study warnings to Redux
        let studyRedux = this.props.studies[studyInstanceUID]
        let studyWarnings = await this.getStudyWarning(studyRedux)

        // If no warning mark it as ready, if not add warning to redux
        if (studyWarnings.length === 0) {
            this.props.addStudyReady(studyInstanceUID)
        }
        else {
            studyWarnings.forEach((warning) => {
                this.props.addWarningsStudy(studyInstanceUID, warning)
            })
        }
    }

    /**
     * Register a series of the DICOM model to the redux state
     * @param {DicomSeries} dicomSeries
     */
    registerSeriesInRedux = async (dicomSeries) => {
        let seriesWarnings = await dicomSeries.getWarnings()
        //Add series to redux
        this.props.addSeries(
            dicomSeries.getInstancesObject(),
            dicomSeries.getSeriesInstanceUID(),
            dicomSeries.getSeriesDate(),
            dicomSeries.getSeriesDescription(),
            dicomSeries.getModality(),
            dicomSeries.getStudyInstanceUID()
        )

        // Automatically add to Redux seriesReady if contains no warnings
        if (Util.isEmptyObject(seriesWarnings)) {
            this.props.addSeriesReady(dicomSeries.getSeriesInstanceUID())
        } else {
            // Add series related warnings to Redux
            this.props.addWarningsSeries(dicomSeries.getSeriesInstanceUID(), seriesWarnings)
        }
    }


    /**
     * Render the component
     */
    render = () => {
        if (this.config.availableUploadSlots.length > 0) {
            return (
                <Fragment>
                    <div>
                        <SlotPanel />
                    </div>
                    <Divider />
                    <div>
                        <DicomDropZone
                            addFile={this.addFile}
                            isUnzipping={this.state.isUnzipping}
                            isParsingFiles={this.state.isParsingFiles}
                            isUploadStarted={this.state.isUploadStarted}
                            fileParsed={this.state.fileParsed}
                            fileIgnored={Object.keys(this.state.ignoredFiles).length}
                            fileLoaded={this.state.fileLoaded}
                        />
                    </div>
                    <Divider />
                    <div className="mb-3" hidden={!this.state.isParsingFiles && !this.state.isFilesLoaded}>
                        <DicomParsingDetails
                            fileLoaded={this.state.fileLoaded}
                            fileParsed={this.state.fileParsed}
                            dataIgnoredFiles={this.state.ignoredFiles}
                        />
                    </div>
                    <Divider />
                    <div className="mb-3" hidden={!this.state.isParsingFiles && !this.state.isFilesLoaded}>
                        <DicomStudySelection
                            studies={this.state.studyArray}
                            selectStudy={this.selectStudy}
                            selectedStudy={this.state.selectedStudy}
                        />
                    </div>
                    <Divider />

                    <div hidden={!this.state.selectedStudy}>
                        <TabMenu model={this.seriesSelectionMenuItems} activeIndex={this.state.seriesSelectionState} onTabChange={(e) => this.setState({ seriesSelectionState: e.index })} />
                    </div>

                    <div hidden={!this.state.selectedStudy}>
                        <div className="mb-3" hidden={!this.state.seriesSelectionState == 0}>
                            <DicomSeriesSelection
                                selectedStudy={this.state.selectedStudy}
                                selectSeries={this.selectSeries}
                                selectedSeries={this.state.selectedSeries}
                            ></DicomSeriesSelection>
                        </div>
                    </div>


                    <div className="mb-3" hidden={!this.state.selectedStudy}>
                        <div className="mb-3" hidden={!this.state.seriesSelectionState == 1}>
                            <TreeSelection
                                tree={this.state.tree}
                                selectedStudy={this.state.selectedStudy}
                                selectNodes={this.selectNodes}
                                selectedNodeKeys={this.state.selectedNodeKeys}
                            >
                            </TreeSelection>
                        </div>
                    </div>
                    {/* <div hidden={!this.state.isFilesLoaded}>
                        <div className="mb-3" hidden={!this.state.seriesSelectionState == 0}>
                            <DicomBrowser
                                isCheckDone={this.state.isAnalysisDone}
                                isUploadStarted={this.state.isUploadStarted}
                                multiUpload={this.config.availableUploadSlots.length > 1}
                                selectedSeries={this.props.selectedSeries}
                            /> */}
                            {/*<ProgressUpload*/}
                            {/*    disabled={ this.state.isUploadStarted || Object.keys(this.props.studiesReady).length === 0 }*/}
                            {/*    isUploadStarted = {this.state.isUploadStarted}*/}
                            {/*    isPaused = {this.state.isPaused}*/}
                            {/*    multiUpload={this.config.availableSlots.length > 1}*/}
                            {/*    studyProgress={this.state.studyProgress}*/}
                            {/*    studyLength={this.state.studyLength}*/}
                            {/*    onUploadClick={this.onUploadClick}*/}
                            {/*    onPauseClick = {this.onPauseUploadClick}*/}
                            {/*    zipPercent={this.state.zipProgress}*/}
                            {/*    uploadPercent={this.state.uploadProgress} */}
                            {/*/>*/}
                        {/* </div>
                    </div> */}
                </Fragment >
            )
        } else {
            return <Message severity="warn" text="No upload slots available" />
        }
    }
}

// Defines which state from the Redux store should be pulled to the Uploader component
const mapStateToProps = state => {
    return {
        slots: state.Slots.slots,
        expectedSlot: state.Slots.expectedSlot,
        studies: state.Studies.studies,
        series: state.Series.series,
        selectedSeries: state.DisplayTables.selectedSeries,
        selectedStudy: state.DisplayTables.selectStudy,
        seriesReady: state.DisplayTables.seriesReady,
        studiesReady: state.DisplayTables.studiesReady,
        warningsSeries: state.Warnings.warningsSeries,
    }
}

// Access to Redux store dispatch methods
const mapDispatchToProps = {
    addStudy,
    addSeries,
    addWarningsStudy,
    addWarningsSeries,
    addSlot,
    selectStudy,
    addStudyReady,
    addSeriesReady,
    setSlotID,
    resetRedux
}

// Connects Uploader component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(Uploader)
