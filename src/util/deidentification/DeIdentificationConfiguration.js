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

import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";
import DicomValueRepresentations from "../../constants/DicomValueRepresentations";
import LongitudinalTemporalInformationModifiedAttribute from "../../constants/LongitudinalTemporalInformationModifiedAttribute";
import { replaceContingentsWithMaskedNumberTag, replacePrivateTagsWithStringPrivate } from "./DeIdentificationHelper";

/**
 * The De-Identification configuration specifies the specific actions that will be applied
 * to the values of a specific tag element of the DICOM file within the de-identification process.
 */
export default class DeIdentificationConfiguration {
  constructor(
    actionConfigurationMap,
    defaultReplacementsValuesMap,
    tagSpecificReplacementsValuesMap,
    additionalTagValuesMap,
    uploadSlot
  ) {
    // tag -> action code
    this.actionConfigurationMap = actionConfigurationMap;
    // vr (of the tag) -> replacement value
    this.defaultReplacementsValuesMap = defaultReplacementsValuesMap;
    // tag -> replacement value
    this.tagSpecificReplacementsValuesMap = tagSpecificReplacementsValuesMap;
    // additional tags and values that will be added
    this.additionalTagValuesMap = additionalTagValuesMap;
    this.uploadSlot = uploadSlot;
  }

  // for testing
  getConfigurationMap() {
    return this.actionConfigurationMap;
  }

  /**
   * Returns the function that will be executed for the specific tag and vr
   */
  getTask(tag, vr) {
    // Mask specific number contingents
    tag = replaceContingentsWithMaskedNumberTag(tag);
    // Mask private Tags
    tag = replacePrivateTagsWithStringPrivate(tag);

    const elementActionConfiguration = this.actionConfigurationMap.get(tag);

    if (elementActionConfiguration === undefined) {
      return {
        action: this.noop,
        parameter: undefined,
        actionCode: "not defined",
      };
    } else {
      const action = elementActionConfiguration.action;

      switch (action) {
        case DeIdentificationActionCodes.C:
          return {
            action: this.cleanIdentifyingInformation.bind(this),
            parameter: undefined,
            actionCode: DeIdentificationActionCodes.C,
          };
          break;
        case DeIdentificationActionCodes.D:
          const replacementValue = this.getReplacementValue(tag, vr);
          return {
            action: this.replaceWithDummyValue.bind(this),
            parameter: replacementValue,
            actionCode: DeIdentificationActionCodes.D,
          };
          break;
        case DeIdentificationActionCodes.K:
          return {
            action: this.noop,
            parameter: undefined,
            actionCode: DeIdentificationActionCodes.K,
          };
          break;
        case DeIdentificationActionCodes.KP:
          return {
            action: this.keepAndAddPrefix.bind(this),
            parameter: this.uploadSlot.studyEdcCode,
            actionCode: DeIdentificationActionCodes.KP,
          };
          break;
        case DeIdentificationActionCodes.U:
          return {
            action: this.replaceUID.bind(this),
            parameter: undefined,
            actionCode: DeIdentificationActionCodes.U,
          };
          break;
        case DeIdentificationActionCodes.X:
          return {
            action: this.removeItem.bind(this),
            parameter: undefined,
            actionCode: DeIdentificationActionCodes.X,
          };
          break;
        case DeIdentificationActionCodes.Z:
          const parameter = this.getReplacementValue(tag, vr);
          return {
            action: this.replaceWithZeroLengthOrDummyValue.bind(this),
            parameter: parameter,
            actionCode: DeIdentificationActionCodes.Z,
          };
          break;
        default:
          throw new Error(`Action code: ${action} is not implemented`);
      }
    }
  }

  isUidReplacementCandidate(tag) {
    const elementActionConfiguration = this.actionConfigurationMap.get(tag);

    if (
      elementActionConfiguration != undefined &&
      elementActionConfiguration.action === DeIdentificationActionCodes.U
    ) {
      return true;
    }

    return false;
  }

