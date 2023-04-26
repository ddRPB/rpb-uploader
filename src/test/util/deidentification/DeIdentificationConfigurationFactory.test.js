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

import DeIdentificationActionCodes from "../../../constants/DeIdentificationActionCodes";
import DeIdentificationProfiles from "../../../constants/DeIdentificationProfiles";
import DeidentificationProfileCodes from "../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes";
import DeIdentificationProfileCodesMeaning from "../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning";
import YesNoEnum from "../../../constants/dicomValueEnums/YesNoEnum";
import DicomValueRepresentations from "../../../constants/DicomValueRepresentations";
import DeIdentificationConfigurationFactory from "../../../util/deidentification/DeIdentificationConfigurationFactory";

describe('Test DeIdentificationConfigurationFactory', () => {
    const dummyPid = 'dummyPid';
    const dummySubjectId = 'dummy-subject-id';
    const dummyStudyEdcCode = 'dummy-edc-code';

    const uploadSlot = {
        studyEdcCode: dummyStudyEdcCode,
        subjectId: dummySubjectId,
        pid: dummyPid
    };

    describe('Basic Tests', () => {

        test("Unknown profile throws", () => {
            const unknownProfile = 'unknown';
            expect(() => { new DeIdentificationConfigurationFactory(unknownProfile, uploadSlot); }).toThrow();
        })

        test("Basic profile works", () => {
            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            expect(factory).not.toBeNull();
        })

        test.skip("Retail Long Full Dates Option profile works", () => {
            const profile = DeIdentificationProfiles.RETAIN_LONG_FULL_DATES;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            expect(factory).not.toBeNull();
        })

        test.skip("Retain Patient Characteristics Option profile works", () => {
            const profile = DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            expect(factory).not.toBeNull();
        })

        test("Retain Device Identity Option profile works", () => {
            const profile = DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            expect(factory).not.toBeNull();
        })
    })

    describe('Test Basic Profile', () => {
        test("Basic profile creates valid DeIdentificationConfiguration instance", () => {
            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            expect(deIdentConfig).not.toBeNull();
            expect(deIdentConfig.getConfigurationMap().size).toBeGreaterThan(0);

        })

        test("some example Basic profile action codes", () => {
            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            const configurationMap = deIdentConfig.getConfigurationMap();

            expect(configurationMap.get('00080050')).toStrictEqual({ action: 'Z' });
            expect(configurationMap.get('0008002A')).toStrictEqual({ action: 'X' });
            expect(configurationMap.get('00080023')).toStrictEqual({ action: 'D' });
            expect(configurationMap.get('00209164')).toStrictEqual({ action: 'U' });
        })

        test("extra RPB profile action codes", () => {
            const dummyItemValue = 'dummyValue';
            const profile = DeIdentificationProfiles.RPB_PROFILE;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            const configurationMap = deIdentConfig.getConfigurationMap();

            expect(configurationMap.get('00081030')).toStrictEqual({ action: 'KP' });
            expect(configurationMap.get('0008103E')).toStrictEqual({ action: 'KP' });

            let dict = {
                '00080090': { Value: dummyItemValue, vr: DicomValueRepresentations.PN },
                '00081030': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
                '0008103E': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
            };

            applyConfigAction(deIdentConfig, dict, '00080090', 'PN');
            applyConfigAction(deIdentConfig, dict, '00081030', 'LO');
            applyConfigAction(deIdentConfig, dict, '0008103E', 'LO');

            deIdentConfig.addAdditionalTags(dict);

            expect(dict['00080090'].Value).toStrictEqual(['(' + dummyStudyEdcCode + ')-' + dummySubjectId]);
            expect(dict['00081030'].Value).toStrictEqual('(' + dummyStudyEdcCode + ')-' + dummyItemValue);
            expect(dict['0008103E'].Value).toStrictEqual('(' + dummyStudyEdcCode + ')-' + dummyItemValue);
        })

    })

    describe('Special case handling in RETAIN_SAFE_PRIVATE_OPTION', () => {

        describe('KEEP_PRIVATE_TAGS case', () => {

            describe('DeIdentificationConfiguration changes implementation tests', () => {
                test('Does no change if the RETAIN_PATIENT_CHARACTERISTICS profile is not active', () => {
                    const profile = [DeIdentificationProfiles.RPB_PROFILE];
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.3.46.670589.33.1.4.1' },
                        dict: { '08002000': 'dummyItem' }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'X' });

                    const additionalTagValuesMap = modifiedDeIdentConfig.additionalTagValuesMap;
                    const deIdentificationStepsArray = additionalTagValuesMap.get('00120064');

                    expect(deIdentificationStepsArray.length).toBe(1);
                })

                test('Changes the configuration for private tags and add the RETAIN_PATIENT_CHARACTERISTICS profile', () => {
                    const profile = [DeIdentificationProfiles.RPB_PROFILE, DeIdentificationProfiles.RETAIN_SAFE_PRIVATE_OPTION];
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.3.46.670589.33.1.4.1' },
                        dict: { '08002000': 'dummyItem' }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });

                    const additionalTagValuesMap = modifiedDeIdentConfig.additionalTagValuesMap;
                    const deIdentificationStepsArray = additionalTagValuesMap.get('00120064');
                    const lastStep = deIdentificationStepsArray[1];

                    expect(lastStep['00080100'].Value[0]).toStrictEqual('113108');
                    expect(lastStep['00080102'].Value[0]).toStrictEqual('DCM');
                    expect(lastStep['00080104'].Value[0]).toStrictEqual(DeIdentificationProfileCodesMeaning.RETAIN_PATIENT_CHARACTERISTICS);
                })

                test('Factory class objects are not changed -> factory produces ususal configuration afterwards if a special case is not detected', () => {
                    const profile = [DeIdentificationProfiles.RPB_PROFILE, DeIdentificationProfiles.RETAIN_SAFE_PRIVATE_OPTION];
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.3.46.670589.33.1.4.1' },
                        dict: { '08002000': 'dummyItem' }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const normalConfig = factory.getConfiguration();
                    const configurationMap = normalConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'X' });

                    const additionalTagValuesMap = normalConfig.additionalTagValuesMap;
                    const deIdentificationStepsArray = additionalTagValuesMap.get('00120064');
                    expect(deIdentificationStepsArray.length).toBe(1);
                })

                test('No additional steps item if RETAIN_PATIENT_CHARACTERISTICS is already applied', () => {
                    const profile = [DeIdentificationProfiles.RPB_PROFILE, DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS];
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.3.46.670589.33.1.4.1' },
                        dict: { '08002000': 'dummyItem' }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const additionalTagValuesMap = modifiedDeIdentConfig.additionalTagValuesMap;
                    const deIdentificationStepsArray = additionalTagValuesMap.get('00120064');
                    expect(deIdentificationStepsArray.length).toBe(2);
                })

            })

            describe('Test case detection', () => {
                const profile = [DeIdentificationProfiles.RPB_PROFILE, DeIdentificationProfiles.RETAIN_SAFE_PRIVATE_OPTION];

                test('TransferSyntaxUID == "1.3.46.670589.33.1.4.1"', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.3.46.670589.33.1.4.1' },
                        dict: { '08002000': 'dummyItem' }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

                test('Philips Medical Systems - Ingenuity TF PET/MR - Modality : PT ', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.2.840.10008.1.2' },
                        dict: {
                            '00080060': 'PT',
                            '00080070': 'Philips Medical Systems',
                            '00081090': 'Ingenuity TF PET/MR'
                        }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

                test('Philips Medical Systems - Ingenuity TF PET/MR - Modality : "MR"', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.2.840.10008.1.2' },
                        dict: {
                            '00080060': 'MR',
                            '00080070': 'Philips Medical Systems',
                            '00081090': 'Ingenuity TF PET/MR'
                        }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

                test('Philips Medical Systems - Ingenuity - Modality : "MR"', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.2.840.10008.1.2' },
                        dict: {
                            '00080060': 'MR',
                            '00080070': 'Philips Medical Systems',
                            '00081090': 'Ingenuity'
                        }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

                test('Nucletron - Oncentra - Modality : "RTDOSE"', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.2.840.10008.1.2' },
                        dict: {
                            '00080060': 'RTDOSE',
                            '00080070': 'Nucletron',
                            '00081090': 'Oncentra'
                        }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

                test('TomoTherapy Incorporated - Hi-Art - Modality : "RTDOSE"', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.2.840.10008.1.2' },
                        dict: {
                            '00080060': 'RTDOSE',
                            '00080070': 'TomoTherapy Incorporated',
                            '00081090': 'Hi-Art'
                        }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

                test('Nucletron - Oncentra - Modality : "RTPLAN"', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.2.840.10008.1.2' },
                        dict: {
                            '00080060': 'RTPLAN',
                            '00080070': 'Nucletron',
                            '00081090': 'Oncentra'
                        }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

                test('TomoTherapy Incorporated - Hi-Art - Modality : "RTPLAN"', () => {
                    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);

                    const dicomDict = {
                        meta: { '00020010': '1.2.840.10008.1.2' },
                        dict: {
                            '00080060': 'RTPLAN',
                            '00080070': 'TomoTherapy Incorporated',
                            '00081090': 'Hi-Art'
                        }
                    }

                    const modifiedDeIdentConfig = factory.getConfiguration(dicomDict);

                    const configurationMap = modifiedDeIdentConfig.getConfigurationMap();

                    expect(configurationMap.get('private')).toStrictEqual({ action: 'K' });
                })

            })
        })

    })

    describe('Test Lookup Maps', () => {
        test("Test defaultReplacementsValuesMap", () => {
            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            expect(deIdentConfig.getDefaultReplacementValue(DicomValueRepresentations.DA)).toStrictEqual('19000101');
            expect(deIdentConfig.getDefaultReplacementValue(DicomValueRepresentations.DT)).toStrictEqual('000000.00');
            expect(deIdentConfig.getDefaultReplacementValue(DicomValueRepresentations.TM)).toStrictEqual('000000.000000');
            expect(deIdentConfig.getDefaultReplacementValue(DicomValueRepresentations.PN)).toStrictEqual('PN');

        })

        test.skip("Test tagSpecificReplacements", () => {
            const profile = DeIdentificationProfiles.RPB_PROFILE;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            expect(deIdentConfig.getReplacementValue('00100010')).toStrictEqual(dummyPid);
            expect(deIdentConfig.getReplacementValue('00100020')).toStrictEqual(dummyPid);
            // expect(deIdentConfig.getReplacementValue('00080090')).toStrictEqual('(' + dummyStudyEdcCode + ')' + '-' + dummySubjectId);

        })

        test("Additional tags will indicate that the basic profile was applied on the data set", () => {

            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            factory.addAdditionalDeIdentificationRelatedTags();
            const deIdentConfig = factory.getConfiguration();

            // Patient Identity Removed Attribute
            expect(deIdentConfig.additionalTagValuesMap.get('00120062')).toBe(YesNoEnum.YES);
            // De-identification Method Attribute
            expect(deIdentConfig.additionalTagValuesMap.get('00120063')).toBe('Per DICOM PS 3.15 AnnexE. RPB-Uploader v1.0');
            // De-identification Method Code Sequence Attribute
            const usedMethods = deIdentConfig.additionalTagValuesMap.get('00120064')
            expect(usedMethods.length).toBe(1);
            const lastMethod = usedMethods[0];
            // Coding Scheme Designator Attribute
            expect(lastMethod['00080100'].Value).toEqual([DeidentificationProfileCodes.BASIC]);
            expect(lastMethod['00080102'].Value).toEqual(['DCM']);
            expect(lastMethod['00080104'].Value).toEqual([DeIdentificationProfileCodesMeaning.BASIC]);

        })

    })

})

export function applyConfigAction(deIdentConfig, dict, propertyName, vr) {
    let { action, parameter, actionCode } = deIdentConfig.getTask(propertyName, vr);
    // dummy replacement emulates UID replacement
    if (actionCode === DeIdentificationActionCodes.U) {
        const replacementMap = new Map();
        replacementMap.set('dummyUid', 'dummyReplacementUid');
        parameter = replacementMap;

    }
    action(dict, propertyName, parameter);
}
