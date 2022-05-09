import DeIdentificationProfiles from "../constants/DeIdentificationProfiles";
import DeIdentificationConfigurationFactory from "../util/deidentification/DeIdentificationConfigurationFactory";
import DicomFileDeIdentificationComponentDcmjs from "../util/deidentification/DicomFileDeIdentificationComponentDcmjs";
import MimeMessageBuilder from "../util/MimeMessageBuilder";
import DicomFileInspector from "../util/verification/DicomFileInspector";
import DicomUploadChunk from "./DicomUploadChunk";


export default class DicomUploadPackage {

    constructor(uploadSlot) {
        if (uploadSlot != null) {
            this.uploadSlot = uploadSlot;
        } else {
            this.uploadSlot = {};
        }

        this.selectedSeriesObjects = {};
        this.selectedFiles = [];
        this.uids = [];

        this.uploadChunks = [];
        this.chunkSize = 10;
        this.processedChunksCount = 0;

        this.pseudomizedFiles = [];
        this.uploadedFiles = [];
        this.verifiedFiles = [];

        this.studyInstanceUID = '';

        const configFactory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, this.uploadSlot);
        this.deIdentificationConfiguration = configFactory.getConfiguration();


    }

    setSelectedSeries(selectedSeriesObjects) {
        this.selectedSeriesObjects = selectedSeriesObjects;
        this.updateSelectedFilesArray(selectedSeriesObjects);

    }

    setStudyInstanceUID(studyInstanceUID) {
        this.studyInstanceUID = studyInstanceUID;
    }

    updateSelectedFilesArray(selectedSeriesObjects) {
        this.selectedFiles = [];
        for (let uid in selectedSeriesObjects) {
            const selectedSeries = selectedSeriesObjects[uid];
            let result = (Object.keys(selectedSeries.instances).map(function (key, index) { return selectedSeries.instances[key].fileObject; }));
            this.selectedFiles = this.selectedFiles.concat(result);
        }
    }

    getSelectedFiles() {
        return this.selectedFiles;
    }

    getUids() {
        return this.uids;
    }

    getSelectedFilesCount() {
        if (this.selectedSeriesObjects === null) { return 0 };
        if (this.selectedSeriesObjects.length === 0) { return 0 };

        return this.selectedFiles.length;
    }

    async evaluate(setProgressPanelValue) {
        let uids = [];
        let errors = []
        let processedFilesCount = 0;

        for (let uid in this.selectedSeriesObjects) {
            try {
                const selectedSeries = this.selectedSeriesObjects[uid];
                console.log(`Evaluate series ${uid}`);

                if (selectedSeries.parameters != null) {
                    let currentChunk = new DicomUploadChunk(uid);

                    for (let sopInstanceUid in selectedSeries.instances) {
                        const fileObject = selectedSeries.instances[sopInstanceUid];

                        const inspector = new DicomFileInspector(fileObject, this.deIdentificationConfiguration);
                        const uidArray = await inspector.analyzeFile()
                        uids = uids.concat(uidArray);

                        if (currentChunk.getCount() < this.chunkSize) {
                            currentChunk.addInstance(sopInstanceUid, fileObject);
                        } else {
                            this.uploadChunks.push(currentChunk);
                            currentChunk = new DicomUploadChunk(uid);
                            currentChunk.addInstance(sopInstanceUid, fileObject);
                        }

                        processedFilesCount++;
                        setProgressPanelValue(Math.round(processedFilesCount / this.selectedFiles.length * 100));

                        // errors.push(this.createErrorMessageObject(
                        //     'Evaluation Error',
                        //     'message',
                        //     uid,
                        //     fileObject.name,
                        //     sopInstanceUid,
                        //     null
                        // ));

                    }

                    if (currentChunk.getCount() > 0) {
                        this.uploadChunks.push(currentChunk);
                    }
                }

            } catch (e) {
                errors.push(
                    this.createErrorMessageObject(
                        'Evaluation Error',
                        'Evaluation Error ' + e.toString(),
                        uid,
                        '',
                        '',
                        null
                    ));
                return {
                    errors: errors
                };
            }
        }

        return {
            uids: uids,
            errors: errors
        };

    }

    async deidentifyAndUpload(dicomUidReplacements, setProgressPanelValue) {
        let errors = []
        const replacedStudyUID = dicomUidReplacements.get(this.studyInstanceUID);
        if (replacedStudyUID != null) {
            this.studyInstanceUID = replacedStudyUID;
        }



        for (let chunk of this.uploadChunks) {
            const boundary = 'XXXXXXXX---abcd';
            const contentDescription = 'description';
            const mimeMessageBuilder = new MimeMessageBuilder(boundary);

            if (!chunk.deIdentified) {
                try {
                    chunk.deidentifiedInstances = [];
                    for (let instance of chunk.originalInstances) {
                        const dicomFileDeIdentificationComponent = new DicomFileDeIdentificationComponentDcmjs(dicomUidReplacements, this.deIdentificationConfiguration, instance.fileObject);
                        const arrayBuffer = await dicomFileDeIdentificationComponent.getDeIdentifiedFileContentAsBuffer()
                        chunk.deidentifiedInstances.push(arrayBuffer);
                        mimeMessageBuilder
                            .addDicomContent(Buffer.from(arrayBuffer.buffer), arrayBuffer.name, arrayBuffer.sopInstanceUid, contentDescription);
                    }

                    await Promise.all(chunk.deidentifiedInstances);

                    chunk.deIdentified = true;
                    this.pseudomizedFiles = this.pseudomizedFiles.concat(chunk.getFileNames());

                    chunk.mimeMessage = mimeMessageBuilder.build();

                } catch (e) {
                    errors.push(
                        this.createErrorMessageObject(
                            'Deidentification Error',
                            'Deidentification Error: ' + e.toString(),
                            chunk.originalSeriesUid,
                            chunk.getFileNames(),
                            chunk.getSoapInstanceUids(),
                            null
                        ));
                    return {
                        errors: errors
                    };
                }
            }

            if (!chunk.transfered) {
                const args = {
                    method: 'POST',
                    body: chunk.mimeMessage,
                    headers: {
                        "X-Api-Key": "abc",
                        "Content-Type": `multipart/related; boundary=${boundary}; type="application/dicom"`,
                    }
                };

                try {
                    let response = await fetch(`http://localhost:8080/api/v1/dicomweb/studies/${this.studyInstanceUID}123`, args);
                    switch (response.status) {
                        case 200:
                            chunk.transfered = true;
                            this.uploadedFiles = this.uploadedFiles.concat(chunk.getFileNames());
                            chunk.cleanupAfterTransfer();

                            this.processedChunksCount++;
                            setProgressPanelValue(Math.round(this.processedChunksCount / this.uploadChunks.length * 100));

                            break;
                        default:
                            errors.push(
                                this.createErrorMessageObject(
                                    'Upload Error - With response code: ',
                                    'Upload Error - With response code: ' + response.status.toString(),
                                    chunk.originalSeriesUid,
                                    chunk.getFileNames(),
                                    chunk.getSoapInstanceUids(),
                                    null
                                ));
                            return {
                                errors: errors
                            };

                    }

                } catch (e) {
                    errors.push(
                        this.createErrorMessageObject(
                            'Upload Error - There is a problem with the upload. Please check the connection. Error message: ',
                            'Upload Error - There is a problem with the upload. Please check the connection. Error message: ' + e.toString(),
                            chunk.originalSeriesUid,
                            chunk.getFileNames(),
                            chunk.getSoapInstanceUids(),
                            null
                        ));
                    return {
                        errors: errors
                    };

                }


            }
        }



        return {
            errors
        };

    }

    createErrorMessageObject(
        title,
        message,
        seriesUid,
        fileName,
        sopInstanceUid,
        retryFunction
    ) {
        return {
            title: title,
            message: message,
            seriesUid: seriesUid,
            fileName: fileName,
            sopInstanceUid: sopInstanceUid,
            retryFunction: retryFunction
        }
    }


}