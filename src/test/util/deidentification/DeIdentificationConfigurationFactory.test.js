import DeIdentificationProfiles from "../../../constants/DeIdentificationProfiles";
import DeIdentificationConfigurationFactory from "../../../util/deidentification/DeIdentificationConfigurationFactory";

describe('Test DeIdentificationConfigurationFactory', () => {
    const uploadSlot = {
        pid: 'dummyPid'
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
    })
})