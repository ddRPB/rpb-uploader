// React and Redux
// Primereact
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { ScrollTop } from 'primereact/scrolltop';
import { TabMenu } from 'primereact/tabmenu';
import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { addSlot, resetRedux } from '../actions/Slots';
// DICOM processing
import DicomFile from '../model/DicomFile';
import DicomUploadDictionary from '../model/DicomUploadDictionary';
import { ALREADY_KNOWN_STUDY, NULL_SLOT_ID } from '../model/Warning';
import TreeBuilder from '../util/TreeBuilder';
import DicomDropZone from './DicomDropZone';
import DicomParsingMenu from './DicomParsingMenu';
import { DicomStudySelection } from "./DicomStudySelection";
// Custom GUI components
import SlotPanel from './SlotPanel';
import { TreeSelection } from "./TreeSelection";

/**
 * Uploader component
 */
class Uploader extends Component {

    defaultState = {
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
        ignoredFiles: {},
        isAnalysisDone: false,
        studyArray: [],
        selectedNodeKeys: [],
        selectedDicomFiles: [],
        selectedStudy: null,
        selectedSeries: [],
        seriesSelectionState: 0
    }

    seriesSelectionMenuItems = [
        { label: 'All Series', icon: 'pi pi-fw' },
        { label: 'RT Series', icon: 'pi pi-fw pi-calendar' }


    ];

    constructor(props) {
        super(props)

        this.state = {
            ...this.defaultState
        };

        this.config = this.props.config
        this.dicomUploadDictionary = new DicomUploadDictionary()
        this.selectNodes = this.selectNodes.bind(this);
        this.selectStudy = this.selectStudy.bind(this);
        this.getSelectedFiles = this.getSelectedFiles.bind(this);
        this.resetAll = this.resetAll.bind(this);

        //TODO: I would rather use DICOM stow-rs instead of uploading files on file system
    }

    selectNodes(e) {
        this.setState({ selectedNodeKeys: { ...e.value }, selectedDicomFiles: this.getSelectedFiles({ ...e.value }) });
    }

    selectStudy(e) {
        this.setState({ selectedStudy: { ...e.value }, selectedNodeKeys: [], selectedDicomFiles: [] });
    }

    getSelectedFiles(selectedNodesArray) {
        const selectedStudy = { ...this.state.selectedStudy.series };
        let selectedFiles = [];

        for (let uid in selectedNodesArray) {
            const selectedSeries = selectedStudy[uid];
            if (selectedSeries.parameters != null) {
                let result = (Object.keys(selectedSeries.instances).map(function (key, index) { return selectedSeries.instances[key].fileObject }));
                selectedFiles = selectedFiles.concat(result);
            }
        }

        return selectedFiles;
    }

    resetAll() {
        this.setState({ ...this.defaultState });
        this.props.resetRedux();
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
            this.setState({ isAnalysisDone: true })
            let studyArray = this.dicomUploadDictionary.getStudies();
            for (let studyObject of studyArray) {

                const treeBuilder = new TreeBuilder([studyObject]);
                studyObject.key = studyObject.studyInstanceUID;
                studyObject.rtViewTree = treeBuilder.build();
                studyObject.allRootTree = treeBuilder.buildAllNodesChildrenOfRoot();
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
     * Render the component
     */
    render = () => {
        if (this.config.availableUploadSlots.length > 0) {
            return (
                <Fragment>
                    <SlotPanel />

                    <Divider />

                    <DicomDropZone
                        addFile={this.addFile}
                        isUnzipping={this.state.isUnzipping}
                        isParsingFiles={this.state.isParsingFiles}
                        isUploadStarted={this.state.isUploadStarted}
                        fileParsed={this.state.fileParsed}
                        fileIgnored={Object.keys(this.state.ignoredFiles).length}
                        fileLoaded={this.state.fileLoaded}
                    />

                    <Divider />

                    <DicomParsingMenu
                        fileLoaded={this.state.fileLoaded}
                        fileParsed={this.state.fileParsed}
                        dataIgnoredFiles={this.state.ignoredFiles}
                        selectedNodeKeys={this.state.selectedNodeKeys}
                        selectedDicomFiles={this.state.selectedDicomFiles}
                        resetAll={this.resetAll}
                    />

                    <Divider />

                    <div className="mb-3" hidden={!this.state.isParsingFiles && !this.state.isFilesLoaded}>
                        <DicomStudySelection
                            studies={this.state.studyArray}
                            selectStudy={this.selectStudy}
                            selectedStudy={this.state.selectedStudy}
                        />
                    </div>

                    <Divider />

                    <div hidden={!this.state.selectedStudy} className="text-sm">
                        <TabMenu model={this.seriesSelectionMenuItems} activeIndex={this.state.seriesSelectionState} onTabChange={(e) => this.setState({ seriesSelectionState: e.index })} />
                    </div>

                    <div className="mb-3 text-sm" hidden={!this.state.selectedStudy}>
                        <div className="mb-3" hidden={this.state.seriesSelectionState !== 0}>
                            <TreeSelection
                                rTView={true}
                                selectedStudy={this.state.selectedStudy}
                                seriesTree={"allRootTree"}
                                selectNodes={this.selectNodes}
                                selectedNodeKeys={this.state.selectedNodeKeys}
                            >
                            </TreeSelection>
                        </div>
                    </div>

                    <div className="mb-3" hidden={!this.state.selectedStudy}>
                        <div className="mb-3" hidden={this.state.seriesSelectionState !== 1}>
                            <TreeSelection
                                rTView={true}
                                selectedStudy={this.state.selectedStudy}
                                seriesTree={"rtViewTree"}
                                selectNodes={this.selectNodes}
                                selectedNodeKeys={this.state.selectedNodeKeys}
                            >
                            </TreeSelection>
                        </div>
                    </div>

                    <ScrollTop />

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
    }
}

// Access to Redux store dispatch methods
const mapDispatchToProps = {
    addSlot,
    resetRedux
}

// Connects Uploader component to Redux store
export default connect(mapStateToProps, mapDispatchToProps)(Uploader)
