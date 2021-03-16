/**
 * DicomInstance domain object
 */
export default class DicomInstance {
    
    constructor(fileObject, SOPInstanceUID) {
        this.SOPInstanceUID = SOPInstanceUID
        this.fileObject = fileObject
    }

    getFile() {
        return this.fileObject
    }
    
}
