import DicomStudyVerificationMessages, { GENDER_IS_NOT_DEFINED, GENDER_IS_NOT_VALID } from "../../constants/DicomStudyVerificationMessages";
import DicomStudy from "../../model/DicomStudy";
import DicomStudyUploadSlotVerifier from "../../util/DicomStudyUploadSlotVerifier";

describe("DicomUploadSlotVerifier Test", () => {

    test("dicomUploadSlot can be null in the constructor", () => {
        const dicomStudy = new DicomStudy();
        const verifier = new DicomStudyUploadSlotVerifier(dicomStudy);

        expect(verifier).not.toBeNull();

        const result = verifier.getVerificationResult();
        expect(result).not.toBeNull();
    });

    describe('One of the constructor parameters is null', () => {
        const dummyStudyInstanceUID = 'DummyStudyInstanceUID';
        const dummyStudyDate = 'DummyStudyDate';
        const dummyStudyDescription = 'DummyStudyDescription';
        const dummyPatientID = 'dummyPatientID';
        const dummyPatientName = 'dummyPatientName';
        const dummyPatientBirthDate = 'dummyPatientBirthDate';
        const dummyPatientSex = 'dummyPatientSex';

        test("studyInstanceUID is null", () => {
            const dicomStudy = new DicomStudy(
                null,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientBirthDate,
                dummyPatientSex,
                dummyPatientName
            );

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy);

            expect(verifier).not.toBeNull();
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(DicomStudyVerificationMessages.StudyInstanceUID_IS_MISSING);

        });

        test("studyInstanceUID is an empty String", () => {
            const dicomStudy = new DicomStudy(
                '',
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientBirthDate,
                dummyPatientSex,
                dummyPatientName
            );

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy);

            expect(verifier).not.toBeNull();
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(DicomStudyVerificationMessages.StudyInstanceUID_IS_EMPTY);

        });

    });

    describe('Verify gender', () => {

        const dummyStudyInstanceUID = 'DummyStudyInstanceUID';
        const dummyStudyDate = 'DummyStudyDate';
        const dummyStudyDescription = 'DummyStudyDescription';
        const dummyPatientID = 'dummyPatientID';
        const dummyPatientName = 'dummyPatientName';
        const dummyPatientBirthDate = 'dummyPatientBirthDate';
        const dummyPatientSex = 'dummyPatientSex';

        test("upload slot subjectsex is not valid", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                dummyPatientBirthDate,
                "f"
            );

            const uploadSlot = { "subjectSex": "not valid" };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(`not valid ` + GENDER_IS_NOT_VALID);

        });

        test("gender in study is empty", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                dummyPatientBirthDate,
                ''
            );

            const uploadSlot = { "subjectSex": "f" };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(GENDER_IS_NOT_DEFINED);

        });

        test("subject gender does fit upload slot", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                dummyPatientBirthDate,
                "f"
            );

            const uploadSlot = { "subjectSex": "F" };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            console.log(result.errors);
            expect(result.errors.length).toBe(0);

        });

        test("subject gender does not fit upload slot", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                dummyPatientBirthDate,
                'm'
            );

            const uploadSlot = { "subjectSex": "F" };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(`Upload slot gender "F" is not equal to "M"`);

        });
    });

});