import DicomStudyVerificationMessages, { GENDER_IS_NOT_DEFINED, GENDER_IS_NOT_VALID } from "../../constants/DicomStudyVerificationMessages";
import DicomStudy from "../../model/DicomStudy";
import DicomStudyUploadSlotVerifier from "../../util/DicomStudyUploadSlotVerifier";

describe("DicomUploadSlotVerifier Tests", () => {

    test.skip("dicomUploadSlot can be null in the constructor", () => {
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

        test.skip("studyInstanceUID is null", () => {
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

        test.skip("studyInstanceUID is an empty String", () => {
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

        test.skip("upload slot subjectsex is not valid", () => {
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

        test.skip("gender in study is empty", () => {
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

        test.skip("subject gender does fit upload slot", () => {
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

        test.skip("subject gender does not fit upload slot", () => {
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

    describe('Verify birthdate', () => {

        const dummyStudyInstanceUID = 'DummyStudyInstanceUID';
        const dummyStudyDate = 'DummyStudyDate';
        const dummyStudyDescription = 'DummyStudyDescription';
        const dummyPatientID = 'dummyPatientID';
        const dummyPatientName = 'dummyPatientName';
        const dummyPatientBirthDate = '20021130';
        const dummyPatientSex = 'dummyPatientSex';

        test.skip("upload slot birth date is empty", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                dummyPatientBirthDate,
                dummyPatientSex
            );

            const uploadSlotDobString = "";
            const uploadSlot = { "subjectDOB": uploadSlotDobString };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(`Parsing DicomSlot date of birth failed: Can not read '${uploadSlotDobString}' as date. Expect 'yyyy-MM-dd' format.`);
        });

        test.skip("upload slot birth date is not valid", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                dummyPatientBirthDate,
                dummyPatientSex
            );

            const uploadSlotDobString = 'abc'
            const uploadSlot = { "subjectDOB": uploadSlotDobString };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(`Parsing DicomSlot date of birth failed: Can not read '${uploadSlotDobString}' as date. Expect 'yyyy-MM-dd' format.`);

        });

        test.skip("dicom file birth date is empty", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                '',
                dummyPatientSex
            );

            const uploadSlotDobString = '19000101';
            const uploadSlot = { "subjectDOB": uploadSlotDobString };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(`Parsing the date of birth from Dicom file failed: Can not read '' as date. Expect 'yyyyMMdd' format.`);

        });

        test.skip("dicom file birth date is not valid", () => {
            const invalidBirthDate = '2013010a1';

            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                invalidBirthDate,
                dummyPatientSex
            );

            // const subjectDOB = '01-01-1900'
            const subjectDOB = '1900-01-01'
            const uploadSlot = { "subjectDOB": subjectDOB };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            expect(result.errors).toContain(`Parsing the date of birth from Dicom file failed: Can not read '${invalidBirthDate}' as date. Expect 'yyyyMMdd' format.`);

        });

        test.skip("birth dates are the same", () => {
            const dicomStudy = new DicomStudy(
                dummyStudyInstanceUID,
                dummyStudyDate,
                dummyStudyDescription,
                dummyPatientID,
                dummyPatientName,
                '20020130',
                dummyPatientSex
            );

            const subjectDOB = '2002-01-30'
            const uploadSlot = { "subjectDOB": subjectDOB };

            const verifier = new DicomStudyUploadSlotVerifier(dicomStudy, uploadSlot);
            const result = verifier.getVerificationResult();

            console.log(result.errors);
            expect(result.errors.length).toBe(0);

        });


    })

});