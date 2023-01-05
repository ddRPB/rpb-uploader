/*
 * This file is part of RadPlanBio
 * 
 * Copyright (C) 2013 - 2022 RPB Team
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 */

import DeIdentificationCheckTypes from "../../../constants/deIdentificationConfigurationCheck/DeIdentificationCheckTypes";
import Modalities from '../../../constants/Modalities';
import DeIdentificationCheckHelper from '../../../util/verification/DeIdentificationCheckHelper';
import DicomSeries from "../../../model/DicomSeries";

describe('DeIdentificationCheckHelper', () => {
    const deIdentificationCheckHelper = new DeIdentificationCheckHelper({}, null);

    describe('Burned In Annotation', () => {
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

        const patientData = {};
        patientData.patientID = patientID;
        patientData.patientBirthDate = patientBirthDate;
        patientData.patientSex = patientSex;
        patientData.patientName = patientName;


        const parameters = new Map();
        parameters.set('BurnedInAnnotation', new Set(''));
        parameters.set('IdentityRemoved', new Set(''));


        const firstDicomSeries = new DicomSeries(
            seriesInstanceUID,
            seriesDate,
            seriesDescription,
            modality,
            studyInstanceUID,
            parameters,
            patientData,
        );

        const deIdentificationCheckConfiguration = {
            [DeIdentificationCheckTypes.BURNED_IN_ANNOTATION_IS_YES]: true,
            [DeIdentificationCheckTypes.ENCRYPTED_DATA_CHECK_IF_PATIENT_IDENTITY_REMOVED_IS_YES]: true,


        }

        test('Burned In Annotation is not set', () => {
            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: firstDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(0)
        });

        test('Burned In Annotation is NO', () => {
            const parametersTwo = new Map([...parameters]);
            parametersTwo.set('BurnedInAnnotation', new Set(['NO']));

            const secondDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                parametersTwo,
                patientData,
            );

            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: secondDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(0)
        });

        test('Burned In Annotation is YES', () => {
            const parametersTwo = new Map([...parameters]);
            parametersTwo.set('BurnedInAnnotation', 'YES');

            const secondDicomSeries = new DicomSeries(
                seriesInstanceUID,
                seriesDate,
                seriesDescription,
                modality,
                studyInstanceUID,
                parametersTwo,
                patientData,
            );

            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: secondDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(1);
            expect(result[0].title).toBe(DeIdentificationCheckTypes.BURNED_IN_ANNOTATION_IS_YES);
        });
    })
})