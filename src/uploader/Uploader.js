// React and Redux
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'

// Boostrap GUI components
import { Alert } from 'react-bootstrap'

// Custom GUI components
import DicomDropZone from './DicomDropZone'
import DicomParsingDetails from './DicomParsingDetails'

// DICOM processing
import DicomFile from '../model/DicomFile'

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

        //TODO: I would rather use DICOM stow-rs instead of uploading files on file system
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
            //TODO: enabled once I understand the state handling
            //this.checkSeriesAndUpdateRedux()
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

            // Secondary capture or DicomDir do no register file
            // if (dicomFile.isDicomDir()) {
            //     throw Error('Dicomdir file')
            // }
            // if (dicomFile.isSecondaryCaptureImg()) {
            //     throw Error('Secondary Capture Image')
            // }

            // Register Study, Series, Instance if new in model
            // let studyInstanceUID = dicomFile.getStudyInstanceUID()
            // let seriesInstanceUID = dicomFile.getSeriesInstanceUID()
            //
            // let study
            // if (!this.uploadModel.isExistingStudy(studyInstanceUID)) {
            //     study = this.uploadModel.addStudy(dicomFile.getStudyObject())
            // } else {
            //     study = this.uploadModel.getStudy(studyInstanceUID)
            // }
            //
            // let series
            // if (!study.isExistingSeries(seriesInstanceUID)) {
            //     series = study.addSeries(dicomFile.getSeriesObject())
            // } else {
            //     series = study.getSeries(seriesInstanceUID)
            // }
            //
            // series.addInstance(dicomFile.getInstanceObject())

            this.setState((previousState) => {
                return { fileParsed: ++previousState.fileParsed }
            })

        } catch (error) {
            //If exception register file in ignored file list

            //Save only message of error
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
                        {/*<Options />*/}
                    </div>
                    <div hidden={!this.state.isFilesLoaded}>
                        {/*<ControllerStudiesSeries*/}
                        {/*    isCheckDone={this.state.isCheckDone}*/}
                        {/*    isUploadStarted={this.state.isUploadStarted}*/}
                        {/*    multiUpload={this.config.availableVisits.length > 1}*/}
                        {/*    selectedSeries={this.props.selectedSeries} */}
                        {/*/>*/}
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
            return <Alert variant='success'> No upload slots available </Alert>
        }
    }
}

const mapStateToProps = (state, ownProps) => ({
    // ... computed data from state and optionally ownProps
})

const mapDispatchToProps = {
    // ... normally is an object full of action creators
}

export default connect(mapStateToProps, mapDispatchToProps)(Uploader)