  /**
   * Function that will do nothing - keeps the tag as it is.
   */
  noop(dictionary, propertyName, uidGenerator) {
    // do nothing
  }

  /**
   * Replaces identifying Strings that will be provided in the identifyingStringsArray with an empty String.
   */
  cleanIdentifyingInformation(dictionary, propertyName, identifyingStringsArray) {
    if (Array.isArray(identifyingStringsArray)) {
      for (let replValue of identifyingStringsArray) {
        let regex = new RegExp(replValue, "gi");
        const element = dictionary[propertyName];
        const vr = element.vr;

        if (this.isAStringValue(vr)) {
          const originalElementValue = element.Value;
          if (Array.isArray(originalElementValue)) {
            const newElementValue = [];

            for (let el of originalElementValue) {
              newElementValue.push(el.replace(regex, ""));
            }

            dictionary[propertyName].Value = newElementValue;
          } else {
            dictionary[propertyName].Value = originalElementValue.replace(regex, "");
          }
        } else {
          console.log(`Cleaning method for VR: ${vr} is not implemented yet.`);
        }
      }
    } else {
      throw `identifyingStringsArray is not an array: ${identifyingStringsArray.toString()}.`;
    }
  }

  isAStringValue(vr) {
    return (
      vr === DicomValueRepresentations.CS ||
      vr === DicomValueRepresentations.LT ||
      vr === DicomValueRepresentations.LO ||
      vr === DicomValueRepresentations.OB ||
      vr === DicomValueRepresentations.OW ||
      vr === DicomValueRepresentations.PN ||
      vr === DicomValueRepresentations.SH ||
      vr === DicomValueRepresentations.ST ||
      vr === DicomValueRepresentations.UN ||
      vr === DicomValueRepresentations.UT
    );
  }

  /**
   * Implementation of the function for action code D.
   */
  replaceWithDummyValue(dictionary, propertyName, replacement) {
    const originalElementValue = dictionary[propertyName].Value;
    if (Array.isArray(originalElementValue)) {
      const newElementValue = [];

      for (let el of originalElementValue) {
        newElementValue.push(replacement);
        // console.log(`replace ${propertyName} with dummy value ${replacement}`);
      }

      dictionary[propertyName].Value = newElementValue;
    } else {
      dictionary[propertyName].Value = replacement;
      // console.log(`replace ${propertyName} with dummy value ${replacement}`);
    }
  }

  /**
   * Implementation of the function for action code Z
   */
  replaceWithZeroLengthOrDummyValue(dictionary, propertyName, replacement) {
    const originalElementValue = dictionary[propertyName].Value;
    if (Array.isArray(originalElementValue)) {
      const newElementValue = [];
      if (originalElementValue.length > 0) {
        for (let el of originalElementValue) {
          if (el.length > 0) {
            newElementValue.push(replacement);
          } else {
            newElementValue.push("");
          }
        }
      } else {
        // do nothing
      }
      dictionary[propertyName].Value = newElementValue;
    } else {
      if (originalElementValue.length > 0) {
        dictionary[propertyName].Value = replacement;
      } else {
        newElementValue = "";
        dictionary[propertyName].Value = newElementValue;
      }
    }
  }

  /**
   * Implementation of the function for action code KP
   */
  keepAndAddPrefix(dictionary, propertyName, prefix) {
    const originalElementValue = dictionary[propertyName].Value;
    if (Array.isArray(originalElementValue)) {
      const newElementValue = [];
      if (originalElementValue.length > 0) {
        for (let el of originalElementValue) {
          newElementValue.push("(" + prefix + ")-" + el);
        }
      } else {
        // do nothing
      }
      dictionary[propertyName].Value = newElementValue;
    } else {
      dictionary[propertyName].Value = "(" + prefix + ")-" + originalElementValue;
    }
  }

