
export default class DicomUploadChunk {


    constructor(studyUid, seriesUid) {
        this.originalStudyUid = studyUid;
        this.originalSeriesUid = seriesUid;
        this.deIdentifiedStudyUid = "";
        this.deIdentifiedSeriesUid = "";
        this.originalSoapInstanceUids = [];

        this.originalFileNames = [];

        this.deIdentified = false;
        this.transfered = false;
        this.uploadVerified = false;

        this.originalInstances = [];
        this.deidentifiedInstances = [];
        this.mimeMessage = null;
        this.messages = [];

    }


    setDeIdentifiedStudyUid(studyUid) {
        this.deIdentifiedStudyUid = studyUid;
    }

    setDeIdentifiedSeriesUid(seriesUid) {
        this.deIdentifiedSeriesUid = seriesUid;
    }

    addInstance(sopInstanceUid, fileObject) {
        this.originalInstances.push({
            sopInstanceUid: sopInstanceUid,
            fileObject: fileObject
        })
    }

    getCount() {
        return this.originalInstances.length;
    }

    getFileNames() {
        return this.originalInstances.map((fileObject) => fileObject.fileObject.fileObject.name);
    }

    getFilePaths() {
        return this.originalInstances.map((fileObject) => fileObject.fileObject.fileObject.path);
    }

    getSoapInstanceUids() {
        return this.originalInstances.map((fileObject) => fileObject.sopInstanceUid);
    }

    cleanupAfterTransfer() {
        this.originalInstances = [];
    }
}