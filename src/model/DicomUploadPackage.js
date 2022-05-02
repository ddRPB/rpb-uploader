import DeIdentificationProfiles from "../constants/DeIdentificationProfiles";
import DeIdentificationConfigurationFactory from "../util/deidentification/DeIdentificationConfigurationFactory";
import DicomFileDeIdentificationComponentDcmjs from "../util/deidentification/DicomFileDeIdentificationComponentDcmjs";
import MimeMessageBuilder from "../util/MimeMessageBuilder";
import DicomFileInspector from "../util/verification/DicomFileInspector";


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

        this.pseudomizedFileBuffers = [];

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
        let counter = 0;

        let processedFilesCount = 0;

        for (let uid in this.selectedSeriesObjects) {
            const selectedSeries = this.selectedSeriesObjects[uid];
            console.log(`Evaluate series ${uid}`);

            if (selectedSeries.parameters != null) {
                for (let sopInstanceUid in selectedSeries.instances) {
                    const fileObject = selectedSeries.instances[sopInstanceUid];
                    const inspector = new DicomFileInspector(fileObject, this.deIdentificationConfiguration);
                    const uidArray = await inspector.analyzeFile()
                    uids = uids.concat(uidArray);

                    processedFilesCount++;
                    setProgressPanelValue(Math.round(processedFilesCount / this.selectedFiles.length * 100));

                }
            }

        }

        return uids;

    }

    async deidentify(dicomUidReplacements, setProgressPanelValue) {

        let processedFilesCount = 0;

        for (let uid in this.selectedSeriesObjects) {
            const selectedSeries = this.selectedSeriesObjects[uid];
            console.log(`Deidentify series ${uid}`);

            if (selectedSeries.parameters != null) {
                for (let sopInstanceUid in selectedSeries.instances) {
                    const fileObject = selectedSeries.instances[sopInstanceUid];
                    const dicomFileDeIdentificationComponent = new DicomFileDeIdentificationComponentDcmjs(dicomUidReplacements, this.deIdentificationConfiguration, fileObject);
                    this.pseudomizedFileBuffers.push(await dicomFileDeIdentificationComponent.getBuffer());

                    processedFilesCount++;
                    setProgressPanelValue(Math.round(processedFilesCount / this.selectedFiles.length * 100));
                }
            }

        }

        await Promise.all(this.pseudomizedFileBuffers.entries());

        const replacedStudyUID = dicomUidReplacements.get(this.studyInstanceUID);
        if (replacedStudyUID != null) {
            this.studyInstanceUID = replacedStudyUID;
        }
        console.log("Generating Pseudonyms");

    }

    async upload() {
        const boundary = 'XXXXXXXX---abcd';
        const fileName = 'dummmyFileName';
        const contentId = 'dummyId';
        const contentDescription = 'description';
        // ToDo: Timing for resolving promises
        // const dataBuffer = Buffer.from(this.pseudomizedFileBuffers[0]);

        const mimeMessageBuilder = new MimeMessageBuilder(boundary);

        for (let arrayBuffer of this.pseudomizedFileBuffers) {
            mimeMessageBuilder
                .addDicomContent(Buffer.from(arrayBuffer.buffer), fileName, contentId, contentDescription);
        }

        const payload = mimeMessageBuilder
            // .addDicomContent(dataBuffer, fileName, contentId, contentDescription,)
            // .addDicomContent(dataBuffer)
            .build();

        const args = {
            method: 'POST',
            body: payload,
            headers: {
                "X-Api-Key": "abc",
                "Content-Type": `multipart/related; boundary=${boundary}; type="application/dicom"`,
            }
        };


        let response = await fetch(`http://localhost:8080/api/v1/dicomweb/studies/${this.studyInstanceUID}`, args);

        console.log('test');
        console.log(response.status);
        console.log(response.ok);
        // console.log(response.response.statusCode);

        return response;

    }



}