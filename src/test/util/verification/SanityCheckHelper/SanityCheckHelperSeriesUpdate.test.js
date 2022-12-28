

import DicomGenderEnum from '../../../../constants/dicomValueEnums/DicomGenderEnum';
import Modalities from '../../../../constants/Modalities';
import SanityCheckResult from '../../../../constants/sanityCheck/SanityCheckResult';
import SanityCheckSeverity from '../../../../constants/sanityCheck/SanityCheckSeverity';
import SanityCheckTypes from '../../../../constants/sanityCheck/SanityCheckTypes';
import DicomSeries from '../../../../model/DicomSeries';
import DicomStudy from '../../../../model/DicomStudy';
import EvaluationResultItem from '../../../../util/verification/EvaluationResultItem';
import SanityCheckHelper from '../../../../util/verification/SanityCheckHelper';

describe('SanityCheckHelper update sanitity check results, based on series data', () => {

    const sanityCheckConfiguration = {
        replacementDates: ['19000101'],
    };
    const studyInstanceUID = 'dummyStudyInstanceUID';
    const seriesInstanceUID = 'dummySeriesInstanceUID';
    const studyDate = '20020202';
    const seriesDate = '20020202';
    const studyDescription = 'dummyStudyDescription';
    const seriesDescription = 'dummySeriesDescription';
    const modality = Modalities.CT;
    const patientID = 'dummyPatientID';
    const patientSex = 'dummyPatientSex';
    const patientName = 'dummyPatientName';
    const patientBirthDate = '19000101';
    const dummyUploadSlotBirthDate = '19000101';

    describe('Gender', () => {
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

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);
        })

        test('Gender parameter of the series is \"other\"', () => {
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

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.O,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);
        })

        test('Gender parameter is not defined in the series', () => {
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

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: '',
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);
        })

        test('Gender parameter matches the series parameter', () => {
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

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);
        })

        test('Series have different gender parameter, one matches the upload slot parameter', () => {
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
                'gender': DicomGenderEnum.M
            };

            const firstDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            const secondDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.M,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries, secondDicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(2);
            expect(result[1]).toMatchObject(
                new EvaluationResultItem(
                    SanityCheckResult.ONE_MATCHES,
                    SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
                    `Gender is inconsistent and one value matches the upload slot definition. ${DicomGenderEnum.F} / ${DicomGenderEnum.M} - ${DicomGenderEnum.M}`,
                    SanityCheckSeverity.WARNING,
                )
            );
        })

        test('Series gender parameter does not match the upload slot parameter', () => {
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
                'gender': DicomGenderEnum.M
            };

            const firstDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(1);
            expect(result[0]).toMatchObject(
                new EvaluationResultItem(
                    SanityCheckResult.CONFLICT,
                    SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
                    `Gender does not match the upload slot definition. ${DicomGenderEnum.F} - ${DicomGenderEnum.M}`,
                    SanityCheckSeverity.ERROR,
                )
            );
        })



        test('Series have different gender parameter, no one matches the upload slot parameter', () => {
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
                'gender': DicomGenderEnum.M
            };

            const firstDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            const secondDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.O,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries, secondDicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(2);
            expect(result[1]).toMatchObject(
                new EvaluationResultItem(
                    SanityCheckResult.CONFLICT,
                    SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
                    `Gender does not match the upload slot definition. ${DicomGenderEnum.F} / ${DicomGenderEnum.O} - ${DicomGenderEnum.M}`,
                    SanityCheckSeverity.ERROR,
                )
            );
        })

    });

    describe('Date of birth', () => {
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

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

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

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);

        })

        test('Date of birth is not defined in series', () => {
            dicomStudy = new DicomStudy(
                studyInstanceUID,
                studyDate,
                studyDescription,
                patientID,
                patientName,
                '19700101',
                patientSex
            );

            uploadSlot = {
                'dob': '1980-02-02',
                'yob': null,
                'gender': null
            };

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);
        })

        test('Series date of birth is a replacement', () => {
            dicomStudy = new DicomStudy(
                studyInstanceUID,
                studyDate,
                studyDescription,
                patientID,
                patientName,
                '19700101',
                patientSex
            );

            uploadSlot = {
                'dob': '1980-02-02',
                'yob': null,
                'gender': null
            };

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19000101',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);

        })

        test('Series date of birth matches upload slot definition', () => {
            dicomStudy = new DicomStudy(
                studyInstanceUID,
                studyDate,
                studyDescription,
                patientID,
                patientName,
                "19700101",
                patientSex
            );

            uploadSlot = {
                'dob': '1980-02-02',
                'yob': null,
                'gender': null
            };

            const dicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800202',
                    patientSex: DicomGenderEnum.F,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

            expect(result.length).toBe(0);

        })

        test('One of the study dates of birth matches upload slot definition', () => {
            dicomStudy = new DicomStudy(
                studyInstanceUID,
                studyDate,
                studyDescription,
                patientID,
                patientName,
                "19700101",
                patientSex
            );

            uploadSlot = {
                'dob': '1980-02-02',
                'yob': null,
                'gender': null
            };

            const firstDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800202',
                    patientSex: DicomGenderEnum.O,
                    patientName: patientName
                }

            );

            const secondDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19700101',
                    patientSex: DicomGenderEnum.O,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries, secondDicomSeries], sanityCheckConfiguration);


            expect(result.length).toBe(2);
            expect(result[1]).toMatchObject(
                new EvaluationResultItem(
                    SanityCheckResult.ONE_MATCHES,
                    SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
                    `One of the birth dates matches upload slot definition`,
                    SanityCheckSeverity.WARNING,
                )
            );

        })

        test('Series date of birth does not match the upload slot definition', () => {
            dicomStudy = new DicomStudy(
                studyInstanceUID,
                studyDate,
                studyDescription,
                patientID,
                patientName,
                "19700101",
                patientSex
            );

            uploadSlot = {
                'dob': '1980-02-02',
                'yob': null,
                'gender': null
            };

            const firstDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19700101',
                    patientSex: DicomGenderEnum.O,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries], sanityCheckConfiguration);


            expect(result.length).toBe(1);
            expect(result[0]).toMatchObject(
                new EvaluationResultItem(
                    SanityCheckResult.CONFLICT,
                    SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
                    `Date of birth property does not match the upload slot definition`,
                    SanityCheckSeverity.ERROR,
                )
            );

        })

        test('No one of the series dates of birth matches upload slot definition', () => {
            dicomStudy = new DicomStudy(
                studyInstanceUID,
                studyDate,
                studyDescription,
                patientID,
                patientName,
                "19700101",
                patientSex
            );

            uploadSlot = {
                'dob': '1980-02-02',
                'yob': null,
                'gender': null
            };

            const firstDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19800101',
                    patientSex: DicomGenderEnum.O,
                    patientName: patientName
                }

            );

            const secondDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                null,
                {
                    patientID: patientID,
                    patientBirthDate: '19700101',
                    patientSex: DicomGenderEnum.O,
                    patientName: patientName
                }

            );

            sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
            sanityCheckHelper.getUploadSlotEvaluationResults();
            let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries, secondDicomSeries], sanityCheckConfiguration);


            expect(result.length).toBe(2);
            expect(result[1]).toMatchObject(
                new EvaluationResultItem(
                    SanityCheckResult.CONFLICT,
                    SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
                    `Date of birth property does not match the upload slot definition`,
                    SanityCheckSeverity.ERROR,
                )
            );

        })

    });

});