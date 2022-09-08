// React and Redux
// Primereact
import { BlockUI } from 'primereact/blockui';
import { Divider } from 'primereact/divider';
import { ScrollTop } from 'primereact/scrolltop';
import { TabMenu } from 'primereact/tabmenu';
import { Component, Fragment } from 'react';
import { toast } from 'react-toastify';
// DICOM processing
import DicomFile from '../model/DicomFile';
import DicomUploadDictionary from '../model/DicomUploadDictionary';
import DicomUploadPackage from '../model/DicomUploadPackage';
import DicomUidService from '../util/deidentification/DicomUidService';
import TreeBuilder from '../util/TreeBuilder';
import DicomDropZone from './DicomDropZone';
import DicomParsingMenu from './DicomParsingMenu';
import { DicomStudySelection } from "./DicomStudySelection";
import FileUploadDialogPanel from './FileUploadDialogPanel';
import RedirectDialog from './RedirectDialog';
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
        blockedPanel: false,
        uploadPackageCheckFailedPanel: false,
        fileUploadDialogPanel: false,
        redirectDialogPanel: false,
        fileUploadInProgress: false,
        evaluationUploadCheckResults: [],
        dicomUidReplacements: [],
        pseudomizedFiles: [],
        uploadedFiles: [],
        verifiedFiles: [],
        uploadApiKey: null,
        rpbPortalUrl: "http://10.44.89.55",
        uploadServiceUrl: "http://10.44.89.55"
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

        this.config = this.props.config;
        this.log = this.props.log;

        this.log.trace('Start Uploader', {}, this.props);

        this.dicomUploadDictionary = new DicomUploadDictionary()

        /**
         * these functions can run within other components (via props) - binding specifies the context (this)
         * independent were the fuction is called
         */
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
        this.generateLogFile = this.generateLogFile.bind(this);
        this.retrySubmitUploadPackage = this.retrySubmitUploadPackage.bind(this);
        this.getServerUploadParameter = this.getServerUploadParameter.bind(this);
        this.redirectToPortal = this.redirectToPortal.bind(this);

        this.dicomUploadPackage = new DicomUploadPackage(this.createUploadSlotParameterObject(), this.log);

        /**
         * some parameters can`t be transfered within the URL - 
         * they will be requested from the RPB portal if the session is alive.
         */
        this.getServerUploadParameter();
    }

    createUploadSlotParameterObject() {
        return {
            studyIdentifier: this.props.studyIdentifier,
            siteIdentifier: this.props.siteIdentifier,
            studyInstanceItemOid: this.props.studyInstanceItemOid,
            studyOid: this.props.studyOid,
            studyEdcCode: this.props.studyEdcCode,
            eventOid: this.props.eventOid,
            eventRepeatKey: this.props.eventRepeatKey,
            eventStartDate: this.props.eventStartDate,
            eventEndDate: this.props.eventEndDate,
            formOid: this.props.formOid,
            itemGroupOid: this.props.itemGroupOid,
            itemGroupRepeatKey: this.props.itemGroupRepeatKey,
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
        this.log.trace('Requesting upload parameters.');
        if (this.state.uploadApiKey === null && this.state.rpbPortalUrl != null) {
            this.fetchUploadParametersFromPortal(this.state.rpbPortalUrl);
        }
    }

    /**
     * Some parameters can`t be transfered within the URL parameters.
     * This function will fetch the parameters from the RPB portal.
     * The dialog (toast) will interact with the user if necessary.
     */
    async fetchUploadParametersFromPortal(url) {
        this.log.trace('Requesting upload parameters.', {}, { url });
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

        // request failed for some reasons
        if (response.status != 200) {
            this.log.trace('Requesting upload parameters failed', {}, { response });
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

        // User session on the portal is probably not active anymore.
        if (response.status == 200 && response.redirected == true) {
            this.log.trace('Requesting upload parameters failed with redirect', {}, { response });
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

        // request succeed
        const responseJson = await response.json();

        if (responseJson.apiKey != null) {
            this.setState({ uploadApiKey: responseJson.apiKey });
            this.dicomUploadPackage.setApiKey(this.state.uploadApiKey);
            this.dicomUploadPackage.setUploadServiceUrl(this.state.uploadServiceUrl);

            this.log.trace('Requesting upload parameters succeed.', {}, {});

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

    /**
     * Redirects the browser window to the landing page of the portal
     */
    redirectToPortal() {
        this.setState({
            fileUploadDialogPanel: false,
            redirectDialogPanel: true
        })

        window.location = `${this.state.rpbPortalUrl}/pacs/dicomPatientStudies.faces?pid=${this.props.pid}&eventid=${this.props.eventOid}&eventrepeatkey=${this.props.eventRepeatKey}`;
    }

    /**
     * Will be called in the TreeSelection component if a node has been selected.
     */
    selectNodes(e) {
        const selectedNodes = { ...e.value };

        // reset upload process indicators
        this.setState({
            uploadProcessState: 0,
            analysedFilesCount: 0,
            deIdentifiedFilesCount: 0,
            uploadedFilesCount: 0,
            verifiedUploadedFilesCount: 0,
            dicomUidReplacements: [],
        });
        this.dicomUploadPackage.resetUploadProcess();

        this.updateDicomUploadPackage(selectedNodes);
        this.setState({
            selectedNodeKeys: selectedNodes,
            selectedDicomFiles: this.dicomUploadPackage.getSelectedFiles()
        });
    }

    /**
     * Will be called in the DicomStudySelection component if a study has been selected.
     */
    selectStudy(e) {
        this.setState({ selectedStudy: { ...e.value }, selectedNodeKeys: [], selectedDicomFiles: 0 });
    }

    /**
     * Updates the DicomUploadPackage if the selection of series nodes changes
     */
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

        this.log.trace(
            "Update DicomUploadPackage with selected nodes",
            {},
            { selectedStudyUID, selectedSeriesObjects }
        );
    }

    /**
     * Resets the uploader to the state in the beginning
     */
    resetAll() {
        this.setState({ ...this.defaultState });
        this.dicomUploadDictionary = new DicomUploadDictionary();
        this.dicomUploadPackage = new DicomUploadPackage(this.createUploadSlotParameterObject());
        this.log.trace("Reset Uploader component", {}, {});
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

    generateLogFile() {
        let logs = this.log.getLogStore();
        let currentDateTime = new Date();

        let fileNameComponents = [
            currentDateTime.getFullYear(),
            currentDateTime.getMonth(),
            currentDateTime.getDay(),
            currentDateTime.getHours(),
            currentDateTime.getMinutes()
        ];

        let fileName = fileNameComponents.join('-') + '-uploader-logs.json'

        let content = JSON.stringify({
            date: currentDateTime.toISOString(),
            uploadSlot: {
                siteIdentifier: this.props.siteIdentifier,
                studyInstanceItemOid: this.props.studyInstanceItemOid,
                studyOid: this.props.studyOid,
                studyEdcCode: this.props.studyEdcCode,
                eventOid: this.props.eventOid,
                eventRepeatKey: this.props.eventRepeatKey,
                eventStartDate: this.props.eventStartDate,
                eventEndDate: this.props.eventEndDate,
                eventName: this.props.eventName,
                eventDescription: this.props.eventDescription,
                formOid: this.props.formOid,
                itemGroupOid: this.props.itemGroupOid,
                itemGroupRepeatKey: this.props.itemGroupRepeatKey,
                itemLabel: this.props.itemLabel,
                itemDescription: this.props.itemDescription,
                subjectId: this.props.subjectId,
                subjectKey: this.props.subjectKey,
                pid: this.props.pid,
                dicomPatientIdItemOid: this.props.dicomPatientIdItemOid,
                dob: this.props.dob,
                yob: this.props.yob,
                gender: this.props.gender
            },
            logs: logs

        });

        // var blob1 = new Blob([content], { type: "text/plain;charset=utf-8" });
        var blob1 = new Blob([content], { type: "application/json;charset=utf-8" });

        //Check the Browser.
        let isIE = false || !!document.documentMode;
        if (isIE) {
            window.navigator.msSaveBlob(blob1, fileName);
        } else {
            let url = window.URL || window.webkitURL;
            let link = url.createObjectURL(blob1);
            let a = document.createElement("a");
            a.download = fileName;
            a.href = link;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }

    }

    async retrySubmitUploadPackage() {
        this.submitUploadPackage();
    }

    async submitUploadPackage() {
        let uids, identities, errors = [];

        this.log.trace('Submit upload package.', {}, {})

        this.setState({
            fileUploadDialogPanel: true,
            evaluationUploadCheckResults: [],
            fileUploadInProgress: true,
        });

        // Starting step 1 - Evaluating the files, extracting the Uids, creating a Map with the replacements

        if (this.state.dicomUidReplacements.length === 0) {
            // Step 1 was not finished before - start evaluation of the package and reset all progress counter to 0
            this.log.trace('Submit upload package - step 1.', {}, {})
            this.setState({
                uploadProcessState: 0,
                analysedFilesCount: 0,
                deIdentifiedFilesCount: 0,
                uploadedFilesCount: 0,
                verifiedUploadedFilesCount: 0,
                dicomUidReplacements: [],
            });

            ({ uids, identities, errors } = await this.dicomUploadPackage.prepareUpload(this.setAnalysedFilesCountValue));

            this.log.trace('Upload package prepared.', {}, { uids, identities, errors })

            if (errors.length > 0) {
                this.setState({
                    evaluationUploadCheckResults: errors,
                    fileUploadInProgress: false,
                });

                return;
            }

            // preparing de-identification
            this.log.trace('Requesting generated uids for de-identification', {}, { serviceUrl: this.state.uploadServiceUrl })
            const dicomUidService = new DicomUidService(uids, this.state.uploadServiceUrl, null, this.state.uploadApiKey);
            const dicomUidRequestPromise = toast.promise(
                dicomUidService.getUidMap(),
                {
                    pending: 'Requesting DICOM UIDs for De-Identification.',
                    // success: 'Connection to ' + url + ' succeed.',
                    error: (err) => `Requesting DICOM UIDs failed ${err.toString()}.`,
                }
            )
            const dicomUidRequestPromiseResult = await dicomUidRequestPromise;

            this.log.trace('Requesting DICOM UIDs request answered', {}, { dicomUidRequestPromiseResult });

            const dicomUidReplacements = dicomUidRequestPromiseResult.dicomUidReplacements;
            errors = dicomUidRequestPromiseResult.errors;

            if (errors.length > 0) {
                this.log.debug('Requesting DICOM UIDs failed', {}, { errors });
                this.setState({
                    evaluationUploadCheckResults: errors,
                    fileUploadInProgress: false,
                    dicomUidReplacements: [],
                });

                return;
            }

            this.setState({
                dicomUidReplacements: dicomUidReplacements,
            });

        } else {
            this.log.trace('DicomUidReplacements already exist - skip evaluation step.', {}, {})
        }

        // // Starting step 2 - linking Dicom series with item

        this.setState({
            uploadProcessState: 1,
        });

        this.log.trace('Link Dicom data.', {}, { uidReplacements: this.state.dicomUidReplacements });

        const linkingResult = await this.dicomUploadPackage.linkUploadedStudy(this.setStudyIsLinked, this.state.dicomUidReplacements);

        if (linkingResult.errors.length > 0) {
            this.setState({
                evaluationUploadCheckResults: linkingResult.errors,
                fileUploadInProgress: false,
            });

            return;
        }

        // Starting step 3 - de-identification and upload of chunks

        this.setState({
            uploadProcessState: 2,
        });

        this.log.trace('De-identify and upload Dicom data.', {}, {});

        ({ errors } = await this.dicomUploadPackage.deidentifyAndUpload(this.state.dicomUidReplacements, this.setDeIdentifiedFilesCountValue, this.setUploadedFilesCountValue));

        if (errors.length > 0) {
            this.log.debug("There was a problem during the upload", {}, { errors });
            this.setState({
                evaluationUploadCheckResults: errors,
                fileUploadInProgress: false,
            });

            return;
        }

        // Starting step 4 - verifying uploads to the RPB backend

        this.setState({
            uploadProcessState: 3,
        });

        this.log.trace('Verify uploaded Dicom data.', {}, {});

        const verificationResults = await this.dicomUploadPackage.verifySeriesUpload(this.state.dicomUidReplacements, this.setVerifiedUploadedFilesCountValue);

        if (verificationResults.errors.length > 0) {
            this.log.debug("There was a problem during the verification", {}, { errors });
            this.setState({
                evaluationUploadCheckResults: verificationResults.errors,
                fileUploadInProgress: false,
            });

            return;
        }

        this.setState({
            fileUploadInProgress: false,
        });

        this.log.trace('Dicom data upload process successful finished.', {}, {});

        toast.success(
            <div>
                <div>
                    {'Upload finished'}
                </div>
            </div>
            ,
            {
                autoClose: false,
                position: "top-center",
                closeOnClick: true,
                pauseOnHover: true,
            });

        return;

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
        let dicomFile = new DicomFile(file)
        try {
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
            this.log.trace('Parsing of a file failed. ', {}, { dicomFile, errorMessage });

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
     * Compares the patientId of the selected study with the patientId of the DICOM file to ensure that data from
     * different patients will not mixed.
     */
    verifyPatientIdIsConsistent(dicomFile, study) {
        const patientIdFromFile = dicomFile.getPatientID();
        const patientIdFromStudy = study.getPatientID();

        if (patientIdFromFile != "" && patientIdFromStudy != "") {
            if (study.getPatientID().toUpperCase() != dicomFile.getPatientID().toUpperCase()) {
                let errorMessage = `PatientId is different from other files that belong to the study. Study: \'${study.getPatientID()}\' File: \'${dicomFile.getPatientID()}\'`;
                this.log.trace(errorMessage, {}, { dicomFile, study });
                throw Error(errorMessage);
            }
        }
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

                        eventOid={this.props.eventOid}
                        eventRepeatKey={this.props.eventRepeatKey}
                        eventStartDate={this.props.eventStartDate}
                        eventEndDate={this.props.eventEndDate}
                        eventName={this.props.eventName}
                        eventDescription={this.props.eventDescription}

                        formOid={this.props.formOid}
                        itemGroupOid={this.props.itemGroupOid}
                        itemGroupRepeatKey={this.props.itemGroupRepeatKey}
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
                    fileUploadInProgress={this.state.fileUploadInProgress}
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
                    generateLogFile={this.generateLogFile}
                    retrySubmitUploadPackage={this.retrySubmitUploadPackage}
                >
                </FileUploadDialogPanel>

                <RedirectDialog
                    redirectDialogPanel={this.state.redirectDialogPanel}
                >
                </RedirectDialog>

            </Fragment >

        )

    }
}

export default Uploader
