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

    async evaluate() {
        let uids = [];
        let counter = 0;

        for (let uid in this.selectedSeriesObjects) {
            const selectedSeries = this.selectedSeriesObjects[uid];
            console.log(`Pseudomyse series ${uid}`);

            if (selectedSeries.parameters != null) {
                for (let sopInstanceUid in selectedSeries.instances) {
                    const fileObject = selectedSeries.instances[sopInstanceUid];
                    const inspector = new DicomFileInspector(fileObject);
                    const uidArray = await inspector.analyzeFile()
                    uids = uids.concat(uidArray);
                }
            }

        }

        return uids;

    }

    async pseudonymize(dicomUidReplacements) {
        const configFactory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC);
        const deIdentConf = configFactory.getConfiguration();

        for (let uid in this.selectedSeriesObjects) {
            const selectedSeries = this.selectedSeriesObjects[uid];
            console.log(`Pseudomyse series ${uid}`);

            if (selectedSeries.parameters != null) {
                for (let sopInstanceUid in selectedSeries.instances) {
                    const fileObject = selectedSeries.instances[sopInstanceUid];
                    const dicomFileDeIdentificationComponent = new DicomFileDeIdentificationComponentDcmjs(dicomUidReplacements, deIdentConf, fileObject);
                    this.pseudomizedFileBuffers.push(await dicomFileDeIdentificationComponent.getBuffer());
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
        const dataBuffer = Buffer.from(this.pseudomizedFileBuffers[0]);

        const mimeMessageBuilder = new MimeMessageBuilder(boundary);
        const payload = mimeMessageBuilder
            .addDicomContent(dataBuffer, fileName, contentId, contentDescription,)
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



    }



}