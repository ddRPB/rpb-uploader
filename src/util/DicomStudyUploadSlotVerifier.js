import DicomStudyVerificationMessages, { GENDER_IS_NOT_DEFINED, GENDER_IS_NOT_VALID } from "../constants/DicomStudyVerificationMessages";

export default class DicomStudyUploadSlotVerifier {

    constructor(dicomStudy, dicomUploadSlot) {
        this.dicomStudy = dicomStudy;
        dicomUploadSlot != null ? this.dicomUploadSlot = dicomUploadSlot : this.dicomUploadSlot = {};
        this.result = { errors: [], warnings: [] };

        this.femaleEquivalents = ['f', 'female']
        this.maleEquivalents = ['m', 'male']
    }

    getVerificationResult() {
        this.result.errors = [];
        this.result.warnings = [];

        if (this.dicomStudy.studyInstanceUID === null) {
            this.result.errors.push(DicomStudyVerificationMessages.StudyInstanceUID_IS_MISSING)
        } else {
            if (this.dicomStudy.studyInstanceUID === "") this.result.errors.push(DicomStudyVerificationMessages.StudyInstanceUID_IS_EMPTY);
        };

        if ('subjectSex' in this.dicomUploadSlot) {
            const uploadSlotGender = this.dicomUploadSlot.subjectSex.toUpperCase();
            const studyPatientSex = this.dicomStudy.getPatientSex().toUpperCase();

            if (!(uploadSlotGender === 'F' || uploadSlotGender === 'M')) { this.result.errors.push(`${this.dicomUploadSlot.subjectSex} ` + GENDER_IS_NOT_VALID) }
            if (studyPatientSex === '') { this.result.errors.push(GENDER_IS_NOT_DEFINED) }
            else {
                if (uploadSlotGender != studyPatientSex) {
                    this.result.errors.push(`Upload slot gender "${this.dicomUploadSlot.subjectSex}" is not equal to "${this.dicomStudy.getPatientSex()}"`);
                }
            }

        };

        return this.result;

    }
}