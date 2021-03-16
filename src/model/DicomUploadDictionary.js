/**
 * DicomUploadDictionary model aggregating studies selected for upload
 */
export default class DicomUploadDictionary {

    data = {}

    /**
     * Add specified DICOM study to the upload dictionary
     * @param {DicomStudy} studyObject
     */
    addStudy(studyObject) {
        if (!this.studyExists(studyObject.studyInstanceUID)) {
            this.data[studyObject.studyInstanceUID] = studyObject
            return studyObject
        } else {
            throw new Error('Existing Study')
        }
    }

    /**
     * Get DICOM study with specified study instance UID from upload dictionary
     * @param {String} studyInstanceUID
     */
    getStudy(studyInstanceUID) {
        return this.data[studyInstanceUID]
    }

    /**
     * Check if DICOM study with specified study instance UID is present in the upload dictionary
     * @param {String} studyInstanceUID
     */
    studyExists(studyInstanceUID) {
        return Object.keys(this.data).includes(studyInstanceUID)
    }

    /**
     * Get list of all DICOM studies from upload dictionary
     */
    getStudies() {
        return Object.values(this.data)
    }

}