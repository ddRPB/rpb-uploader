import path from 'path';
import DicomGenderEnum from '../../../constants/dicomValueEnums/DicomGenderEnum';
import SanityCheckCategories from '../../../constants/sanitityChecks/SanityChecksCategories';
import SanityCheckResults from '../../../constants/sanitityChecks/SanityCheckResults';
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
                    'no-gender': 'abc'
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResults.NOT_DEFINED_IN_UPLOADSLOT,
                        SanityCheckCategories.uploadSlot,
                        `Gender is not defined in upload slot`,
                        'Info'
                    )
                );


            });

            test('Gender parameter is not defined in study', () => {
                dicomStudy = new DicomStudy(
                    studyInstanceUID,
                    studyDate,
                    studyDescription,
                    patientID,
                    patientName,
                    patientBirthDate,
                    undefined
                );

                uploadSlot = {
                    'gender': DicomGenderEnum.F
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResults.NOT_DEFINED_IN_STUDYPROPERTY,
                        SanityCheckCategories.uploadSlot,
                        `patientSex is not defined in study property`,
                        'Info'
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
                    'gender': DicomGenderEnum.O
                };

                dicomStudyAnalyser = new DicomStudyAnalyser(dicomStudy, uploadSlot);
                let result = dicomStudyAnalyser.getUploadSlotEvaluationResults();

                expect(result.length).toBe(1);
                expect(result[0]).toMatchObject(
                    new EvaluationResultItem(
                        SanityCheckResults.MATCHES,
                        SanityCheckCategories.uploadSlot,
                        `Study property gender matches the upload slot definition`,
                        'Info'
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
                        SanityCheckResults.ONE_MATCHES,
                        SanityCheckCategories.uploadSlot,
                        `One gender property matches the upload slot definition`,
                        'Warning'
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
                        SanityCheckResults.CONFLICT,
                        SanityCheckCategories.uploadSlot,
                        `Gender property does not match the upload slot definition`,
                        'Error'
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
                        SanityCheckResults.CONFLICT,
                        SanityCheckCategories.uploadSlot,
                        `Gender property does not match the upload slot definition`,
                        'Error'
                    )
                );


            });


        })


    })