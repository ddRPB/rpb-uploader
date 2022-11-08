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
import YesNoEnum from "../../constants/dicomValueEnums/YesNoEnum";
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
                actionCode: 'not defined'
            };
        } else {
            const action = elementActionConfiguration.action;

            switch (action) {
                case DeIdentificationActionCodes.C:
                    return {
                        action: this.cleanIdentifyingInformation,
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
                        action: this.replaceUID,
                        parameter: undefined,
                        actionCode: DeIdentificationActionCodes.U,
                    };
                    break;
                case DeIdentificationActionCodes.X:
                    return {
                        action: this.removeItem,
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

        if (elementActionConfiguration != undefined && elementActionConfiguration.action === DeIdentificationActionCodes.U) {
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
                let regex = new RegExp(replValue, 'gi');
                const element = dictionary[propertyName];
                const vr = element.vr;

                if (this.isAStringValue(vr)) {
                    const originalElementValue = element.Value;
                    if (Array.isArray(originalElementValue)) {
                        const newElementValue = [];

                        for (let el of originalElementValue) {
                            newElementValue.push(el.replace(regex, ''));
                        }

                        dictionary[propertyName].Value = newElementValue;

                    } else {

                        dictionary[propertyName].Value = originalElementValue.replace(regex, '');
                    }
                } else {
                    console.log(`Cleaning method for VR: ${vr} is not implemented yet.`)
                }
            }
        } else {
            throw new Error(`identifyingStringsArray is not an array: ${identifyingStringsArray.toString()}.`);
        }
    }

    isAStringValue(vr) {
        return vr === DicomValueRepresentations.CS ||
            vr === DicomValueRepresentations.LT ||
            vr === DicomValueRepresentations.LO ||
            vr === DicomValueRepresentations.OB ||
            vr === DicomValueRepresentations.OW ||
            vr === DicomValueRepresentations.PN ||
            vr === DicomValueRepresentations.SH ||
            vr === DicomValueRepresentations.ST ||
            vr === DicomValueRepresentations.UN ||
            vr === DicomValueRepresentations.UT;
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
                        newElementValue.push('');
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
                newElementValue = '';
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
                    newElementValue.push('(' + prefix + ')-' + el);

                }
            } else {
                // do nothing
            }
            dictionary[propertyName].Value = newElementValue;

        } else {
            dictionary[propertyName].Value = '(' + prefix + ')-' + originalElementValue;

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
            newElementValue = dicomUidReplacements.get(uid);
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
     * Adds or modifies additional tags to the data set that describe the applied de-identification process.
     */
    addReplacementTags(dictionary) {

        // PatientIdentityRemoved
        this.handlePatientIdentityRemovedTag(dictionary);

        // DeidentificationMethod
        this.handleDeidentificationMethodTag(dictionary);

        // DeidentificationMethodCodeSequence
        this.handleDeidentificationMethodCodeSequenceTag(dictionary);

        // Longitudinal Temporal Information Modified Attribute

        if (dictionary['00280303'] === undefined) { // not defined yet
            dictionary['00280303'] = {
                vr: DicomValueRepresentations.CS,
                Value: LongitudinalTemporalInformationModifiedAttribute.UNMODIFIED
            };
        } // otherwise it would be modified in a previous step

        // Todo:

        // Burned In Annotation 0028,0301
        // Recognizable Visual Features 0028,0302
        // Lossy Image Compression 0028,2110


    }

    /**
     * Adds or modifies the DeidentificationMethodCodeSequence tag.
     */
    handleDeidentificationMethodCodeSequenceTag(dictionary) {
        if (this.additionalTagValuesMap.get('00120064') != undefined) {
            if (dictionary['00120064'] === undefined) { // not deIdentified yet
                dictionary['00120064'] = {
                    vr: DicomValueRepresentations.SQ,
                    Value: this.additionalTagValuesMap.get('00120064')
                };
            } else {
                const originalValue = dictionary['00120064'].Value;
                dictionary['00120064'] = {
                    vr: DicomValueRepresentations.SQ,
                    Value: originalValue.concat(this.additionalTagValuesMap.get('00120064'))
                };
            }
        }
    }

    /**
     * Adds or modifies the DeIdentificationMethod tag.
     */
    handleDeidentificationMethodTag(dictionary) {
        if (this.additionalTagValuesMap.get('00120063') != undefined) {
            const maxValueLength = 64;

            const currentDeIdentificationMethodItem = dictionary['00120063'];
            let currentDeIdentificationMethodValue;
            if (currentDeIdentificationMethodItem != undefined) {
                currentDeIdentificationMethodValue = currentDeIdentificationMethodItem.Value;
            }

            if (currentDeIdentificationMethodValue === undefined) {
                dictionary['00120063'] = {
                    vr: DicomValueRepresentations.LO,
                    Value: [this.additionalTagValuesMap.get('00120063')]
                };
            } else {
                let newDeIdentificationMethodValue;

                if (!Array.isArray(currentDeIdentificationMethodValue)) {
                    newDeIdentificationMethodValue = [currentDeIdentificationMethodValue];
                } else {
                    newDeIdentificationMethodValue = currentDeIdentificationMethodValue;
                }

                let calculatedSize = 2 + newDeIdentificationMethodValue.toString().length + this.additionalTagValuesMap.get('00120063').length;

                if (calculatedSize <= maxValueLength) {
                    newDeIdentificationMethodValue.push(this.additionalTagValuesMap.get('00120063'));
                    dictionary['00120063'] = {
                        vr: DicomValueRepresentations.LO,
                        Value: newDeIdentificationMethodValue
                    };
                } else {
                    const dots = '...';
                    calculatedSize = 2 + newDeIdentificationMethodValue.toString().length + dots.length;
                    if (calculatedSize <= maxValueLength) {
                        newDeIdentificationMethodValue.push(dots);
                        dictionary['00120063'] = {
                            vr: DicomValueRepresentations.LO,
                            Value: newDeIdentificationMethodValue
                        };
                    } else {
                        // do not change the value
                    }

                }
            }
        }
    }

    /**
     * Adds or modifies the PatientIdentityRemoved tag.
     */
    handlePatientIdentityRemovedTag(dictionary) {
        const patientDeIdentifiedItem = dictionary['00120062'];
        let patientDeIdentifiedValue;

        if (patientDeIdentifiedItem != undefined) {
            patientDeIdentifiedValue = patientDeIdentifiedItem.Value;
        }

        if (Array.isArray(patientDeIdentifiedValue)) {
            patientDeIdentifiedValue = patientDeIdentifiedValue[0];
        }

        if (this.additionalTagValuesMap.get('00120062') != undefined) {
            if (patientDeIdentifiedValue === undefined) { // not deIdentified yet
                dictionary['00120062'] = {
                    vr: DicomValueRepresentations.CS,
                    Value: [this.additionalTagValuesMap.get('00120062')]
                };
            } else if (patientDeIdentifiedValue === YesNoEnum.NO) { // patient identity is not already removed yet
                dictionary['00120062'] = {
                    vr: DicomValueRepresentations.CS,
                    Value: [this.additionalTagValuesMap.get('00120062')]
                };
            }
        }
    }

    getReplacementValue(tag, vr) {
        let replacement = this.tagSpecificReplacementsValuesMap.get(tag);
        if (replacement == undefined) replacement = this.getDefaultReplacementValue(vr);
        return replacement;
    }

    getDefaultReplacementValue(vr) {
        let defaultReplacement = this.defaultReplacementsValuesMap.get(vr);
        if (defaultReplacement === undefined) defaultReplacement = this.defaultReplacementsValuesMap.get('default');
        return defaultReplacement;

    }

}