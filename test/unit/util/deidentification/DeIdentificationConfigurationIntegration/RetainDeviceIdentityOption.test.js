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

import DeIdentificationProfileCodes from '../../../../../src/constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes';
import DeIdentificationProfileCodesMeaning from '../../../../../src/constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning';
import YesNoEnum from '../../../../../src/constants/dicomValueEnums/YesNoEnum';
import LongitudinalTemporalInformationModifiedAttribute from '../../../../../src/constants/LongitudinalTemporalInformationModifiedAttribute';
import DeIdentificationConfigurationFactory from '../../../../../src/util/deidentification/DeIdentificationConfigurationFactory';
import DeIdentificationProfiles from './../../../../../src/constants/DeIdentificationProfiles';
import DicomValueRepresentations from './../../../../../src/constants/DicomValueRepresentations';
import { applyConfigAction } from './../DeIdentificationConfigurationFactory.test';

describe('Retain Device Identity Option Integration Test', () => {
    const dummyPid = 'dummyPid';
    const dummySubjectId = 'dummy-subject-id';
    const dummyStudyEdcCode = 'dummy-edc-code';

    const uploadSlot = {
        studyEdcCode: dummyStudyEdcCode,
        subjectId: dummySubjectId,
        pid: dummyPid
    };

    const profile = DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    factory.addAdditionalDeIdentificationRelatedTags();
    const deIdentConfig = factory.getConfiguration();
    const dummyItemValue = 'dummyValue';

    let dict = {
        '300C0127': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0014407E': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181203': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0014407C': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181007': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181200': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0018700C': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181202': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0018700A': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00500020': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '3010002D': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181000': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181002': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181008': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181005': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0016004F': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00160050': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00160051': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0016004E': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0018100B': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '30100043': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00203401': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '04000563': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00400241': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00404030': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00400242': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00404028': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181004': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00400011': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00400001': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00404027': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00400010': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00404025': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00321020': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00321021': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '300A0216': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '30080105': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00081010': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181201': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0018700E': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00185011': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '300A00B2': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '0018100A': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00181009': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00189371': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00189373': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
        '00189367': { Value: dummyItemValue, vr: DicomValueRepresentations.DT },
    };

    test("Option ensures that the specific values will be keeped.", () => {
        for (let key of Object.keys(dict)) {
            applyConfigAction(deIdentConfig, dict, key, DicomValueRepresentations.DT);
            expect(dict[key].Value, `Value of ${key} should be keeped`).toBe(dummyItemValue);
        }
    })

    test("Additional tags will indicate that the option is used on the data set", () => {
        // Patient Identity Removed Attribute
        expect(deIdentConfig.additionalTagValuesMap.get('00120062'), 'Patient Identity removed - should be YES').toBe(YesNoEnum.YES);
        // De-identification Method Attribute
        expect(deIdentConfig.additionalTagValuesMap.get('00120063'), 'addtional 00120063 tag').toBe('Per DICOM PS 3.15 AnnexE. RPB-Uploader v1.0');
        // De-identification Method Code Sequence Attribute
        const usedMethods = deIdentConfig.additionalTagValuesMap.get('00120064')
        expect(usedMethods.length, 'Value should be 2.').toBe(2);
        const lastMethod = usedMethods[1];
        // Coding Scheme Designator Attribute
        expect(lastMethod['00080100'].Value, `00080100 - should be ${DeIdentificationProfileCodes.RETAIN_DEVICE_IDENTITY}`)
            .toEqual([DeIdentificationProfileCodes.RETAIN_DEVICE_IDENTITY]);
        expect(lastMethod['00080102'].Value, `00080102 - should be DCM`).toEqual(['DCM']);
        expect(lastMethod['00080104'].Value, `00080104 - should be ${DeIdentificationProfileCodesMeaning.RETAIN_DEVICE_IDENTITY}`)
            .toEqual([DeIdentificationProfileCodesMeaning.RETAIN_DEVICE_IDENTITY]);
    })

    describe('Additional tags tests', () => {

        let dict = {};
        deIdentConfig.addAdditionalTags(dict);

        test('PatientIdentityRemoved is set to yes', () => {
            expect(dict['00120062'].Value).toStrictEqual([YesNoEnum.YES]);
        })
        test('LongitudinalTemporalInformationModified is set to unmodified', () => {
            expect(dict['00280303'].Value).toStrictEqual([LongitudinalTemporalInformationModifiedAttribute.REMOVED]);
        })
    })

});

describe('Retain Device Identity Option Plus RPB Modifications Integration Test', () => {
    const dummyPid = 'dummyPid';
    const dummySubjectId = 'dummy-subject-id';
    const dummyStudyEdcCode = 'dummy-edc-code';

    const uploadSlot = {
        studyEdcCode: dummyStudyEdcCode,
        subjectId: dummySubjectId,
        pid: dummyPid
    };

    const profile = [DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY, DeIdentificationProfiles.RPB_PROFILE];
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    factory.addAdditionalDeIdentificationRelatedTags();
    const deIdentConfig = factory.getConfiguration();
    const dummyUid = 'dummyUid';

    let dict = {
        '00181002': { Value: dummyUid, vr: DicomValueRepresentations.DT },
    };

    test("Specific UID will be replaced.", () => {
        for (let key of Object.keys(dict)) {
            applyConfigAction(deIdentConfig, dict, key, DicomValueRepresentations.DT);
            expect(dict[key].Value, `Value of ${key} should be keeped`).toBe('dummyReplacementUid');
        }
    })

});