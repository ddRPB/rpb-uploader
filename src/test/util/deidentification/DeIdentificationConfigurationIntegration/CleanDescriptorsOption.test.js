import DeIdentificationProfileCodes from '../../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodes';
import DeIdentificationProfileCodesMeaning from '../../../../constants/dicomTerminologyDefinitions/DeIdentificationProfileCodesMeaning';
import YesNoEnum from '../../../../constants/dicomValueEnums/YesNoEnum';
import DeIdentificationConfigurationFactory from '../../../../util/deidentification/DeIdentificationConfigurationFactory';
import DicomFileDeIdentificationComponentDcmjs from '../../../../util/deidentification/DicomFileDeIdentificationComponentDcmjs';
import DeIdentificationProfiles from './../../../../constants/DeIdentificationProfiles';
import DicomValueRepresentations from './../../../../constants/DicomValueRepresentations';

describe('Clean Descriptors Option Integration Test', () => {
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

    const profile = DeIdentificationProfiles.CLEAN_DESCRIPTORS;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    const deIdentConfig = factory.getConfiguration();

    const deIdentComponent = new DicomFileDeIdentificationComponentDcmjs(dicomUidReplacements, patientIdentityData, deIdentConfig, null, null);

    const dummyItemValue = 'dummyValue';
    const dummyItemValueAddition = 'abc';

    let dictCleanCandidates = {
        '00184000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00181400': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '001811BB': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00189424': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '001021B0': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00081080': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00102110': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '006A0006': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '006A0005': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A00C3': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A00DD': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '00120072': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00120051': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '00400310': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '00400280': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A02EB': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '3010000F': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '30100017': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '0040051A': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00180010': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '0018A003': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '0018937F': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '00082111': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '0016004B': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.OB },
        '00380040': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A079A': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A0016': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30100037': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '30100035': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '30100038': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30100036': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30100036': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A0676': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '003A032B': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A0196': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '3010007F': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '300A0072': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00209158': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00084000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00204000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00402400': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '40080300': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A0742': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A0783': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '40080115': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '4008010B': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '22000002': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '00500021': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '0016002B': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.OB },
        '00102000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '0018937B': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '00102180': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '00104000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '300A0794': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00380500': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A0792': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '300A078E': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00400254': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A000E': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '3010007B': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '30100061': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '00181030': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00081088': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00200027': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A0619': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A0623': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A067D': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A067C': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '300C0113': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00321030': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '3010005C': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '04000565': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.CS },
        '00402001': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00401002': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00321066': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '00321070': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00401400': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '00321060': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00189937': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00189185': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '40084000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '30060028': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '30060038': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30060026': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30060088': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '30060085': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '3010005A': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '300A0004': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A0002': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '300A0003': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30100054': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A062A': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30100056': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00400007': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00720066': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00720068': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '0072006C': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '0072006E': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '00720070': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        // is changed with RPB specific actions which are enabled by default
        // '0008103E': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00380062': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A01B2': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '300A01A6': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '00400602': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '00400600': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '30060006': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '30060002': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '30060004': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00324000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        // is changed with RPB specific actions which are enabled by default
        // '00081030': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A0608': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '30100077': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '300A000B': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '3010007A': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.UT },
        '300A0734': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
        '30100033': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.SH },
        '30100034': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO },
        '00384000': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LT },
        '003A0329': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.ST },
    };

    let dictCleanFirstChildrenCandidates = {
        '00081084': {
            Value: [{
                '11111111': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO }
            }],
            vr: DicomValueRepresentations.SQ
        },
        '30100081': {
            Value: [{
                '11111112': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO }
            }],
            vr: DicomValueRepresentations.SQ
        },
        '0040100A': {
            Value: [{
                '11111113': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO }
            }],
            vr: DicomValueRepresentations.SQ
        },
        '00321067': {
            Value: [{
                '11111114': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO }
            }],
            vr: DicomValueRepresentations.SQ
        },
        '00400275': {
            Value: [{
                '11111115': { Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId, vr: DicomValueRepresentations.LO }
            }],
            vr: DicomValueRepresentations.SQ
        },
    };

    let dictCleanRecursionTestCandidates = {
        '00081084': {
            Value: [{
                '11111111': {
                    Value: [{
                        '22222222': {
                            Value: dummyItemValue + dummyPatientName + dummyItemValueAddition + dummyPatientId,
                            vr: DicomValueRepresentations.LO
                        }

                    }],
                    vr: DicomValueRepresentations.SQ
                },

            }],
            vr: DicomValueRepresentations.SQ
        },
    }

    test("The specific values will cleaned.", () => {
        deIdentComponent.applyDeIdentificationActions(dictCleanCandidates);
        for (let key of Object.keys(dictCleanCandidates)) {
            expect(dictCleanCandidates[key], `${key} is defined`).toBeDefined();
            expect(dictCleanCandidates[key].Value, `Value of ${key} should be cleaned`).toBe(dummyItemValue + dummyItemValueAddition);
        }
    })

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

    test("ensures that the cleaning function is applied recursiv througt all children.", () => {
        deIdentComponent.applyDeIdentificationActions(dictCleanRecursionTestCandidates);
        for (let key of Object.keys(dictCleanRecursionTestCandidates)) {
            expect(dictCleanRecursionTestCandidates[key], `${key} is defined`).toBeDefined();
            const element = dictCleanRecursionTestCandidates[key];
            const secondLayerElement = element.Value[0];
            for (let secondKey of Object.keys(secondLayerElement)) {
                expect(secondLayerElement[secondKey], `${secondKey} is defined`).toBeDefined();
                const thirdLayerElement = secondLayerElement[secondKey].Value[0];
                expect(thirdLayerElement['22222222'].Value, `Value of ${22222222} should be cleaned`).toBe(dummyItemValue + dummyItemValueAddition);
            }

        }
    })

    test("Additional tags will indicate that the Clean Structured Content Option was applied on the data set", () => {

        const profile = DeIdentificationProfiles.CLEAN_DESCRIPTORS;
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
        expect(lastMethod['00080100'].Value, `00080100 - should be ${DeIdentificationProfileCodes.CLEAN_DESCRIPTORS}`)
            .toEqual([DeIdentificationProfileCodes.CLEAN_DESCRIPTORS]);
        expect(lastMethod['00080102'].Value, `00080102 - should be DCM`).toEqual(['DCM']);
        expect(lastMethod['00080104'].Value, `00080104 - should be ${DeIdentificationProfileCodesMeaning.CLEAN_DESCRIPTORS}`)
            .toEqual([DeIdentificationProfileCodesMeaning.CLEAN_DESCRIPTORS]);

    })

})