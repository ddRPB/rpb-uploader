import DeIdentificationActionCodes from "../../../constants/DeIdentificationActionCodes";
import DeIdentificationProfiles from "../../../constants/DeIdentificationProfiles";
import DeidentificationProfileCodes from "../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes";
import DeIdentificationProfileCodesMeaning from "../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning";
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
            const profile = DeIdentificationProfiles.BASIC;
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

            expect(dict['00080090'].Value).toBe('(' + dummyStudyEdcCode + ')-' + dummySubjectId);
            expect(dict['00081030'].Value).toBe('(' + dummyStudyEdcCode + ')-' + dummyItemValue);
            expect(dict['0008103E'].Value).toBe('(' + dummyStudyEdcCode + ')-' + dummyItemValue);
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

        test("Test tagSpecificReplacements", () => {
            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            expect(deIdentConfig.getReplacementValue('00100010')).toStrictEqual(dummyPid);
            expect(deIdentConfig.getReplacementValue('00100020')).toStrictEqual(dummyPid);
            expect(deIdentConfig.getReplacementValue('00080090')).toStrictEqual('(' + dummyStudyEdcCode + ')' + '-' + dummySubjectId);

        })

        test("Test additional de-identification specific tags", () => {
            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            const tagDict = {};

            deIdentConfig.addReplacementTags(tagDict);


            expect(tagDict['00120062'].Value).toStrictEqual(['true']);
            expect(tagDict['00120063'].Value).toStrictEqual(['Per DICOM PS 3.15 AnnexE. Details in 0012,0064']);

        })

        test("Additional tags will indicate that the basic profile was applied on the data set", () => {

            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            factory.addAdditionalDeIdentificationRelatedTags();
            const deIdentConfig = factory.getConfiguration();

            // Patient Identity Removed Attribute
            expect(deIdentConfig.additionalTagValuesMap.get('00120062')).toBe('true');
            // De-identification Method Attribute
            expect(deIdentConfig.additionalTagValuesMap.get('00120063')).toBe('Per DICOM PS 3.15 AnnexE. Details in 0012,0064');
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
    let { action, parameter } = deIdentConfig.getTask(propertyName, vr);
    action(dict, propertyName, parameter);
}
