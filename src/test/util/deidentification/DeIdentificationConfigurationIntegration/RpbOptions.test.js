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
import DeIdentificationConfigurationFactory from '../../../../util/deidentification/DeIdentificationConfigurationFactory';
import DeIdentificationProfiles from './../../../../constants/DeIdentificationProfiles';
import DicomValueRepresentations from './../../../../constants/DicomValueRepresentations';
import { applyConfigAction } from './../DeIdentificationConfigurationFactory.test';

describe('RPB Profile Integration Test', () => {


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

    const profile = DeIdentificationProfiles.RPB_PROFILE;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    factory.addAdditionalDeIdentificationRelatedTags();
    const deIdentConfig = factory.getConfiguration();

    describe('Additional Attributs are set', () => {
        let emptyDict = {};

        test("PatientName and PatientId are set to PID", () => {
            deIdentConfig.addAdditionalTags(emptyDict);
            expect(emptyDict['00100010'].Value, 'PatientName is PID').toStrictEqual([dummyPid]);
            expect(emptyDict['00100020'].Value, 'PatientID is PID').toStrictEqual([dummyPid]);
        });

        test("Referring Physician's Name is ({studyEdcCode})-{subjectId}", () => {
            deIdentConfig.addAdditionalTags(emptyDict);
            expect(emptyDict['00080090'].Value, 'ReferringPhysicianName is ({studyEdcCode})-{subjectId}').toStrictEqual(['(' + dummyStudyEdcCode + ')-' + dummySubjectId]);
        });

        test("Clinical Trial Subject Module Attributes are set", () => {
            deIdentConfig.addAdditionalTags(emptyDict);
            expect(emptyDict['00120020'].Value, 'ClinicalTrialProtocolID is studyIdentifier').toStrictEqual([dummyStudyIdentifier]);
            expect(emptyDict['00120030'].Value, 'ClinicalTrialSiteID is siteIdentifier').toStrictEqual([dummySiteIdentifier]);
            expect(emptyDict['00120040'].Value, 'ClinicalTrialSubjectID is subjectId').toStrictEqual([dummySubjectId]);
        });

        describe('Existing Clinical Trial Subject Module are removed', () => {

            const dummyItemValue = 'dummyItemValue';
            let dict = {
                '00120010': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120020': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120021': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120030': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120031': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120040': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120060': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120081': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120082': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120086': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '00120087': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
            };

            test("Option ensures that Existing Clinical Trial Subject Module attributes will be removed.", () => {
                for (let key of Object.keys(dict)) {
                    applyConfigAction(deIdentConfig, dict, key, DicomValueRepresentations.LO);
                }
                expect(Object.keys(dict).length, '').toBe(0);
            })

        })

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
    });



})