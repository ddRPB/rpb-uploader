// React and Redux
// Primereact
import { BlockUI } from 'primereact/blockui';
import { Divider } from 'primereact/divider';
import { ScrollTop } from 'primereact/scrolltop';
import { TabMenu } from 'primereact/tabmenu';
import React, { Component, Fragment } from 'react';
import { toast } from 'react-toastify';
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
import FileUploadDialogPanel from './FileUploadDialogPanel';
// Custom GUI components
import SlotPanel from './SlotPanel';
import { TreeSelection } from "./TreeSelection";
import UploadPackageCheckDialogPanel from './UploadPackageCheckDialogPanel';



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
        analysedFilesCount: 0,
        deIdentifiedFilesCount: 0,
        uploadedFilesCount: 0,
        verifiedUploadedFilesCount: 0,
        studyIsLinked: false,
        uploadProcessState: 0,
        progressPanelValue: 0,
        blockedPanel: false,
        uploadPackageCheckFailedPanel: false,
        fileUploadDialogPanel: false,
        evaluationUploadCheckResults: [],
        dicomUidReplacements: [],
        pseudomizedFiles: [],
        uploadedFiles: [],
        verifiedFiles: [],
        uploadApiKey: null,
        rpbPortalUrl: "http://10.44.89.56",
        uploadServiceUrl: "http://10.44.89.56"
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
        this.setAnalysedFilesCountValue = this.setAnalysedFilesCountValue.bind(this);
        this.setDeIdentifiedFilesCountValue = this.setDeIdentifiedFilesCountValue.bind(this);
        this.setUploadedFilesCountValue = this.setUploadedFilesCountValue.bind(this);
        this.setVerifiedUploadedFilesCountValue = this.setVerifiedUploadedFilesCountValue.bind(this);
        this.setStudyIsLinked = this.setStudyIsLinked.bind(this);
        this.retrySubmitUploadPackage = this.retrySubmitUploadPackage.bind(this);
        this.getServerUploadParameter = this.getServerUploadParameter.bind(this);
        this.redirectToPortal = this.redirectToPortal.bind(this);

        this.dicomUploadPackage = new DicomUploadPackage(this.createUploadSlotParameterObject());
        this.getServerUploadParameter();

        //TODO: I would rather use DICOM stow-rs instead of uploading files on file system
    }

    createUploadSlotParameterObject() {
        return {
            studyIdentifier: this.props.studyIdentifier,
            siteIdentifier: this.props.siteIdentifier,
            studyInstanceItemOid: this.props.studyInstanceItemOid,
            studyOid: this.props.studyOid,
            event: this.props.event,
            eventRepeatKey: this.props.eventRepeatKey,
            eventStartDate: this.props.eventStartDate,
            eventEndDate: this.props.eventEndDate,
            form: this.props.form,
            itemGroup: this.props.itemGroup,
            itemGroupRepeatKey: this.props.itemGroupRepeatKey,
            item: this.props.item,
            itemLabel: this.props.itemLabel,
            subjectId: this.props.subjectId,
            subjectKey: this.props.subjectKey,
            pid: this.props.pid,
            dicomPatientIdItemOid: this.props.dicomPatientIdItemOid,
            dob: this.props.dob,
            yob: this.props.yob,
            gender: this.props.gender,
            uploadServiceUrl: this.state.uploadServiceUrl,
        }
    }

    async getServerUploadParameter() {
        if (this.state.uploadApiKey === null && this.state.rpbPortalUrl != null) {
            this.fetchUploadParametersFromPortal(this.state.rpbPortalUrl)
        }

    }

    async fetchUploadParametersFromPortal(url) {
        toast.dismiss();
        const fetchPromise = toast.promise(
            fetch(url + '/pacs/rpbUploader.faces'),

            {
                pending: 'Connecting to ' + url + '.',
                // success: 'Connection to ' + url + ' succeed.',
                error: 'Connection to ' + url + ' failed.'
            }

        )

        const response = await fetchPromise;

        if (response.status != 200) {
            toast.dismiss();
            toast.error(
                <div>
                    <div>
                        {'The Server: '}
                    </div>
                    <a href={url} target="_blank">{url}</a>
                    <div>
                        {' respond with status code: ' + response.status + '.'}
                    </div>
                </div>
                ,
                {
                    autoClose: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });
            return;
        }

        if (response.status == 200 && response.redirected == true) {
            toast.dismiss();
            toast.error(
                <div>
                    <div>
                        {'There is a problem. Please open: '}
                    </div>
                    <a href={response.url} target="_blank">{response.url}</a>
                    <div>
                        {' and try again.'}
                    </div>
                </div>
                ,
                {
                    autoClose: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                });

            return;
        }

        const responseJson = await response.json();

        if (responseJson.apiKey != null) {
            this.setState({ uploadApiKey: responseJson.apiKey });
            this.dicomUploadPackage.setApiKey(this.state.uploadApiKey);
            this.dicomUploadPackage.setUploadServiceUrl(this.state.uploadServiceUrl);
            toast.dismiss();

            toast.success(
                <div>
                    {'Connection succeed.'}
                </div>
            );
        }

        return;
    }

    setAnalysedFilesCountValue(value) {
        this.setState({ analysedFilesCount: value });
    }

    setDeIdentifiedFilesCountValue(value) {
        this.setState({ deIdentifiedFilesCount: value });
    }

    setUploadedFilesCountValue(value) {
        this.setState({ uploadedFilesCount: value });
    }

    setVerifiedUploadedFilesCountValue(value) {
        this.setState({ verifiedUploadedFilesCount: value });
    }

    setStudyIsLinked(value) {
        this.setState({ studyIsLinked: value });
    }

    redirectToPortal() {
        window.location = `${this.state.rpbPortalUrl}/pacs/dicomPatientStudies.faces?pid=${this.props.pid}&eventid=${this.props.event}&eventrepeatkey=${this.props.eventRepeatKey}`;
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
        this.dicomUploadDictionary = new DicomUploadDictionary();
        this.dicomUploadPackage = new DicomUploadPackage(this.createUploadSlotParameterObject());
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

    async retrySubmitUploadPackage() {
        this.submitUploadPackage();
    }

    async submitUploadPackage() {
        let uids, errors = [];

        this.setState({
            fileUploadDialogPanel: true,
            evaluationUploadCheckResults: [],
        });

        // Starting step 1 - Evaluating the files, extracting the Uids, creating a Map with the replacements

        if (this.state.dicomUidReplacements.length === 0) {
            // Step 1 was not finished before - start evaluation of the package and reset all progress counter to 0
            this.setState({
                uploadProcessState: 0,
                analysedFilesCount: 0,
                deIdentifiedFilesCount: 0,
                uploadedFilesCount: 0,
                verifiedUploadedFilesCount: 0,
                dicomUidReplacements: [],
            });

            ({ uids, errors } = await this.dicomUploadPackage.evaluate(this.setAnalysedFilesCountValue));

            if (errors.length > 0) {
                this.setState({
                    evaluationUploadCheckResults: errors,
                });

                return;
            }

            // preparing de-identification
            const dicomUIDGenerator = new DicomUIDGenerator('2.25.');
            const dicomUidReplacements = dicomUIDGenerator.getOriginalUidToPseudomizedUidMap(uids);

            this.setState({
                dicomUidReplacements: dicomUidReplacements,
            });
        }

        // Starting step 2 - de-identification and upload of chunks

        this.setState({
            uploadProcessState: 1,
        });

        ({ errors } = await this.dicomUploadPackage.deidentifyAndUpload(this.state.dicomUidReplacements, this.setDeIdentifiedFilesCountValue, this.setUploadedFilesCountValue));

        if (errors.length > 0) {
            this.setState({
                evaluationUploadCheckResults: errors,
            });

            return;
        }

        // Starting step 2 - verifying uploads to the RPB backend

        this.setState({
            uploadProcessState: 2,
        });

        const verificationResults = await this.dicomUploadPackage.verifyUpload(this.setVerifiedUploadedFilesCountValue);

        if (verificationResults.errors.length > 0) {
            this.setState({
                evaluationUploadCheckResults: verificationResults.errors,
            });

            return;
        }

        // // Starting step 3 - linking Dicom series with item

        this.setState({
            uploadProcessState: 3,
        });

        const linkingResult = await this.dicomUploadPackage.linkUploadedStudy(this.setStudyIsLinked);

        if (linkingResult.errors.length > 0) {
            this.setState({
                evaluationUploadCheckResults: linkingResult.errors,
            });

            return;
        }

        // this.setState({
        //     fileUploadDialogPanel: false,
        // });


        // this.resetAll();

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
        // let uploadSlots = this.props.config.availableUploadSlots

        // uploadSlots.forEach(uploadSlot => {
        //     this.props.addSlot(uploadSlot)
        // })
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
            // this.config.onStartUsing()
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

        return (
            <Fragment>
                <BlockUI blocked={this.state.blockedPanel}>
                    <SlotPanel
                        studyIdentifier={this.props.studyIdentifier}
                        siteIdentifier={this.props.siteIdentifier}
                        studyInstanceItemOid={this.props.studyInstanceItemOid}

                        event={this.props.event}
                        eventRepeatKey={this.props.eventRepeatKey}
                        eventStartDate={this.props.eventStartDate}
                        eventEndDate={this.props.eventEndDate}
                        eventName={this.props.eventName}
                        eventDescription={this.props.eventDescription}

                        form={this.props.form}
                        itemGroup={this.props.itemGroup}
                        itemGroupRepeatKey={this.props.itemGroupRepeatKey}
                        item={this.props.item}
                        itemLabel={this.props.itemLabel}
                        itemDescription={this.props.itemDescription}

                        subjectId={this.props.subjectId}
                        subjectKey={this.props.subjectKey}
                        pid={this.props.pid}
                        dicomPatientIdItemOid={this.props.dicomPatientIdItemOid}

                        dob={this.props.dob}
                        yob={this.props.yob}
                        gender={this.props.gender}
                    />

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
                        getServerUploadParameter={this.getServerUploadParameter}
                        uploadApiKey={this.state.uploadApiKey}
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

                <UploadPackageCheckDialogPanel
                    uploadPackageCheckFailedPanel={this.state.uploadPackageCheckDialogPanel}
                    evaluationUploadCheckResults={this.state.evaluationUploadCheckResults}
                    hideUploadCheckResultsPanel={this.hideUploadCheckResultsPanel}
                ></UploadPackageCheckDialogPanel>

                <FileUploadDialogPanel
                    fileUploadDialogPanel={this.state.fileUploadDialogPanel}
                    hideFileUploadDialogPanel={this.hideFileUploadDialogPanel}
                    selectedDicomFiles={this.state.selectedDicomFiles}
                    uploadProcessState={this.state.uploadProcessState}

                    setAnalysedFilesCountValue={this.setAnalysedFilesCountValue}
                    setDeIdentifiedFilesCountValue={this.setDeIdentifiedFilesCountValue}
                    setUploadedFilesCountValue={this.setUploadedFilesCountValue}
                    setVerifiedUploadedFilesCountValue={this.setVerifiedUploadedFilesCountValue}
                    setStudyIsLinked={this.setStudyIsLinked}
                    redirectToPortal={this.redirectToPortal}

                    analysedFilesCount={this.state.analysedFilesCount}
                    deIdentifiedFilesCount={this.state.deIdentifiedFilesCount}
                    uploadedFilesCount={this.state.uploadedFilesCount}
                    verifiedUploadedFilesCount={this.state.verifiedUploadedFilesCount}
                    studyIsLinked={this.state.studyIsLinked}

                    evaluationUploadCheckResults={this.state.evaluationUploadCheckResults}
                    dicomUidReplacements={this.state.dicomUidReplacements}
                    retrySubmitUploadPackage={this.retrySubmitUploadPackage}
                >
                </FileUploadDialogPanel>

            </Fragment >


        )

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
export default Uploader
