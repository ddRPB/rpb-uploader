/**
 * DicomUploadDictionary model aggregating studies to be uploaded
 */
export default class DicomUploadDictionary {

    data = {}

    addStudy(studyObject) {
        if (!this.isExistingStudy(studyObject.studyInstaceUID)) {
            this.data[studyObject.studyInstanceUID] = studyObject
            return studyObject
        } else {
            throw new Error('Existing Study')
        }
    }

    getStudy(studyInstanceUID) {
        return this.data[studyInstanceUID]
    }

    studyExists(studyInstanceUID) {
        let existingStudyInstanceUIDs = Object.keys(this.data)
        return existingStudyInstanceUIDs.includes(studyInstanceUID)
    }

    getStudies() {
        let studyArray = Object.values(this.data)
        return studyArray
    }

}