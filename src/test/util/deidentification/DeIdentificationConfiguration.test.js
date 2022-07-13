import DeIdentificationProfiles from "../../../constants/DeIdentificationProfiles";
import DeIdentificationConfigurationFactory from "../../../util/deidentification/DeIdentificationConfigurationFactory";

describe('DeIdentificationConfiguration Tests', () => {
    const uploadSlot = {};


    describe('Basic Tests', () => {
        const dataSetDictionary = {};

        test("Configuration is not null", () => {
            const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
            const configuration = factory.getConfiguration();
            expect(configuration).toBeUndefined;
        })

        test("Configuration returns undefined replacement value if tag is is not part of the configuration", () => {
            const originalValue = 'originalValue';
            const element = {
                Value: originalValue
            };
            const tag = '00000000';
            dataSetDictionary[tag] = element;

            const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
            const configuration = factory.getConfiguration();
            let { action, parameter } = configuration.getTask(tag, 'abc');

            expect(parameter).toBeUndefined;
        })

        test("Keeps the original value if tag is not configured and value is a String", () => {
            const originalValue = 'originalValue';
            const element = {
                Value: originalValue
            };
            const tag = '00000000';
            dataSetDictionary[tag] = element;

            const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
            const configuration = factory.getConfiguration();
            let { action, parameter } = configuration.getTask(tag);
            action(dataSetDictionary, tag, parameter);

            expect(dataSetDictionary[tag]).toBe(element);
        })

        test("Keeps the original value if tag is not configured and value is a String in an Array", () => {
            const originalValue = ['originalValue'];
            const element = {
                Value: originalValue
            };
            const tag = '00000000';
            dataSetDictionary[tag] = element;

            const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
            const configuration = factory.getConfiguration();
            let { action, parameter } = configuration.getTask(tag);
            action(dataSetDictionary, tag, parameter);

            expect(dataSetDictionary[tag]).toBe(element);
        })

        test("Keeps the original value if tag is not configured and value are Strings in an Array", () => {
            const originalValue = ['originalValue1', 'originalValue2'];
            const element = {
                Value: originalValue
            };
            const tag = '00000000';
            dataSetDictionary[tag] = element;

            const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
            const configuration = factory.getConfiguration();
            let { action, parameter } = configuration.getTask(tag);
            action(dataSetDictionary, tag, parameter);

            expect(dataSetDictionary[tag]).toBe(element);
        })

        test("Keeps the original value if tag is not configured and value is an empty Array", () => {
            const originalValue = [];
            const element = {
                Value: originalValue
            };
            const tag = '00000000';
            dataSetDictionary[tag] = element;

            const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
            const configuration = factory.getConfiguration();
            let { action, parameter } = configuration.getTask(tag);
            action(dataSetDictionary, tag, parameter);

            expect(dataSetDictionary[tag]).toBe(element);
        })

    })

    describe('DeIdentification D actions', () => {
        // Replace with dummy value
        const dataSetDictionary = {};

        describe('returned parameter tests', () => {
            test("Configuration returns default replacement value if VR is is not part of the configuration", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const defaultParameter = "";
                const vr = "ABC";

                const tag = '00080023';
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(defaultParameter);
            })

            test("Configuration returns '19000101' as replacement if VR is DA", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = '19000101';
                const vr = "DA";

                const tag = '00080023';
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })

            test("Configuration returns '000000.00' as replacement if VR is DT", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = '000000.00';
                const vr = "DT";

                const tag = '00080023';
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })

            test("Configuration returns '000000.000000' as replacement if VR is TM", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = '000000.000000';
                const vr = "TM";

                const tag = '00080023';
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })

            test("Configuration returns '000000.000000' as replacement if VR is PN", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = 'PN';
                const vr = "PN";

                const tag = '00080023';
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })
        })

        describe('apply actions tests', () => {

            test("Replaces the original String value with the replacement parameter.", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const tag = '00080023';
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toBe(replacementParameter);
            })

            test("Replaces the original String value in Array with the replacement parameter.", () => {
                const originalValue = ['originalValue'];
                const element = {
                    Value: originalValue
                };
                const tag = '00080023';
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter]);
            })

            test("Replaces the original String values in Array with the replacement parameter.", () => {
                const originalValue = ['originalValue1', 'originalValue2'];
                const element = {
                    Value: originalValue
                };
                const tag = '00080023';
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter, replacementParameter]);
            })

            // Not sure if that can happen
            test.skip("Replaces the empty Array with the replacement parameter.", () => {
                const originalValue = [];
                const element = {
                    Value: originalValue
                };
                const tag = '00080023';
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter]);
            })

        })
    })

    describe('DeIdentification Z actions', () => {
        // Replace with dummy value if parameter is not a zero value
        const dataSetDictionary = {};
        const exampleTag = '00080050';

        describe('returned parameter tests', () => {
            test("Configuration returns default replacement value if VR is is not part of the configuration", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const defaultParameter = "";
                const vr = "ABC";

                const tag = exampleTag;
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(defaultParameter);
            })

            test("Configuration returns '19000101' as replacement if VR is DA", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = '19000101';
                const vr = "DA";

                const tag = exampleTag;
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })

            test("Configuration returns '000000.00' as replacement if VR is DT", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = '000000.00';
                const vr = "DT";

                const tag = exampleTag;
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })

            test("Configuration returns '000000.000000' as replacement if VR is TM", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = '000000.000000';
                const vr = "TM";

                const tag = exampleTag;
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })

            test("Configuration returns '000000.000000' as replacement if VR is PN", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const expectedParameter = 'PN';
                const vr = "PN";

                const tag = exampleTag;
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);

                expect(parameter).toBe(expectedParameter);
            })
        })

        describe('apply actions tests', () => {

            test("Replaces the original String value with the replacement parameter.", () => {
                const originalValue = 'originalValue';
                const element = {
                    Value: originalValue
                };
                const tag = exampleTag;
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toBe(replacementParameter);
            })

            test("Replaces the original String value in Array with the replacement parameter.", () => {
                const originalValue = ['originalValue'];
                const element = {
                    Value: originalValue
                };
                const tag = exampleTag;
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter]);
            })

            test("Replaces the original String values in Array with the replacement parameter.", () => {
                const originalValue = ['originalValue1', 'originalValue2'];
                const element = {
                    Value: originalValue
                };
                const tag = exampleTag;
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter, replacementParameter]);
            })

            // ToDo: verify standard
            test("Empty Array stays empty.", () => {
                const originalValue = [];
                const element = {
                    Value: originalValue
                };
                const tag = exampleTag;
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toStrictEqual([]);
            })

            // ToDo: verify standard
            test("Empty String in Array stays an empty string.", () => {
                const originalValue = [""];
                const element = {
                    Value: originalValue
                };
                const tag = exampleTag;
                const vr = "dummy";
                dataSetDictionary[tag] = element;

                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
                const configuration = factory.getConfiguration();
                let { action, parameter } = configuration.getTask(tag, vr);
                const replacementParameter = "replacementParameter";

                action(dataSetDictionary, tag, replacementParameter);

                expect(dataSetDictionary[tag].Value).toStrictEqual([""]);
            })

        })
    })

    describe('DeIdentification X actions', () => {
        // remove item
        const exampleTag = '00184000';
        const dataSetDictionary = {};

        test("Item will be deleted.", () => {
            const originalValue = ["abc"];
            const element = {
                Value: originalValue
            };
            const tag = exampleTag;
            const vr = "dummy";
            dataSetDictionary[tag] = element;

            const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
            const configuration = factory.getConfiguration();
            let { action, parameter } = configuration.getTask(tag, vr);
            const replacementParameter = "replacementParameter";

            action(dataSetDictionary, tag, replacementParameter);

            expect(dataSetDictionary[tag]).toBeUndefined();
        })

    })

    describe('DeIdentification K actions', () => {
        // keep
        //Todo
    })

})