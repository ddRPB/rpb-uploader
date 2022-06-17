// Warnings
import { MISSING_TAG_00080060 } from './Warning'

// DICOM domain model
import DicomFile from './DicomFile'

/**
 * DicomSeries domain object
 */
export default class DicomSeries {

    instances = {};
    deIdentifiedStudyInstanceUID = null;
    deIdentifiedSeriesInstanceUID = null;
    uploadVerified = false;

    constructor(seriesInstanceUID, seriesDate, seriesDescription, modality, studyInstanceUID, parameters) {
        this.seriesInstanceUID = seriesInstanceUID
        this.seriesDate = seriesDate
        this.seriesDescription = seriesDescription
        this.modality = modality
        this.studyInstanceUID = studyInstanceUID
        this.parameters = parameters
    }

    getSeriesInstanceUID() {
        if (this.seriesInstanceUID == null) {
            throw new Error('Null SeriesInstanceUID')
        }
        return this.seriesInstanceUID
    }

    getSeriesDate() {
        return this.seriesDate == null ? '' : this.seriesDate
    }

    getSeriesDescription() {
        return this.seriesDescription == null ? '' : this.seriesDescription
    }

    getModality() {
        return this.modality == null ? '' : this.modality
    }

    getStudyInstanceUID() {
        if (this.studyInstanceUID == null) {
            throw new Error('Null StudyInstanceUID')
        }
        return this.studyInstanceUID
    }


    setDeIdentifiedStudyInstanceUID(uid) {
        this.deIdentifiedStudyInstanceUID = uid;
    }

    setDeIdentifiedStudyInstanceUID(uid) {
        this.deIdentifiedStudyInstanceUID = uid;
    }

    setUploadVerified(isVerified) {
        this.uploadVerified = isVerified;
    }

    addInstance(dicomInstance) {
        if (!this.instanceExists(dicomInstance.SOPInstanceUID)) {
            this.instances[dicomInstance.SOPInstanceUID] = dicomInstance
        } else {
            throw Error("Existing instance")
        }
    }

    instanceExists(SOPInstanceUID) {
        let knownInstancesUID = Object.keys(this.instances)
        return knownInstancesUID.includes(SOPInstanceUID)
    }

    getInstance(instanceUID) {
        return this.instances[instanceUID]
    }

    getInstances() {
        return Object.values(this.instances)
    }

    getInstancesObject() {
        return this.instances
    }

    getInstancesSize() {
        return Object.keys(this.instances).length;
    }

    //TODO: it would make sense to introduce getWarning on Study level to deal with RT references
    async getWarnings() {
        let firstInstance = this.getInstances()[0]
        let dicomFile = new DicomFile(firstInstance.getFile())
        await dicomFile.readDicomFile()

        let warnings = {}
        // Check missing tags
        if ((dicomFile.getModality()) === undefined) {
            warnings[MISSING_TAG_00080060.key] = MISSING_TAG_00080060;
        } else {
            // if ((dicomFile._getDicomTag('00080021') === undefined) && (dicomFile._getDicomTag('00080022') === undefined)) {
            //     warnings[MISSING_TAG_00080022.key] = MISSING_TAG_00080022;
            // }
            // Check PT specific tags
            // if (this.modality === 'PT') {
            //
            // }
        }

        return warnings
    }
}