import path from 'path';
import DicomGenderEnum from '../../../constants/dicomValueEnums/DicomGenderEnum';
import SanityCheckCategories from '../../../constants/sanityCheck/SanityCheckCategory';
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

            let dicomStudy;
            let uploadSlot;
            let dicomStudyAnalyser;

            test.skip('Gender parameter is not defined in upload slot', () => {
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
                    'gender': null
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.NOT_DEFINED_IN_UPLOADSLOT,
                        SanityCheckCategories.uploadSlot,
                        `Gender is not defined in upload slot`,
                        SanityCheckSeverity.INFO,
                    )
                );


            });

            test.skip('Gender parameter is not defined in study', () => {
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
                    'gender': DicomGenderEnum.F
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.NOT_DEFINED_IN_STUDYPROPERTY,
                        SanityCheckCategories.uploadSlot,
                        `patientSex is not defined in study property`,
                        SanityCheckSeverity.INFO,
                    )
                );


            });

            test.skip('Gender parameter matches study parameter', () => {
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
                    'gender': DicomGenderEnum.O
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.MATCHES,
                        SanityCheckCategories.uploadSlot,
                        `Study property gender matches the upload slot definition`,
                        SanityCheckSeverity.INFO,
                    )
                );


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
                        SanityCheckCategories.uploadSlot,
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
                    'gender': DicomGenderEnum.O
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResult.CONFLICT,
                        SanityCheckCategories.uploadSlot,
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
                        SanityCheckCategories.uploadSlot,
                        `Gender property does not match the upload slot definition`,
                        SanityCheckSeverity.ERROR,)
                );


            });


        })


    })