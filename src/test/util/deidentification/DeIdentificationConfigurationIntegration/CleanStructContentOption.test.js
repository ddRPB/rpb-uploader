import DeIdentificationProfileCodes from '../../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes';
import DeIdentificationProfileCodesMeaning from '../../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning';
import YesNoEnum from '../../../../constants/dicomValueEnums/YesNoEnum';
import DeIdentificationConfigurationFactory from '../../../../util/deidentification/DeIdentificationConfigurationFactory';
import DicomFileDeIdentificationComponentDcmjs from '../../../../util/deidentification/DicomFileDeIdentificationComponentDcmjs';
import DeIdentificationProfiles from './../../../../constants/DeIdentificationProfiles';
import DicomValueRepresentations from './../../../../constants/DicomValueRepresentations';
import { applyConfigAction } from './../DeIdentificationConfigurationFactory.test';

describe('Clean Structured Content Option Integration Test', () => {
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

    const profile = DeIdentificationProfiles.CLEAN_STRUCTURED_CONTENT;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    const deIdentConfig = factory.getConfiguration();

    const deIdentComponent = new DicomFileDeIdentificationComponentDcmjs(dicomUidReplacements, patientIdentityData, deIdentConfig, null, null);

    const dummyItemValue = 'dummyValue';
    const dummyItemValueAddition = 'abc';

    let dictCleanCandidates = {
        // '00400555': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SQ },
        // '0040A730': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SQ },
        '00400610': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
    };

    let dictCleanFirstChildrenCandidates = {
        '00400555': {
            Value: [{
                '11111111': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO }
            }],
            vr: DicomValueRepresentations.SQ
        },
        '0040A730': {
            Value: [{
                '11111111': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO }
            }],
            vr: DicomValueRepresentations.SQ
        },
    }


    test("The children of a sequence will be cleaned.", () => {
        deIdentComponent.applyDeIdentificationActions(dictCleanFirstChildrenCandidates);
        for (let key of Object.keys(dictCleanFirstChildrenCandidates)) {
            expect(dictCleanFirstChildrenCandidates[key], `${key} is defined`).toBeDefined();
            const element = dictCleanFirstChildrenCandidates[key];

            for (let seqElement of element.Value) {
                for (let keyTwo of Object.keys(seqElement)) {
                    const elementTwo = seqElement[keyTwo];
                    expect(elementTwo.Value, `Value of ${keyTwo} should be cleaned`).toBe(dummyItemValue + dummyItemValueAddition);
                }
            }
        }
    })

    test("Values of specific items will be cleaned.", () => {
        deIdentComponent.applyDeIdentificationActions(dictCleanCandidates);
        for (let key of Object.keys(dictCleanCandidates)) {
            expect(dictCleanCandidates[key], `${key} is defined`).toBeDefined();
            expect(dictCleanCandidates[key].Value, `Value of ${key} should be cleaned`).toBe(dummyItemValue + dummyItemValueAddition);
        }
    })


    test("Additional tags will indicate that the Clean Structured Content Option was applied on the data set", () => {

        const profile = DeIdentificationProfiles.CLEAN_STRUCTURED_CONTENT;
        const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
        factory.addAdditionalDeIdentificationRelatedTags();
        const deIdentConfig = factory.getConfiguration();

        // Patient Identity Removed Attribute
        expect(deIdentConfig.additionalTagValuesMap.get('00120062'), 'Patient Identity removed - should be yes').toBe(YesNoEnum.YES);
        // De-identification Method Attribute
        expect(deIdentConfig.additionalTagValuesMap.get('00120063'), 'addtional 00120063 tag').toBe('Per DICOM PS 3.15 AnnexE. RPB-Uploader v1.0');
        // De-identification Method Code Sequence Attribute
        const usedMethods = deIdentConfig.additionalTagValuesMap.get('00120064')
        expect(usedMethods.length, 'Value should be 2.').toBe(2);
        const lastMethod = usedMethods[1];
        // Coding Scheme Designator Attribute
        expect(lastMethod['00080100'].Value, `00080100 - should be ${DeIdentificationProfileCodes.CLEAN_STRUCTURED_CONTENT}`)
            .toEqual([DeIdentificationProfileCodes.CLEAN_STRUCTURED_CONTENT]);
        expect(lastMethod['00080102'].Value, `00080102 - should be DCM`).toEqual(['DCM']);
        expect(lastMethod['00080104'].Value, `00080104 - should be ${DeIdentificationProfileCodesMeaning.CLEAN_STRUCTURED_CONTENT}`)
            .toEqual([DeIdentificationProfileCodesMeaning.CLEAN_STRUCTURED_CONTENT]);

    })

})