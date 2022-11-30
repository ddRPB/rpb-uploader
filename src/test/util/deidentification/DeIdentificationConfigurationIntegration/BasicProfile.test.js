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
import DeIdentificationProfiles from '../../../../constants/DeIdentificationProfiles';
import YesNoEnum from '../../../../constants/dicomValueEnums/YesNoEnum';
import DicomValueRepresentations from '../../../../constants/DicomValueRepresentations';
import LongitudinalTemporalInformationModifiedAttribute from '../../../../constants/LongitudinalTemporalInformationModifiedAttribute';
import DeIdentificationConfigurationFactory from '../../../../util/deidentification/DeIdentificationConfigurationFactory';
import { applyConfigAction } from '../DeIdentificationConfigurationFactory.test';

describe('Basic Profile Integration Test', () => {


    const dummyPid = 'dummyPid';
    const dummySubjectId = 'dummy-subject-id';
    const dummyStudyEdcCode = 'dummy-edc-code';
    const dummyStudyIdentifier = 'dummy-study-identifier';
    const dummySiteIdentifier = 'dummy-site-identifier';

    const uploadSlot = {
        pid: dummyPid,
        subjectId: dummySubjectId,
        studyEdcCode: dummyStudyEdcCode,
        studyIdentifier: dummyStudyIdentifier,
        siteIdentifier: dummySiteIdentifier,
    };

    const profile = DeIdentificationProfiles.BASIC;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    factory.addAdditionalDeIdentificationRelatedTags();
    const deIdentConfig = factory.getConfiguration();

    describe('Specific tag groups are removed', () => {

        const dummyItemValue = 'dummyItemValue';
        // could create more examples of a range
        let dict = {
            // 50xx,xxxx example
            '50123456': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
            // 60xx,3000 example
            '60123000': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
            // 60xx,4000 example
            '60124000': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
        };

        test("Option ensures that the specific ranges will be removed.", () => {
            for (let key of Object.keys(dict)) {
                applyConfigAction(deIdentConfig, dict, key, DicomValueRepresentations.LO);
            }
            expect(Object.keys(dict).length, '').toBe(0);
        })

    })

    describe('Additional tags tests', () => {

        let dict = {};
        deIdentConfig.addAdditionalTags(dict);

        test('PatientIdentityRemoved is set to yes', () => {
            expect(dict['00120062'].Value).toStrictEqual([YesNoEnum.YES]);
        })
        test('LongitudinalTemporalInformationModified is set to removed', () => {
            expect(dict['00280303'].Value).toStrictEqual([LongitudinalTemporalInformationModifiedAttribute.REMOVED]);
        })
    })


})