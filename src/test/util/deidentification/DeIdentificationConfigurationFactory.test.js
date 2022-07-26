import DeIdentificationProfiles from "../../../constants/DeIdentificationProfiles";
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
            const profile = DeIdentificationProfiles.BASIC;
            const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
            const deIdentConfig = factory.getConfiguration();

            const configurationMap = deIdentConfig.getConfigurationMap();

            expect(configurationMap.get('00081030')).toStrictEqual({ action: 'KP' });
            expect(configurationMap.get('0008103E')).toStrictEqual({ action: 'KP' });
            expect(configurationMap.get('00080090')).toStrictEqual({ action: 'D' });
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

    })
})