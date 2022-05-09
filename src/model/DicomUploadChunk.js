
export default class DicomUploadChunk {


    constructor(seriesUid) {
        this.originalSeriesUid = seriesUid;
        this.originalSoapInstanceUids = [];

        this.originalFileNames = [];

        this.deIdentified = false;
        this.transfered = false;

        this.originalInstances = [];
        this.deidentifiedInstances = [];
        this.mimeMessage = null;
        this.messages = [];

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
        this.mimeMessage = [];
    }
}