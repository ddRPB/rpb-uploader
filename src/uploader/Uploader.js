// React and Redux
// Primereact
import { BlockUI } from 'primereact/blockui';
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
import DicomUploadPackage from '../model/DicomUploadPackage';
import { ALREADY_KNOWN_STUDY, NULL_SLOT_ID } from '../model/Warning';
import DicomUIDGenerator from '../util/deidentification/DicomUIDGenerator';
import TreeBuilder from '../util/TreeBuilder';
import DicomDropZone from './DicomDropZone';
import DicomParsingMenu from './DicomParsingMenu';
import { DicomStudySelection } from "./DicomStudySelection";
import FailedUploadPackageCheckPanel from './FailedUploadPackageCheckPanel';
import FileUploadDialogPanel from './FileUploadDialogPanel';
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
        ignoredFiles: {},
        isAnalysisDone: false,
        studyArray: [],
        selectedNodeKeys: [],
        selectedDicomFiles: [],
        selectedStudy: null,
        seriesSelectionState: 0,
        blockedPanel: false,
        uploadPackageCheckFailedPanel: false,
        fileUploadDialogPanel: false,
        evaluationUploadCheckResults: [],
        dicomUidReplacements: null,

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
        this.getSelectedFiles = this.updateDicomUploadPackage.bind(this);
        this.resetAll = this.resetAll.bind(this);
        this.submitUploadPackage = this.submitUploadPackage.bind(this);
        this.hideUploadCheckResultsPanel = this.hideUploadCheckResultsPanel.bind(this);
        this.hideFileUploadDialogPanel = this.hideFileUploadDialogPanel.bind(this);

        this.dicomUploadPackage = new DicomUploadPackage(this.props.config.availableUploadSlots[0]);

        //TODO: I would rather use DICOM stow-rs instead of uploading files on file system
    }

    selectNodes(e) {
        const selectedNodes = { ...e.value };
        this.updateDicomUploadPackage(selectedNodes);
        this.setState({
            selectedNodeKeys: selectedNodes,
            selectedDicomFiles: this.dicomUploadPackage.getSelectedFiles()
        }
        );
    }

    selectStudy(e) {
        this.setState({ selectedStudy: { ...e.value }, selectedNodeKeys: [], selectedDicomFiles: 0 });
    }

    updateDicomUploadPackage(selectedNodesArray) {
        const selectedStudyUID = this.state.selectedStudy.studyInstanceUID;

        const selectedStudy = { ...this.state.selectedStudy.series };
        const selectedSeriesObjects = {};

        for (let uid in selectedNodesArray) {
            const selectedSeries = selectedStudy[uid];
            if (selectedSeries != null) {
                selectedSeriesObjects[uid] = selectedSeries;
            }
        }

        this.dicomUploadPackage.setStudyInstanceUID(selectedStudyUID);
        this.dicomUploadPackage.setSelectedSeries(selectedSeriesObjects);
    }

    resetAll() {
        this.setState({ ...this.defaultState });
        this.props.resetRedux();
        this.dicomUploadDictionary = new DicomUploadDictionary();
        this.dicomUploadPackage = new DicomUploadPackage(this.props.config.availableUploadSlots[0]);
    }

    hideUploadCheckResultsPanel() {
        this.setState({
            blockedPanel: false,
            uploadPackageCheckFailedPanel: false,
            evaluationUploadCheckResults: []
        });
    }

    hideFileUploadDialogPanel() {
        this.setState({
            blockedPanel: false,
            fileUploadDialogPanel: false
        });
    }

    async submitUploadPackage() {
        this.setState({ blockedPanel: true });
        let uids = await this.dicomUploadPackage.evaluate();
        const dicomUIDGenerator = new DicomUIDGenerator('2.25.');
        const dicomUidReplacements = dicomUIDGenerator.getOriginalUidToPseudomizedUidMap(uids);

        this.setState({ dicomUidReplacements: dicomUidReplacements });

        // if (evaluationResult.length > 0) {
        //     console.log(evaluationResult);
        //     this.setState({
        //         blockedPanel: false,
        //         uploadPackageCheckFailedPanel: true,
        //         evaluationUploadCheckResults: evaluationResult
        //     });
        //     return;
        // }

        await this.dicomUploadPackage.deidentify(this.state.dicomUidReplacements);
        this.dicomUploadPackage.upload();

        this.setState({
            blockedPanel: false,
            fileUploadDialogPanel: true
        });

        this.setState({ blockedPanel: false });

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
                study = this.dicomUploadDictionary.getStudy(studyInstanceUID);
                this.verifyPatientIdIsConsistent(dicomFile, study);
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

    verifyPatientIdIsConsistent(dicomFile, study) {
        const patientIdFromFile = dicomFile.getPatientID();
        const patientIdFromStudy = study.getPatientID();

        if (patientIdFromFile != "" && patientIdFromStudy != "") {
            if (study.getPatientID().toUpperCase() != dicomFile.getPatientID().toUpperCase()) {
                throw Error(`PatientId is different from other files that belong to the study. Study: \'${study.getPatientID()}\' File: \'${dicomFile.getPatientID()}\'`);
            }
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
                    <BlockUI blocked={this.state.blockedPanel}>
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
                            submitUploadPackage={this.submitUploadPackage}
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



                    </BlockUI>

                    <FailedUploadPackageCheckPanel
                        uploadPackageCheckFailedPanel={this.state.uploadPackageCheckFailedPanel}
                        evaluationUploadCheckResults={this.state.evaluationUploadCheckResults}
                        hideUploadCheckResultsPanel={this.hideUploadCheckResultsPanel}
                    ></FailedUploadPackageCheckPanel>

                    <FileUploadDialogPanel
                        fileUploadDialogPanel={this.state.fileUploadDialogPanel}
                        hideFileUploadDialogPanel={this.hideFileUploadDialogPanel}
                        selectedDicomFiles={this.state.selectedDicomFiles}
                    >
                    </FileUploadDialogPanel>

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
