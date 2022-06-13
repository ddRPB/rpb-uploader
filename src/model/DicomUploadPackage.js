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
        this.chunkSize = 5;
        this.processedChunksCount = 0;

        this.pseudomizedFiles = [];
        this.uploadedFiles = [];
        this.verifiedFiles = [];

        this.studyInstanceUID = '';
        this.replacedStudyInstanceUID = '';

        const configFactory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, this.uploadSlot);
        this.deIdentificationConfiguration = configFactory.getConfiguration();

        this.apiKey = null;
        this.uploadServiceUrl = null;

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

    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    setUploadServiceUrl(uploadServiceUrl) {
        this.uploadServiceUrl = uploadServiceUrl;
    }

    async evaluate(setAnalysedFilesCountValue) {
        let uids = [];
        let errors = []
        let processedFilesCount = 0;

        for (let uid in this.selectedSeriesObjects) {
            try {
                const selectedSeries = this.selectedSeriesObjects[uid];
                console.log(`Evaluate series ${uid}`);

                if (selectedSeries.parameters != null) {
                    let currentChunk = new DicomUploadChunk(this.studyInstanceUID, uid);

                    for (let sopInstanceUid in selectedSeries.instances) {
                        const fileObject = selectedSeries.instances[sopInstanceUid];

                        const inspector = new DicomFileInspector(fileObject, this.deIdentificationConfiguration);
                        const uidArray = await inspector.analyzeFile()
                        uids = uids.concat(uidArray);

                        if (currentChunk.getCount() < this.chunkSize) {
                            currentChunk.addInstance(sopInstanceUid, fileObject);
                        } else {
                            this.uploadChunks.push(currentChunk);
                            currentChunk = new DicomUploadChunk(this.studyInstanceUID, uid);
                            currentChunk.addInstance(sopInstanceUid, fileObject);
                        }

                        processedFilesCount++;
                        setAnalysedFilesCountValue(processedFilesCount);

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

    async deidentifyAndUpload(dicomUidReplacements, setDeIdentifiedFilesCountValue, setUploadedFilesCountValue) {
        let errors = []
        const replacedStudyUID = dicomUidReplacements.get(this.studyInstanceUID);
        if (replacedStudyUID != null) {
            this.replacedStudyInstanceUID = replacedStudyUID;
        }


        for (let chunk of this.uploadChunks) {
            const boundary = 'XXXXXXXX---abcd';
            const contentDescription = 'description';
            const mimeMessageBuilder = new MimeMessageBuilder(boundary);


            if (!chunk.deIdentified) {
                try {
                    chunk.setDeIdentifiedStudyUid(this.replacedStudyInstanceUID);
                    chunk.setDeIdentifiedSeriesUid(dicomUidReplacements.get(chunk.originalSeriesUid));


                    chunk.deidentifiedInstances = [];
                    for (let instance of chunk.originalInstances) {
                        const dicomFileDeIdentificationComponent = new DicomFileDeIdentificationComponentDcmjs(dicomUidReplacements, this.deIdentificationConfiguration, instance.fileObject);
                        const arrayBuffer = await dicomFileDeIdentificationComponent.getDeIdentifiedFileContentAsBuffer();
                        const sopInstanceUidReplacement = dicomUidReplacements.get(instance.sopInstanceUid);

                        chunk.deidentifiedInstances.push({
                            sopInstanceUid: sopInstanceUidReplacement,
                            fileObject: arrayBuffer
                        });

                        mimeMessageBuilder
                            .addDicomContent(Buffer.from(arrayBuffer.buffer), arrayBuffer.name, sopInstanceUidReplacement, contentDescription);
                    }

                    await Promise.all(chunk.deidentifiedInstances);

                    chunk.deIdentified = true;
                    this.pseudomizedFiles = this.pseudomizedFiles.concat(chunk.getFileNames());
                    setDeIdentifiedFilesCountValue(this.pseudomizedFiles.length);

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

            if (!chunk.transfered && this.apiKey != null && this.uploadServiceUrl != null) {
                const args = {
                    method: 'POST',
                    body: chunk.mimeMessage,
                    headers: {
                        "X-Api-Key": this.apiKey,
                        "Content-Type": `multipart/related; boundary=${boundary}; type="application/dicom"`,
                    }
                };

                try {
                    // let response = await fetch(`http://localhost:8080/api/v1/dicomweb/studies/${this.studyInstanceUID}123`, args);
                    let response = await fetch(`${this.uploadServiceUrl}/api/v1/dicomweb/studies/${this.replacedStudyInstanceUID}`, args);
                    switch (response.status) {
                        case 200:
                            chunk.transfered = true;
                            this.uploadedFiles = this.uploadedFiles.concat(chunk.getFileNames());
                            chunk.cleanupAfterTransfer();

                            this.processedChunksCount++;
                            setUploadedFilesCountValue(this.uploadedFiles.length);

                            break;

                        // todo - 413 - chunk size probably too big
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

    async verifyUpload(setVerifiedUploadedFilesCountValue) {
        let errors = []
        let verifiedInstances = 0;

        for (let chunk of this.uploadChunks) {
            if (!chunk.uploadVerified && chunk.transfered) {
                let verifiedUploadResults = [];
                for (let deIdentifiedInstance of chunk.deidentifiedInstances) {

                    const args = {
                        method: 'GET',
                        headers: {
                            "X-Api-Key": this.apiKey,
                        }
                    };

                    let response = await fetch(`${this.uploadServiceUrl}/api/v1/dicomweb/subjects/${this.uploadSlot.pid}/studies/${chunk.deIdentifiedStudyUid}/series/${chunk.deIdentifiedSeriesUid}/instances/${deIdentifiedInstance.sopInstanceUid}`, args);

                    if (response.status === 200) {
                        verifiedUploadResults.push(await response.json());
                    } else {
                        errors.push(
                            this.createErrorMessageObject(
                                'Upload Error - With response code: ',
                                'Upload Error - With response code: ' + response.status.toString(),
                                chunk.originalSeriesUid,
                                chunk.getFileNames(),
                                chunk.getSoapInstanceUids(),
                                null
                            ));
                        return { errors: errors };
                    }
                }

                try {
                    const uploadResults = await Promise.all(verifiedUploadResults);
                    let verified = false;
                    if (uploadResults.length > 0) {
                        verified = uploadResults.
                            map(res => res.exists).
                            reduce((prev, curr) => { return prev && curr });
                    }

                    chunk.uploadVerified = verified;

                    if (!chunk.uploadVerified) {
                        errors.push(
                            this.createErrorMessageObject(
                                'Verification failed.',
                                'Verification failed - The uploaded file is not available on the system yet. Please try again.',
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
                            'Verification failed.',
                            'Verification failed - There was a problem with the request.' - e.toString(),
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

            // counter for UI
            verifiedInstances += chunk.deidentifiedInstances.length;
            setVerifiedUploadedFilesCountValue(verifiedInstances);
        }

        return {
            errors: errors
        };
    }

    async linkUploadedStudy(setStudyIsLinked) {
        let errors = []

        const allVerified = this.uploadChunks.
            map(chunk => chunk.uploadVerified).
            reduce((prev, curr) => { return prev && curr });

        if (!allVerified) {
            errors.push(
                this.createErrorMessageObject(
                    'Verification is not finished yet.',
                    'Verification is not finished yet. Please try again',
                    '',
                    '',
                    null
                ));
        } else {

            const jsonBody = {
                dicomStudyInstanceItemOid: this.uploadSlot.studyInstanceItemOid,
                dicomStudyInstanceItemValue: this.replacedStudyInstanceUID,
                dicomPatientIdItemOid: this.uploadSlot.dicomPatientIdItemOid,
                dicomPatientIdItemValue: this.uploadSlot.pid,
                itemGroupOid: this.uploadSlot.itemGroup,
                formOid: this.uploadSlot.form,
                studyEventOid: this.uploadSlot.event,
                studyEventRepeatKey: this.uploadSlot.eventRepeatKey,
                subjectKey: this.uploadSlot.subjectKey,
                subjectId: this.uploadSlot.subjectId,
                studyOid: this.uploadSlot.studyOid,
            }

            const args = {
                method: 'POST',
                headers: {
                    "X-Api-Key": this.apiKey,
                    "Content-Type": `application/json`,
                },
                body: JSON.stringify(jsonBody)
            };

            let response = await fetch(`${this.uploadServiceUrl}/api/v1/dicomweb/subjects/${this.uploadSlot.pid}/studies/${this.replacedStudyInstanceUID}/`, args);

            if (response.status === 200) {
                const result = await response.json();
                if (result.success) {
                    setStudyIsLinked(true);
                } else {
                    errors.push(
                        this.createErrorMessageObject(
                            'Error Linking the DicomData.',
                            'Error Linking the DicomData. - ' + result.errors.toString(),
                            '',
                            '',
                            null
                        ));
                }
            } else {
                errors.push(
                    this.createErrorMessageObject(
                        'Error Linking the DicomData.',
                        'Error Linking the DicomData. - Response code is:  ' + response.status.toString(),
                        '',
                        '',
                        null
                    ));
            }

        }

        return {
            errors: errors
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
        };
    }
}
