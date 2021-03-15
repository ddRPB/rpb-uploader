// React and Redux
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Primereact
import { Message } from 'primereact/message'

// Custom GUI components
import DicomDropZone from './DicomDropZone'
import DicomParsingDetails from './DicomParsingDetails'
import DicomBrowser from './DicomBrowser'

// Action functions
import { addStudy, setSlotID } from '../actions/Studies'
import { addSeries } from '../actions/Series'
import { addWarningsSeries, addWarningsStudy } from '../actions/Warnings'
import { addSlot, resetRedux } from '../actions/Slots'
import { selectStudy, addStudyReady } from '../actions/DisplayTables'
import { addSeriesReady } from '../actions/DisplayTables'

import { NULL_SLOT_ID, ALREADY_KNOWN_STUDY } from '../model/Warning'

// DICOM processing
import DicomFile from '../model/DicomFile'
import DicomUploadDictionary from '../model/DicomUploadDictionary'

/**
 * Uploader component
 */
class Uploader extends Component {
    
    state = {
        isFilesLoaded: false,
        isParsingFiles: false,
        isUnzipping: false,
        isUploadStarted: false,
        isPaused : false,
        fileParsed: 0,
        fileLoaded: 0,
        zipProgress: 0,
        uploadProgress: 0,
        studyProgress: 0,
        studyLength: 1,
        ignoredFiles: {},
        isCheckDone: false
    }

    constructor(props) {
        super(props)

        this.config = this.props.config
        this.dicomUploadDictionary = new DicomUploadDictionary()

        //TODO: I would rather use DICOM stow-rs instead of uploading files on file system
    }

    /**
     * Init that fires once after HTML render
     */
    componentDidMount = () => {
        this.loadAvailableUploadSlots()
    }

    componentWillUnmount = () => {
        this.props.resetRedux()
    }

    loadAvailableUploadSlots = () => {
        let uploadSlots = this.props.config.availableUploadSlots

        // Add all available upload slots in slot reducer
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
            this.analyseDicomAndUpdateRedux()
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

            // DicomDir or Secondary capture do no register file
            if (dicomFile.isDicomDir()) {
                 throw Error('DICOMDIR')
            }
            if (dicomFile.isSecondaryCaptureImg()) {
                 throw Error('Secondary Capture Image')
            }

            // Register Study, Series, Instance in upload study dictionary
            let studyInstanceUID = dicomFile.getStudyInstanceUID()
            let seriesInstanceUID = dicomFile.getSeriesInstanceUID()

            let study
            if (!this.dicomUploadDictionary.studyExists(studyInstanceUID)) {
                study = this.dicomUploadDictionary.addStudy(dicomFile.getStudyObject())
            } else {
                study = this.dicomUploadDictionary.getStudy(studyInstanceUID)
            }

            let series
            if (!study.isExistingSeries(seriesInstanceUID)) {
                 series = study.addSeries(dicomFile.getSeriesObject())
            } else {
                series = study.getSeries(seriesInstanceUID)
            }

            series.addInstance(dicomFile.getInstanceObject())

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
     * Analyse DICOM studies/series with warning and populate redux
     */
    analyseDicomAndUpdateRedux = async () => {
        this.setState({ isCheckDone: false })

        // Scan every study in Model
        let studyArray = this.dicomUploadDictionary.getStudies()
        for (let studyObject of studyArray) {

            // If unknown studyInstanceUID, add it to Redux
            if (!Object.keys(this.props.studies).includes(studyObject.getStudyInstanceUID())){
                await this.registerStudyInRedux(studyObject)
            }

            // Scan every series in Model
            let series = studyObject.getSeriesArray()
            for (let seriesObject of series) {
                if (!Object.keys(this.props.series).includes(seriesObject.getSeriesInstanceUID())){
                    await this.registerSeriesInRedux(seriesObject)
                }
            }
        }

        //TODO: rename checkDone to analysisDone
        // Mark check finished to make interface available and select the first study item
        this.setState({ isCheckDone: true })

        // When no study being selected, select the first one
        if (this.props.selectedStudy === undefined && Object.keys(this.props.studies).length >= 1) {
            this.props.selectStudy(this.props.studies[Object.keys(this.props.studies)[0]].studyInstanceUID)
        }
    }

    /**
     * Register a study of the dicom model to the redux
     * @param {Study} studyToAdd
     */
    registerStudyInRedux = async (studyToAdd) => {
        this.props.addStudy(
            studyToAdd.getStudyInstanceUID(),
            studyToAdd.getPatientFirstName(),
            studyToAdd.getPatientLastName(),
            studyToAdd.getPatientSex(),
            studyToAdd.getPatientID(),
            studyToAdd.getAcquisitionDate(),
            studyToAdd.getAccessionNumber(),
            studyToAdd.getPatientBirthDate(),
            studyToAdd.getStudyDescription(),
            studyToAdd.getOrthancStudyID(),
            studyToAdd.getChildModalitiesArray()
        )

        const studyInstanceUID = studyToAdd.getStudyInstanceUID()

        // Search for a perfect Match in visit candidates and assign it
        let perfectMatchVisit = this.searchPerfectMatchStudy(studyInstanceUID)
        if (perfectMatchVisit != null) {
            this.props.setVisitID(studyInstanceUID, perfectMatchVisit.visitID)
        }
        // Add study warnings to Redux
        let studyRedux = this.props.studies[studyInstanceUID]
        let studyWarnings = await this.getStudyWarning(studyRedux)

        // If no warning mark it as ready, if not add warning to redux
        if (studyWarnings.length === 0) {
            this.props.addStudyReady(studyInstanceUID)
        }
        else {
            studyWarnings.forEach( (warning)=> {
                this.props.addWarningsStudy(studyInstanceUID, warning)
            })
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
                    <div className="mb-3" hidden={!this.state.isParsingFiles && !this.state.isFilesLoaded}>
                        <DicomParsingDetails
                            fileLoaded={this.state.fileLoaded}
                            fileParsed={this.state.fileParsed}
                            dataIgnoredFiles={this.state.ignoredFiles}
                        />
                    </div>
                    <div hidden={!this.state.isFilesLoaded}>
                        <DicomBrowser
                            isCheckDone={this.state.isCheckDone}
                            isUploadStarted={this.state.isUploadStarted}
                            multiUpload={this.config.availableUploadSlots.length > 1}
                            selectedSeries={this.props.selectedSeries}
                        />
                        {/*<ProgressUpload*/}
                        {/*    disabled={ this.state.isUploadStarted || Object.keys(this.props.studiesReady).length === 0 }*/}
                        {/*    isUploadStarted = {this.state.isUploadStarted}*/}
                        {/*    isPaused = {this.state.isPaused}*/}
                        {/*    multiUpload={this.config.availableVisits.length > 1}*/}
                        {/*    studyProgress={this.state.studyProgress}*/}
                        {/*    studyLength={this.state.studyLength}*/}
                        {/*    onUploadClick={this.onUploadClick}*/}
                        {/*    onPauseClick = {this.onPauseUploadClick}*/}
                        {/*    zipPercent={this.state.zipProgress}*/}
                        {/*    uploadPercent={this.state.uploadProgress} */}
                        {/*/>*/}
                    </div>
                </Fragment>
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
