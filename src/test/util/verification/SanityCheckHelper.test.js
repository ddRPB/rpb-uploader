import path from 'path';
import DicomGenderEnum from '../../../constants/dicomValueEnums/DicomGenderEnum';
import SanityCheckCategory from '../../../constants/sanityCheck/SanityCheckCategory';
import SanityCheckResult from '../../../constants/sanityCheck/SanityCheckResult';
import SanityCheckSeverity from '../../../constants/sanityCheck/SanityCheckSeverity';
import SanityCheckTypes from '../../../constants/sanityCheck/SanityCheckTypes';
import DicomStudy from '../../../model/DicomStudy';
import EvaluationResultItem from '../../../util/verification/EvaluationResultItem';
import SanityCheckHelper from '../../../util/verification/SanityCheckHelper';

// const dicomTestFilesDataPath = path.join(__dirname, './../../data');
const dicomTestFilesDataPath = path.join(__dirname, './../../data/ctDicomFile.dcm');
const sanityCheckConfiguration = {};

describe('SanityCheckHelper',
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
            let sanityCheckHelper;

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);
            });

            test('Gender parameter of the study is \"other\"', () => {
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
                    'gender': DicomGenderEnum.F
                };

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);
            });

            test('Gender parameter matches study parameter', () => {
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
                    'gender': DicomGenderEnum.F
                };

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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
                    DicomGenderEnum.F
                );

                uploadSlot = {
                    'dob': null,
                    'yob': null,
                    'gender': DicomGenderEnum.M
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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.ONE_MATCHES,
                        SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
                        `Gender is inconsistent and one value matches the upload slot definition. ${DicomGenderEnum.F} / ${DicomGenderEnum.M} - ${DicomGenderEnum.M}`,
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
                    'gender': DicomGenderEnum.M
                };

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.CONFLICT,
                        SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
                        `Gender does not match the upload slot definition. ${DicomGenderEnum.F} - ${DicomGenderEnum.M}`,
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
                    'gender': DicomGenderEnum.M
                };

                dicomStudy.addStudy(
                    new DicomStudy(
                        studyInstanceUID,
                        studyDate,
                        studyDescription,
                        patientID,
                        patientName,
                        patientBirthDate,
                        DicomGenderEnum.O
                    )
                )

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.CONFLICT,
                        SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
                        `Gender does not match the upload slot definition. ${DicomGenderEnum.F} / ${DicomGenderEnum.O} - ${DicomGenderEnum.M}`,
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
            let sanityCheckHelper;

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);
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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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


                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

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

        describe('Year of Birth', () => {
            const studyInstanceUID = 'dummyStudyInstanceUID';
            const studyDate = 'dummyStudyDate';
            const studyDescription = 'dummyStudyDescription';
            const patientID = 'dummyPatientID';
            const patientSex = 'dummyPatientSex';
            const patientName = 'dummyPatientName';
            const patientBirthDate = '19000101';

            let dicomStudy;
            let uploadSlot;
            let sanityCheckHelper;

            test('Upload Slot YoB is null', () => {
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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('Upload Slot YOB is a replacement date', () => {
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
                    'yob': '1900',
                    'gender': null
                };

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('Study YOB is a replacement date', () => {
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
                    'yob': '1985',
                    'gender': null
                };

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('Study year of birth matches upload slot definition', () => {
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
                    'dob': null,
                    'yob': '1980',
                    'gender': null
                };

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(0);

            })

            test('One of the study year of birth matches upload slot definition', () => {
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
                    'dob': null,
                    'yob': '1980',
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

                sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
                let result = sanityCheckHelper.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.ONE_MATCHES,
                        SanityCheckCategory.uploadSlot,
                        `One of the study birth years matches upload slot definition`,
                        SanityCheckSeverity.WARNING,
                    )
                );
            })


        })


    })