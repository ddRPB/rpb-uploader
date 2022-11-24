import DeIdentificationProfileCodes from '../../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes';
import DeIdentificationProfileCodesMeaning from '../../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning';
import YesNoEnum from '../../../../constants/dicomValueEnums/YesNoEnum';
import LongitudinalTemporalInformationModifiedAttribute from '../../../../constants/LongitudinalTemporalInformationModifiedAttribute';
import DeIdentificationConfigurationFactory from '../../../../util/deidentification/DeIdentificationConfigurationFactory';
import DicomFileDeIdentificationComponentDcmjs from '../../../../util/deidentification/DicomFileDeIdentificationComponentDcmjs';
import DeIdentificationProfiles from './../../../../constants/DeIdentificationProfiles';
import DicomValueRepresentations from './../../../../constants/DicomValueRepresentations';
import { applyConfigAction } from './../DeIdentificationConfigurationFactory.test';

describe('Retain Patient Characteristics Profile Integration Test', () => {
    const dummyPid = 'dummyPid';
    const dummySubjectId = 'dummy-subject-id';
    const dummyStudyEdcCode = 'dummy-edc-code';

    const uploadSlot = {
        studyEdcCode: dummyStudyEdcCode,
        subjectId: dummySubjectId,
        pid: dummyPid
    };

    const dummyPatientName = 'dummyPatientName';
    const dummyPatientId = 'dummyPatientId';
    const patientIdentityData = [
        { Value: dummyPatientName, vr: DicomValueRepresentations.PN },
        { Value: dummyPatientId, vr: DicomValueRepresentations.LO },
    ];

    const dicomUidReplacements = new Map();

    const profile = DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    const deIdentConfig = factory.getConfiguration();

    const deIdentComponent = new DicomFileDeIdentificationComponentDcmjs(dicomUidReplacements, patientIdentityData, deIdentConfig, null, null);

    const dummyItemValue = 'dummyValue';
    const dummyItemValueAddition = 'abc';

    let dictKeepCandidates = {
        '00102160': { Value: dummyItemValue, vr: DicomValueRepresentations.SH },
        '00101010': { Value: dummyItemValue, vr: DicomValueRepresentations.AS },
        '00100040': { Value: dummyItemValue, vr: DicomValueRepresentations.CS },
        '00102203': { Value: dummyItemValue, vr: DicomValueRepresentations.CS },
        '00101020': { Value: dummyItemValue, vr: DicomValueRepresentations.DS },
        '00101030': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
        '001021C0': { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
        '0072005F': { Value: dummyItemValue, vr: DicomValueRepresentations.AS },
        '001021A0': { Value: dummyItemValue, vr: DicomValueRepresentations.CS },
    };

    let dictCleanCandidates = {
        '00102110': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00380500': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00400012': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00380050': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
    };

    test("Option ensures that the specific values will be keeped.", () => {
        for (let key of Object.keys(dictKeepCandidates)) {
            applyConfigAction(deIdentConfig, dictKeepCandidates, key, DicomValueRepresentations.DT);
            expect(dictKeepCandidates[key].Value, `Value of ${key} should be keeped`).toBe(dummyItemValue);
        }
    })

    test("Option ensures that the specific values will cleaned.", () => {
        deIdentComponent.applyDeIdentificationActions(dictCleanCandidates);
        for (let key of Object.keys(dictCleanCandidates)) {
            expect(dictCleanCandidates[key].Value, `Value of ${key} should be cleaned`).toBe(dummyItemValue + dummyItemValueAddition);
        }
    })

    test("Additional tags will indicate that the RETAIN_PATIENT_CHARACTERISTICS profile was applied on the data set", () => {

        const profile = DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS;
        const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
        factory.addAdditionalDeIdentificationRelatedTags();
        const deIdentConfig = factory.getConfiguration();

        // Patient Identity Removed Attribute
        expect(deIdentConfig.additionalTagValuesMap.get('00120062'), 'Patient Identity removed - should be no').toBe(YesNoEnum.NO);
        // De-identification Method Attribute
        expect(deIdentConfig.additionalTagValuesMap.get('00120063'), 'addtional 00120063 tag').toBe('Per DICOM PS 3.15 AnnexE. RPB-Uploader v1.0');
        // De-identification Method Code Sequence Attribute
        const usedMethods = deIdentConfig.additionalTagValuesMap.get('00120064')
        expect(usedMethods.length, 'Value should be 2.').toBe(2);
        const lastMethod = usedMethods[1];
        // Coding Scheme Designator Attribute
        expect(lastMethod['00080100'].Value, `00080100 - should be ${DeIdentificationProfileCodes.RETAIN_PATIENT_CHARACTERISTICS}`)
            .toEqual([DeIdentificationProfileCodes.RETAIN_PATIENT_CHARACTERISTICS]);
        expect(lastMethod['00080102'].Value, `00080102 - should be DCM`).toEqual(['DCM']);
        expect(lastMethod['00080104'].Value, `00080104 - should be ${DeIdentificationProfileCodesMeaning.RETAIN_PATIENT_CHARACTERISTICS}`)
            .toEqual([DeIdentificationProfileCodesMeaning.RETAIN_PATIENT_CHARACTERISTICS]);

    })

    describe('Additional tags tests', () => {

        let dict = {};
        deIdentConfig.addAdditionalTags(dict);

        test('PatientIdentityRemoved is set to no', () => {
            expect(dict['00120062'].Value).toStrictEqual([YesNoEnum.NO]);
        })
        test('LongitudinalTemporalInformationModified is set to removed', () => {
            expect(dict['00280303'].Value).toStrictEqual([LongitudinalTemporalInformationModifiedAttribute.REMOVED]);
        })
    })


})