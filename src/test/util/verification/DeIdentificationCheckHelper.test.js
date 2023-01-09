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
import DeIdentificationProfiles from "../../../constants/DeIdentificationProfiles";
import Modalities from '../../../constants/Modalities';
import DicomSeries from "../../../model/DicomSeries";
import DeIdentificationCheckHelper from '../../../util/verification/DeIdentificationCheckHelper';

describe('DeIdentificationCheckHelper', () => {
    const deIdentificationCheckHelper = new DeIdentificationCheckHelper(
        {
            deIdentificationProfileOption: [
                DeIdentificationProfiles.RETAIN_LONG_FULL_DATES,
                DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS,
                DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY,
                DeIdentificationProfiles.RPB_PROFILE,
            ]
        },
        null
    );

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

    const seriesDetails = {
        seriesInstanceUID,
        seriesDate,
        seriesDescription,
        modality,
        studyInstanceUID,
    }

    const availableDicomTags = new Map();

    const parameters = new Map();
    parameters.set('BurnedInAnnotation', new Set(''));
    parameters.set('IdentityRemoved', new Set(''));


    const firstDicomSeries = new DicomSeries(
        seriesDetails,
        patientData,
        parameters,
        availableDicomTags
    );

    const deIdentificationCheckConfiguration = {
        [DeIdentificationCheckTypes.BURNED_IN_ANNOTATION_IS_YES]: true,
        [DeIdentificationCheckTypes.ENCRYPTED_DATA_CHECK_IF_PATIENT_IDENTITY_REMOVED_IS_YES]: true,
    }

    describe('Burned In Annotation', () => {


        test('Burned In Annotation is not set', () => {
            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: firstDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(0)
        });

        test('Burned In Annotation is NO', () => {
            const parametersTwo = new Map([...parameters]);
            parametersTwo.set('BurnedInAnnotation', new Set(['NO']));

            const secondDicomSeries = new DicomSeries(
                seriesDetails,
                patientData,
                parameters,
                availableDicomTags,
            );

            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: secondDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(0)
        });

        test('Burned In Annotation is YES', () => {
            const parametersTwo = new Map([...parameters]);
            parametersTwo.set('BurnedInAnnotation', 'YES');

            const secondDicomSeries = new DicomSeries(
                seriesDetails,
                patientData,
                parametersTwo,
                availableDicomTags,
            );

            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: secondDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(1);
            expect(result[0].title).toBe(DeIdentificationCheckTypes.BURNED_IN_ANNOTATION_IS_YES);
        });
    });

    describe('Encrypted Data', () => {
        test('EncryptedAttributesSequence is not there', () => {
            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: firstDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(0)
        });

        test('EncryptedAttributesSequence is there', () => {
            const parametersTwo = new Map([...parameters]);
            parametersTwo.set('IdentityRemoved', true);

            const availableDicomTagsTwo = new Map();
            availableDicomTagsTwo.set('EncryptedAttributesSequence', true);

            const secondDicomSeries = new DicomSeries(
                seriesDetails,
                patientData,
                parametersTwo,
                availableDicomTagsTwo,
            );

            const result = deIdentificationCheckHelper.evaluateSeries({ seriesInstanceUID: secondDicomSeries }, deIdentificationCheckConfiguration);
            expect(result.length).toBe(1);
            expect(result[0].title).toBe(DeIdentificationCheckTypes.ENCRYPTED_DATA_CHECK_IF_PATIENT_IDENTITY_REMOVED_IS_YES);
        })
    });

})