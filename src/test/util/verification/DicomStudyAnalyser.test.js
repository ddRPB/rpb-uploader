import path from 'path';
import DicomGenderEnum from '../../../constants/dicomValueEnums/DicomGenderEnum';
import SanityCheckCategory from '../../../constants/sanityCheck/SanityCheckCategory';
import SanityCheckResult from '../../../constants/sanityCheck/SanityCheckResult';
import SanityCheckSeverity from '../../../constants/sanityCheck/SanityCheckSeverity';
import DicomStudy from '../../../model/DicomStudy';
import DicomStudyAnalyser from '../../../util/verification/DicomStudyAnalyser';
import EvaluationResultItem from '../../../util/verification/EvaluationResultItem';

// const dicomTestFilesDataPath = path.join(__dirname, './../../data');
const dicomTestFilesDataPath = path.join(__dirname, './../../data/ctDicomFile.dcm');

describe('DicomStudyAnalyser',
    () => {
        describe('Gender', () => {
            const studyInstanceUID = 'dummyStudyInstanceUID';
            const studyDate = 'dummyStudyDate';
            const studyDescription = 'dummyStudyDescription';
            const patientID = 'dummyPatientID';
            const patientSex = 'dummyPatientSex';
            const patientName = 'dummyPatientName';
            const patientBirthDate = '19000101';
            const dummyUploadSlotBirthDate = '19000101';

            let dicomStudy;
            let uploadSlot;
            let dicomStudyAnalyser;

            test('Gender parameter is not defined in upload slot', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    patientSex
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);
            });

            test('Gender parameter is not defined in study', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    null
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': DicomGenderEnum.F
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.NOT_DEFINED_IN_STUDYPROPERTY,
                        SanityCheckCategory.uploadSlot,
                        `patientSex is not defined in study property`,
                        SanityCheckSeverity.WARNING,
                    )
                );
            });

            test('Gender parameter matches study parameter', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    DicomGenderEnum.O
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': DicomGenderEnum.O
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);
            });

            test('Study has different gender parameter, one matches the upload slot parameter', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    DicomGenderEnum.O
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': DicomGenderEnum.O
                };

                dicomStudy.addStudy(
                    new DicomStudy(
                        studyInstanceUID,
                        studyDate,
                        studyDescription,
                        patientID,
                        patientName,
                        patientBirthDate,
                        DicomGenderEnum.F
                    )
                )

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.ONE_MATCHES,
                        SanityCheckCategory.uploadSlot,
                        `One gender property matches the upload slot definition`,
                        SanityCheckSeverity.WARNING,
                    )
                );
            });

            test('Study parameter does not match the upload slot parameter', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    DicomGenderEnum.F
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': DicomGenderEnum.O
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.CONFLICT,
                        SanityCheckCategory.uploadSlot,
                        `Gender property does not match the upload slot definition`,
                        SanityCheckSeverity.ERROR,
                    )
                );
            });

            test('No one of the two different Study parameters matches the upload slot parameter', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    DicomGenderEnum.F
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': DicomGenderEnum.O
                };

                dicomStudy.addStudy(
                    new DicomStudy(
                        studyInstanceUID,
                        studyDate,
                        studyDescription,
                        patientID,
                        patientName,
                        patientBirthDate,
                        DicomGenderEnum.M
                    )
                )

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.CONFLICT,
                        SanityCheckCategory.uploadSlot,
                        `Gender property does not match the upload slot definition`,
                        SanityCheckSeverity.ERROR,)
                );
            });

        });

        describe('Date of Birth', () => {
            const studyInstanceUID = 'dummyStudyInstanceUID';
            const studyDate = 'dummyStudyDate';
            const studyDescription = 'dummyStudyDescription';
            const patientID = 'dummyPatientID';
            const patientSex = 'dummyPatientSex';
            const patientName = 'dummyPatientName';
            const patientBirthDate = '19000101';

            let dicomStudy;
            let uploadSlot;
            let dicomStudyAnalyser;

            test('Upload Slot DOB is null', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    patientSex
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('Upload Slot DOB is replacement date', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    patientSex
                );

                uploadSlot = {
                    'dob': '1900-01-01',
                    'yob': null,
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('Date of birth is not defined in study', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    "",
                    patientSex
                );

                uploadSlot = {
                    'dob': '1980-02-02',
                    'yob': null,
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);

                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.NOT_DEFINED_IN_STUDYPROPERTY,
                        SanityCheckCategory.uploadSlot,
                        `Date of birth is not defined in study property`,
                        SanityCheckSeverity.WARNING,
                    ));
            })

            test('Study date of birth is a replacement', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    "19000101",
                    patientSex
                );

                uploadSlot = {
                    'dob': '1980-02-02',
                    'yob': null,
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('Study date of birth matches upload slot definition', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    "19800202",
                    patientSex
                );

                uploadSlot = {
                    'dob': '1980-02-02',
                    'yob': null,
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('One of the study dates of birth matches upload slot definition', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    "19800202",
                    patientSex
                );

                uploadSlot = {
                    'dob': '1980-02-02',
                    'yob': null,
                    'gender': null
                };

                dicomStudy.addStudy(
                    new DicomStudy(
                        studyInstanceUID,
                        studyDate,
                        studyDescription,
                        patientID,
                        patientName,
                        "19850505",
                        patientSex
                    ));


                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.ONE_MATCHES,
                        SanityCheckCategory.uploadSlot,
                        `One of the study birth dates matches upload slot definition`,
                        SanityCheckSeverity.WARNING,
                    )
                );

            })

            test('Study date of birth does not match the upload slot definition', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    "19750505",
                    patientSex
                );

                uploadSlot = {
                    'dob': '1980-02-02',
                    'yob': null,
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.CONFLICT,
                        SanityCheckCategory.uploadSlot,
                        `Study date of birth property does not match the upload slot definition`,
                        SanityCheckSeverity.ERROR,
                    )
                );

            })

            test('No one study date of birth does not match the upload slot definition', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    "19750505",
                    patientSex
                );

                uploadSlot = {
                    'dob': '1980-02-02',
                    'yob': null,
                    'gender': null
                };

                dicomStudy.addStudy(
                    new DicomStudy(
                        studyInstanceUID,
                        studyDate,
                        studyDescription,
                        patientID,
                        patientName,
                        "19850505",
                        patientSex
                    ));

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.CONFLICT,
                        SanityCheckCategory.uploadSlot,
                        `Study date of birth property does not match the upload slot definition`,
                        SanityCheckSeverity.ERROR,
                    )
                );

            })

        });


    })