  /**
   * Implementation of the function for action code U
   */
  replaceUID(dictionary, propertyName, dicomUidReplacements) {
    const originalElementValue = dictionary[propertyName].Value;
    let newElementValue;
    if (Array.isArray(originalElementValue)) {
      newElementValue = [];
      for (let uid of originalElementValue) {
        newElementValue.push(dicomUidReplacements.get(uid));
      }
    } else {
      newElementValue = dicomUidReplacements.get(originalElementValue);
    }
    dictionary[propertyName].Value = newElementValue;
  }

  /**
   * Implementation of the function for action code X
   */
  removeItem(dictionary, propertyName, dicomUidReplacements) {
    delete dictionary[propertyName];
  }

  /**
   * Specific tags will be added with default values if they are not in the data set
   */
  addDefaultTagsIfNecessary(dataSetDictionary) {
    if (dataSetDictionary["00081030"] == null && this.additionalTagValuesMap.get("00081030") != undefined) {
      dataSetDictionary["00081030"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("00081030")],
      };
    }

    if (dataSetDictionary["0008103E"] == null && this.additionalTagValuesMap.get("0008103E") != undefined) {
      dataSetDictionary["0008103E"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("0008103E")],
      };
    }

    const birthDateValue = this.getTagItemValueOrEmptyString(dataSetDictionary, "00100030");

    if (birthDateValue === "") {
      dataSetDictionary["00100030"] = {
        vr: DicomValueRepresentations.DA,
        Value: [this.defaultReplacementsValuesMap.get(DicomValueRepresentations.DA)],
      };
    }
  }

  /**
   * Adds or modifies additional tags to the data set that describe the applied de-identification process.
   */
  addAdditionalTags(dataSetDictionary) {
    // add Clinical Trial Subject Tags
    this.addClinicalTrialSubjectTagsIfDefined(dataSetDictionary);

    // Refering Physician tag is used for ({EDC-Code})-{SubjectId}
    this.addReferingPhysicianTagIfDefined(dataSetDictionary);

    this.addPatientNameAndIdTagsIfDefined(dataSetDictionary);

    // StudyComments tag is used for XNAT handling
    // "Project:{StudySiteProtocolID}  Subject:{Pseudonym} Session:{EDC-code}_{StudySubjectID}_{md5hash_base_10_digit string_from_pseudonymised_StudyInstaceUID}"
    this.addXnatSortingHelperTagAsStudyComment(dataSetDictionary);

    // PatientIdentityRemoved
    this.handlePatientIdentityRemovedTag(dataSetDictionary);

    // Longitudinal Temporal Information Modified
    this.handleLongitudinalTemporalInformationModified(dataSetDictionary);

    // DeidentificationMethod
    this.handleDeidentificationMethodTag(dataSetDictionary);

    // DeidentificationMethodCodeSequence
    this.handleDeidentificationMethodCodeSequenceTag(dataSetDictionary);

    // Todo:

    // Burned In Annotation 0028,0301
    // Recognizable Visual Features 0028,0302
    // Lossy Image Compression 0028,2110
  }

  addClinicalTrialSubjectTagsIfDefined(dataSetDictionary) {
    if (this.additionalTagValuesMap.get("00120020") != undefined) {
      dataSetDictionary["00120020"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("00120020")],
      };
    }

    if (this.additionalTagValuesMap.get("00120030") != undefined) {
      dataSetDictionary["00120030"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("00120030")],
      };
    }

    if (this.additionalTagValuesMap.get("00120040") != undefined) {
      dataSetDictionary["00120040"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("00120040")],
      };
    }
  }

  addReferingPhysicianTagIfDefined(dataSetDictionary) {
    if (this.additionalTagValuesMap.get("00080090") != undefined) {
      dataSetDictionary["00080090"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("00080090")],
      };
    }
  }

  addPatientNameAndIdTagsIfDefined(dataSetDictionary) {
    if (this.additionalTagValuesMap.get("00100010") != undefined) {
      dataSetDictionary["00100010"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("00100010")],
      };
    }

    if (this.additionalTagValuesMap.get("00100020") != undefined) {
      dataSetDictionary["00100020"] = {
        vr: DicomValueRepresentations.LO,
        Value: [this.additionalTagValuesMap.get("00100020")],
      };
    }
  }

  addXnatSortingHelperTagAsStudyComment(dataSetDictionary) {
    if (this.additionalTagValuesMap.get("00324000") != undefined) {
      dataSetDictionary["00324000"] = {
        vr: DicomValueRepresentations.LT,
        Value: [this.additionalTagValuesMap.get("00324000")],
      };
    }
  }

  /**
   * Adds or modifies the DeidentificationMethodCodeSequence tag.
   */
  handleDeidentificationMethodCodeSequenceTag(dictionary) {
    if (this.additionalTagValuesMap.get("00120064") != undefined) {
      if (dictionary["00120064"] === undefined) {
        // not deIdentified yet
        dictionary["00120064"] = {
          vr: DicomValueRepresentations.SQ,
          Value: this.additionalTagValuesMap.get("00120064"),
        };
      } else {
        const originalValue = dictionary["00120064"].Value;
        dictionary["00120064"] = {
          vr: DicomValueRepresentations.SQ,
          Value: originalValue.concat(this.additionalTagValuesMap.get("00120064")),
        };
      }
    }
  }

  /**
   * Adds or modifies the DeIdentificationMethod tag.
   */
  handleDeidentificationMethodTag(dataSetDictionary) {
    if (
      this.additionalTagValuesMap.get("00120063") != undefined &&
      this.additionalTagValuesMap.get("00120063-fallback") != undefined
    ) {
      const deIdentificationMethodValue = this.additionalTagValuesMap.get("00120063");
      const fallbackDeIdentificationMethodValue = this.additionalTagValuesMap.get("00120063-fallback");

      const currentDeIdentificationMethodItem = dataSetDictionary["00120063"];
      let currentDeIdentificationMethodValue;
      if (currentDeIdentificationMethodItem != undefined) {
        currentDeIdentificationMethodValue = currentDeIdentificationMethodItem.Value;
      }

      if (currentDeIdentificationMethodValue === undefined) {
        dataSetDictionary["00120063"] = {
          vr: DicomValueRepresentations.LO,
          Value: [deIdentificationMethodValue],
        };
      } else {
        let previousDeIdentificationMethodValue;

        if (!Array.isArray(currentDeIdentificationMethodValue)) {
          previousDeIdentificationMethodValue = [currentDeIdentificationMethodValue];
        } else {
          previousDeIdentificationMethodValue = currentDeIdentificationMethodValue;
        }

        const maxValueLength = 64; // (0012,0063) tag is Long String (LO);
        const strategie = this.detectDeIdentificationMethodTagHandlingStrategie(
          previousDeIdentificationMethodValue,
          deIdentificationMethodValue,
          fallbackDeIdentificationMethodValue,
          maxValueLength
        );

        switch (strategie) {
          case "append":
            previousDeIdentificationMethodValue.push(deIdentificationMethodValue);
            dataSetDictionary["00120063"] = {
              vr: DicomValueRepresentations.LO,
              Value: previousDeIdentificationMethodValue,
            };
            break;
          case "useFallBack":
            previousDeIdentificationMethodValue.push(fallbackDeIdentificationMethodValue);
            dataSetDictionary["00120063"] = {
              vr: DicomValueRepresentations.LO,
              Value: previousDeIdentificationMethodValue,
            };
            break;

          default:
            // cutPreviousItem

            if (previousDeIdentificationMethodValue.length == 1) {
              const offset = 1; // slice starts with position 0
              const slicePosition = maxValueLength - fallbackDeIdentificationMethodValue.length - offset;
              const cutPreviousDeIdentificationMethodValue = previousDeIdentificationMethodValue[0].slice(
                0,
                slicePosition
              );
              const value = [cutPreviousDeIdentificationMethodValue, fallbackDeIdentificationMethodValue];
              dataSetDictionary["00120063"] = {
                vr: DicomValueRepresentations.LO,
                Value: value,
              };
            } else {
              // more than one previous item -> fall back to full replacement
              dataSetDictionary["00120063"] = {
                vr: DicomValueRepresentations.LO,
                Value: [deIdentificationMethodValue],
              };
            }
        }
      }
    } else {
      throw new Error("The values for the de-identification method tag (00120063) are not defined.");
    }
  }

  detectDeIdentificationMethodTagHandlingStrategie(
    previousDeIdentificationMethodValue,
    deIdentificationMethodValue,
    fallbackDeIdentificationMethodValue,
    maxValueLength
  ) {
    const calculatedSizeAppend =
      2 + previousDeIdentificationMethodValue.toString().length + deIdentificationMethodValue.length;

    if (calculatedSizeAppend <= maxValueLength) {
      return "append";
    }

    const calculatedSizeFallback =
      2 + previousDeIdentificationMethodValue.toString().length + fallbackDeIdentificationMethodValue.length;

    if (calculatedSizeFallback <= maxValueLength) {
      return "useFallBack";
    }

    return "cutPreviousItem";
  }

  /**
   * Adds or modifies the PatientIdentityRemoved tag.
   */
  handlePatientIdentityRemovedTag(dataSetDictionary) {
    if (this.additionalTagValuesMap.get("00120062") != undefined) {
      dataSetDictionary["00120062"] = {
        vr: DicomValueRepresentations.CS,
        Value: [this.additionalTagValuesMap.get("00120062")],
      };
    }
  }

  /**
   * Adds or modifies the LongitudinalTemporalInformationModified tag
   */
  handleLongitudinalTemporalInformationModified(dataSetDictionary) {
    if (this.additionalTagValuesMap.get("00280303") != undefined) {
      if (dataSetDictionary["00280303"] != undefined && dataSetDictionary["00280303"].Value != undefined) {
        if (
          dataSetDictionary["00280303"].Value === LongitudinalTemporalInformationModifiedAttribute.MODIFIED &&
          this.additionalTagValuesMap.get("00280303") === LongitudinalTemporalInformationModifiedAttribute.UNMODIFIED
        ) {
          dataSetDictionary["00280303"] = {
            vr: DicomValueRepresentations.CS,
            Value: [LongitudinalTemporalInformationModifiedAttribute.MODIFIED],
          };

          return;
        }

        if (
          dataSetDictionary["00280303"].Value === LongitudinalTemporalInformationModifiedAttribute.MODIFIED &&
          this.additionalTagValuesMap.get("00280303") === LongitudinalTemporalInformationModifiedAttribute.REMOVED
        ) {
          dataSetDictionary["00280303"] = {
            vr: DicomValueRepresentations.CS,
            Value: [LongitudinalTemporalInformationModifiedAttribute.REMOVED],
          };

          return;
        }

        if (dataSetDictionary["00280303"].Value === LongitudinalTemporalInformationModifiedAttribute.REMOVED) {
          dataSetDictionary["00280303"] = {
            vr: DicomValueRepresentations.CS,
            Value: [LongitudinalTemporalInformationModifiedAttribute.REMOVED],
          };

          return;
        }
      }

      dataSetDictionary["00280303"] = {
        vr: DicomValueRepresentations.CS,
        Value: [this.additionalTagValuesMap.get("00280303")],
      };
    }
  }

  getReplacementValue(tag, vr) {
    let replacement = this.tagSpecificReplacementsValuesMap.get(tag);
    if (replacement == undefined) replacement = this.getDefaultReplacementValue(vr);
    return replacement;
  }

  getDefaultReplacementValue(vr) {
    let defaultReplacement = this.defaultReplacementsValuesMap.get(vr);
    if (defaultReplacement === undefined) defaultReplacement = this.defaultReplacementsValuesMap.get("default");
    return defaultReplacement;
  }

  getTagItemValueOrEmptyString(dataSetDictionary, tag) {
    if (dataSetDictionary[tag] == null) {
      return "";
    }

    if (dataSetDictionary[tag].Value == null) {
      return "";
    }

    if (dataSetDictionary[tag].Value[0] != null) {
      return dataSetDictionary[tag].Value[0];
    }

    return dataSetDictionary[tag].value;
  }
}
