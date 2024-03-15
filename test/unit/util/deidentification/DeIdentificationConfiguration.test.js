import DeIdentificationProfiles from "../../../../src/constants/DeIdentificationProfiles";
import YesNoEnum from "../../../../src/constants/dicomValueEnums/YesNoEnum";
import DicomValueRepresentations from "../../../../src/constants/DicomValueRepresentations";
import LongitudinalTemporalInformationModifiedAttribute from "../../../../src/constants/LongitudinalTemporalInformationModifiedAttribute";
import DeIdentificationConfigurationFactory from "../../../../src/util/deidentification/DeIdentificationConfigurationFactory";

describe("DeIdentificationConfiguration Tests", () => {
  const uploadSlot = {
    studyEdcCode: "dummy-edc-code",
    subjectId: "dummy-subject-id",
    pid: "dummyPid",
  };

  describe("DeIdentificationConfiguration Basic Tests", () => {
    const dataSetDictionary = {};

    test("Configuration is not null", () => {
      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      expect(configuration).toBeUndefined;
    });

    test("Configuration returns undefined replacement value if tag is is not part of the configuration", () => {
      const originalValue = "originalValue";
      const element = {
        Value: originalValue,
      };
      const tag = "00000000";
      dataSetDictionary[tag] = element;

      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      let { action, parameter } = configuration.getTask(tag, "abc");

      expect(parameter).toBeUndefined;
    });

    test("Keeps the original value if tag is not configured and value is a String", () => {
      const originalValue = "originalValue";
      const element = {
        Value: originalValue,
      };
      const tag = "00000000";
      dataSetDictionary[tag] = element;

      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      let { action, parameter } = configuration.getTask(tag);
      action(dataSetDictionary, tag, parameter);

      expect(dataSetDictionary[tag]).toBe(element);
    });

    test("Keeps the original value if tag is not configured and value is a String in an Array", () => {
      const originalValue = ["originalValue"];
      const element = {
        Value: originalValue,
      };
      const tag = "00000000";
      dataSetDictionary[tag] = element;

      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      let { action, parameter } = configuration.getTask(tag);
      action(dataSetDictionary, tag, parameter);

      expect(dataSetDictionary[tag]).toBe(element);
    });

    test("Keeps the original value if tag is not configured and value are Strings in an Array", () => {
      const originalValue = ["originalValue1", "originalValue2"];
      const element = {
        Value: originalValue,
      };
      const tag = "00000000";
      dataSetDictionary[tag] = element;

      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      let { action, parameter } = configuration.getTask(tag);
      action(dataSetDictionary, tag, parameter);

      expect(dataSetDictionary[tag]).toBe(element);
    });

    test("Keeps the original value if tag is not configured and value is an empty Array", () => {
      const originalValue = [];
      const element = {
        Value: originalValue,
      };
      const tag = "00000000";
      dataSetDictionary[tag] = element;

      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      let { action, parameter } = configuration.getTask(tag);
      action(dataSetDictionary, tag, parameter);

      expect(dataSetDictionary[tag]).toBe(element);
    });
  });

  describe("PatientIdentityRemoved Tag Tests", () => {
    const uploadSlot = {
      studyEdcCode: "dummyStudyEdcCode",
      subjectId: "dummySubjectId",
      pid: "dummyPid",
    };

    const patientIdentityRemoved = "00120062";

    const profile = DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    factory.addAdditionalDeIdentificationRelatedTags();
    const deIdentConfig = factory.getConfiguration();

    test("Tag from configuration is added if item does not exist.", () => {
      let dict = {};
      deIdentConfig.addAdditionalTags(dict);

      const patientDeIdentifiedItem = dict[patientIdentityRemoved];

      expect(patientDeIdentifiedItem.Value.length, "should be just one item").toBe(1);
      expect(patientDeIdentifiedItem.Value[0], "matches the expected value").toMatch(YesNoEnum.YES);
    });

    test("Existing item stays if it is YES.", () => {
      let dict = {
        "00120062": {
          Value: [YesNoEnum.YES],
          vr: DicomValueRepresentations.CS,
        },
      };

      deIdentConfig.addAdditionalTags(dict);
      const patientDeIdentifiedItem = dict[patientIdentityRemoved];

      expect(patientDeIdentifiedItem.Value.length, "should be just one item").toBe(1);
      expect(patientDeIdentifiedItem.Value[0], "matches the expected value").toMatch(YesNoEnum.YES);
    });

    test("Existing 'No' item will be overwritten by config 'YES'.", () => {
      let dict = {
        "00120062": { Value: [YesNoEnum.NO], vr: DicomValueRepresentations.CS },
      };

      const basicProfile = DeIdentificationProfiles.BASIC;
      const factoryTwo = new DeIdentificationConfigurationFactory(basicProfile, uploadSlot);
      const deIdentConfigTwo = factoryTwo.getConfiguration();
      deIdentConfigTwo.addAdditionalTags(dict);

      const patientDeIdentifiedItem = dict[patientIdentityRemoved];

      expect(patientDeIdentifiedItem.Value.length, "should be just one item").toBe(1);
      expect(patientDeIdentifiedItem.Value[0], "matches the expected value").toMatch(YesNoEnum.YES);
    });
  });

  describe("DeidentificationMethod Tag Tests", () => {
    const uploadSlot = {
      studyEdcCode: "dummyStudyEdcCode",
      subjectId: "dummySubjectId",
      pid: "dummyPid",
    };

    const deIdentificationMethodTag = "00120063";
    const defaultValue = "Per DICOM PS 3.15 AnnexE. RPB-Uploader v0.0.2";
    const dummyValue = "dummyItemValue";

    const profile = DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY;
    const factory = new DeIdentificationConfigurationFactory(profile, uploadSlot);
    factory.addAdditionalDeIdentificationRelatedTags();
    const deIdentConfig = factory.getConfiguration();

    test("Adding an item if the dictionary has no DeIdentificationMethod item.", () => {
      let dict = {};
      deIdentConfig.addAdditionalTags(dict);

      expect(dict[deIdentificationMethodTag], "DeIdentificationMethod should be added").toBeDefined();

      const deidentificationMethodItem = dict[deIdentificationMethodTag];

      expect(deidentificationMethodItem.Value.length, "should be just one item").toBe(1);
      expect(deidentificationMethodItem.Value[0], "matches the expected value").toMatch(defaultValue);
    });

    test("Existing String item will be converted to an array item and additional value is added to the array.", () => {
      let dict = {
        "00120063": { Value: dummyValue, vr: DicomValueRepresentations.LO },
      };
      deIdentConfig.addAdditionalTags(dict);

      expect(dict[deIdentificationMethodTag], "DeIdentificationMethod should be added").toBeDefined();

      const deidentificationMethodItem = dict[deIdentificationMethodTag];

      expect(deidentificationMethodItem.Value.length, "should be two items").toBe(2);
      expect(deidentificationMethodItem.Value[0], "matches the existing value").toMatch(dummyValue);
      expect(deidentificationMethodItem.Value[1], "matches the added value").toMatch(defaultValue);
    });

    test("Existing item is keeped and additional value is added to the array if the size is not bigger than 64 characters.", () => {
      let dict = {
        "00120063": { Value: [dummyValue], vr: DicomValueRepresentations.LO },
      };
      deIdentConfig.addAdditionalTags(dict);

      expect(dict[deIdentificationMethodTag], "DeIdentificationMethod should be added").toBeDefined();

      const deidentificationMethodItem = dict[deIdentificationMethodTag];

      expect(deidentificationMethodItem.Value.length, "should be two items").toBe(2);
      expect(deidentificationMethodItem.Value[0], "matches the existing value").toMatch(dummyValue);
      expect(deidentificationMethodItem.Value[1], "matches the added value").toMatch(defaultValue);
    });

    test("Existing item is keeped and additional '...' is not added to the array if the size would become bigger than 64 characters.", () => {
      const tenCharacters = "0123456789";
      const fiftyCharacters = tenCharacters + tenCharacters + tenCharacters + tenCharacters + tenCharacters;

      let dict = {
        "00120063": {
          Value: [fiftyCharacters],
          vr: DicomValueRepresentations.LO,
        },
      };
      deIdentConfig.addAdditionalTags(dict);

      expect(dict[deIdentificationMethodTag], "DeIdentificationMethod should be added").toBeDefined();

      const deidentificationMethodItem = dict[deIdentificationMethodTag];

      expect(deidentificationMethodItem.Value.length, "should be two items").toBe(2);
      expect(deidentificationMethodItem.Value[0], "matches the existing value").toMatch(fiftyCharacters);
      expect(deidentificationMethodItem.Value[1], "matches the added value").toMatch("...");
    });

    test("Existing item is keeped and additional item is not added to the array if the size would become bigger than 64 characters.", () => {
      const tenCharacters = "0123456789";
      const sixtyCharacters =
        tenCharacters + tenCharacters + tenCharacters + tenCharacters + tenCharacters + tenCharacters;

      let dict = {
        "00120063": {
          Value: [sixtyCharacters],
          vr: DicomValueRepresentations.LO,
        },
      };
      deIdentConfig.addAdditionalTags(dict);

      expect(dict[deIdentificationMethodTag], "DeIdentificationMethod should be added").toBeDefined();

      const deidentificationMethodItem = dict[deIdentificationMethodTag];

      expect(deidentificationMethodItem.Value.length, "should be two items").toBe(1);
      expect(deidentificationMethodItem.Value[0], "matches the existing value").toMatch(sixtyCharacters);
    });
  });

  describe("Method cleanIdentifyingInformation tests", () => {
    const dummyItemPartOne = "dummy";
    const dummyItemPartTwo = "Value";
    const dummyItemPartThree = " abc";

    const dummyItemValue = dummyItemPartOne + dummyItemPartTwo + dummyItemPartThree;
    const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
    const configuration = factory.getConfiguration();

    test("Empty identity array does not change the value", () => {
      let dictionary = {
        "00102110": { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
      };

      configuration.cleanIdentifyingInformation(dictionary, "00102110", []);
      expect(dictionary["00102110"].Value).toBe(dummyItemValue);
    });

    test("Not matching identity item does not change the value", () => {
      let dictionary = {
        "00102110": { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
      };

      configuration.cleanIdentifyingInformation(dictionary, "00102110", ["not matching"]);
      expect(dictionary["00102110"].Value).toBe(dummyItemValue);
    });

    test("Matching identity item changes the value", () => {
      let dictionary = {
        "00102110": { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
      };

      configuration.cleanIdentifyingInformation(dictionary, "00102110", [dummyItemPartThree]);
      expect(dictionary["00102110"].Value).toBe(dummyItemPartOne + dummyItemPartTwo);
    });

    test("Matching identity items change the value", () => {
      let dictionary = {
        "00102110": { Value: dummyItemValue, vr: DicomValueRepresentations.LO },
      };

      configuration.cleanIdentifyingInformation(dictionary, "00102110", [dummyItemPartTwo, dummyItemPartThree]);
      expect(dictionary["00102110"].Value).toBe(dummyItemPartOne);
    });
  });

  describe("DeIdentification D actions", () => {
    // Replace with dummy value
    const dataSetDictionary = {};

    describe("returned parameter tests", () => {
      test("Configuration returns default replacement value if VR is is not part of the configuration", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const defaultParameter = "";
        const vr = "ABC";

        const tag = "00080023";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(defaultParameter);
      });

      test("Configuration returns '19000101' as replacement if VR is DA", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "19000101";
        const vr = "DA";

        const tag = "00080023";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });

      test("Configuration returns '000000.00' as replacement if VR is DT", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "000000.00";
        const vr = "DT";

        const tag = "00080023";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });

      test("Configuration returns '000000.000000' as replacement if VR is TM", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "000000.000000";
        const vr = "TM";

        const tag = "00080023";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });

      test("Configuration returns '000000.000000' as replacement if VR is PN", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "PN";
        const vr = "PN";

        const tag = "00080023";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });
    });

    describe("apply actions tests", () => {
      test("Replaces the original String value with the replacement parameter.", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const tag = "00080023";
        const vr = "dummy";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);
        const replacementParameter = "replacementParameter";

        action(dataSetDictionary, tag, replacementParameter);

        expect(dataSetDictionary[tag].Value).toBe(replacementParameter);
      });

      test("Replaces the original String value in Array with the replacement parameter.", () => {
        const originalValue = ["originalValue"];
        const element = {
          Value: originalValue,
        };
        const tag = "00080023";
        const vr = "dummy";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);
        const replacementParameter = "replacementParameter";

        action(dataSetDictionary, tag, replacementParameter);

        expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter]);
      });

      test("Replaces the original String values in Array with the replacement parameter.", () => {
        const originalValue = ["originalValue1", "originalValue2"];
        const element = {
          Value: originalValue,
        };
        const tag = "00080023";
        const vr = "dummy";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);
        const replacementParameter = "replacementParameter";

        action(dataSetDictionary, tag, replacementParameter);

        expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter, replacementParameter]);
      });

      // Not sure if that can happen
      test.skip("Replaces the empty Array with the replacement parameter.", () => {
        const originalValue = [];
        const element = {
          Value: originalValue,
        };
        const tag = "00080023";
        const vr = "dummy";
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);
        const replacementParameter = "replacementParameter";

        action(dataSetDictionary, tag, replacementParameter);

        expect(dataSetDictionary[tag].Value).toStrictEqual([replacementParameter]);
      });
    });
  });

  describe("DeIdentification Z actions", () => {
    // Replace with dummy value if parameter is not a zero value
    const dataSetDictionary = {};
    const exampleTag = "00080050";

    describe("returned parameter tests", () => {
      test("Configuration returns default replacement value if VR is is not part of the configuration", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const defaultParameter = "";
        const vr = "ABC";

        const tag = exampleTag;
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(defaultParameter);
      });

      test("Configuration returns '19000101' as replacement if VR is DA", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "19000101";
        const vr = "DA";

        const tag = exampleTag;
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });

      test("Configuration returns '000000.00' as replacement if VR is DT", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "000000.00";
        const vr = "DT";

        const tag = exampleTag;
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });

      test("Configuration returns '000000.000000' as replacement if VR is TM", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "000000.000000";
        const vr = "TM";

        const tag = exampleTag;
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });

      test("Configuration returns '000000.000000' as replacement if VR is PN", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
        };
        const expectedParameter = "PN";
        const vr = "PN";

        const tag = exampleTag;
        dataSetDictionary[tag] = element;

        const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
        const configuration = factory.getConfiguration();
        let { action, parameter } = configuration.getTask(tag, vr);

        expect(parameter).toBe(expectedParameter);
      });
    });

    describe("apply actions tests", () => {
      test("Replaces the original String value with the replacement parameter.", () => {
        const originalValue = "originalValue";
        const element = {
          Value: originalValue,
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
      });

      test("Replaces the original String value in Array with the replacement parameter.", () => {
        const originalValue = ["originalValue"];
        const element = {
          Value: originalValue,
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
      });

      test("Replaces the original String values in Array with the replacement parameter.", () => {
        const originalValue = ["originalValue1", "originalValue2"];
        const element = {
          Value: originalValue,
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
      });

      // ToDo: verify standard
      test("Empty Array stays empty.", () => {
        const originalValue = [];
        const element = {
          Value: originalValue,
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
      });

      // ToDo: verify standard
      test("Empty String in Array stays an empty string.", () => {
        const originalValue = [""];
        const element = {
          Value: originalValue,
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
      });
    });
  });

  describe("DeIdentification X actions", () => {
    // remove item
    const exampleTag = "00184000";
    const dataSetDictionary = {};

    test("Item will be deleted.", () => {
      const originalValue = ["abc"];
      const element = {
        Value: originalValue,
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
    });
  });

  describe("DeIdentification K actions", () => {
    // keep
    //Todo
  });

  describe("DeIdentification C actions", () => {
    test("placeholder", () => {
      expect(true).toBe(true);
    });
  });

  describe("DeIdentification KP actions", () => {
    test("Adds a prefix to the the original String value.", () => {
      const originalValue = "originalValue";
      const dataSetDictionary = {};

      const element = {
        Value: originalValue,
      };
      const tag = "00081030";
      const vr = "dummy";
      dataSetDictionary[tag] = element;

      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.RPB_PROFILE, uploadSlot);
      const configuration = factory.getConfiguration();
      let { action, parameter } = configuration.getTask(tag, vr);

      action(dataSetDictionary, tag, parameter);

      expect(dataSetDictionary[tag].Value).toBe("(" + parameter + ")-" + originalValue);
    });

    test("Adds a prefix to the the original String value in an Array.", () => {
      const originalValue = ["originalValue"];
      const dataSetDictionary = {};

      const element = {
        Value: originalValue,
      };
      const tag = "00081030";
      const vr = "dummy";
      dataSetDictionary[tag] = element;

      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.RPB_PROFILE, uploadSlot);
      const configuration = factory.getConfiguration();
      let { action, parameter } = configuration.getTask(tag, vr);

      action(dataSetDictionary, tag, parameter);

      expect(dataSetDictionary[tag].Value).toStrictEqual(["(" + parameter + ")-" + originalValue]);
    });

    // keep
    //Todo
  });

  describe("LongitudinalTemporalInformationModified Attribute setting", () => {
    let dataSetDictionary = {};

    describe("Basic Profile -> Configuration default value is removed", () => {
      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();

      test("DataSet Attribute is Removed", () => {
        dataSetDictionary = {
          "00280303": {
            Value: LongitudinalTemporalInformationModifiedAttribute.REMOVED,
          },
        };

        configuration.handleLongitudinalTemporalInformationModified(dataSetDictionary);
        expect(dataSetDictionary["00280303"].Value).toStrictEqual([
          LongitudinalTemporalInformationModifiedAttribute.REMOVED,
        ]);
      });
    });

    describe("Configuration is set to modified", () => {
      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      configuration.additionalTagValuesMap.set("00280303", LongitudinalTemporalInformationModifiedAttribute.MODIFIED);
      test("DataSet Attribute is Removed", () => {
        dataSetDictionary = {
          "00280303": {
            Value: LongitudinalTemporalInformationModifiedAttribute.REMOVED,
          },
        };

        configuration.handleLongitudinalTemporalInformationModified(dataSetDictionary);
        expect(dataSetDictionary["00280303"].Value).toStrictEqual([
          LongitudinalTemporalInformationModifiedAttribute.MODIFIED,
        ]);
      });
    });

    describe("Configuration is set to unmodified", () => {
      const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uploadSlot);
      const configuration = factory.getConfiguration();
      configuration.additionalTagValuesMap.set("00280303", LongitudinalTemporalInformationModifiedAttribute.UNMODIFIED);
      test("DataSet Attribute is Removed", () => {
        dataSetDictionary = {
          "00280303": {
            Value: LongitudinalTemporalInformationModifiedAttribute.REMOVED,
          },
        };

        configuration.handleLongitudinalTemporalInformationModified(dataSetDictionary);
        expect(dataSetDictionary["00280303"].Value).toStrictEqual([
          LongitudinalTemporalInformationModifiedAttribute.UNMODIFIED,
        ]);
      });
    });
  });
});
