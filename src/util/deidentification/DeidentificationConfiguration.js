import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";
import DicomValueRepresentations from "../../constants/DicomValueRepresentations";
import LongitudinalTemporalInformationModifiedAttribute from "../../constants/LongitudinalTemporalInformationModifiedAttribute";
import { replaceContingentsWithMaskedNumberTag, replacePrivateTagsWithStringPrivate } from "./DeIdentificationHelper";

export default class DeIdentificationConfiguration {

    constructor(
        actionConfigurationMap,
        defaultReplacementsValuesMap,
        tagSpecificReplacementsValuesMap,
        additionalTagValuesMap,
        uploadSlot
    ) {
        this.actionConfigurationMap = actionConfigurationMap;
        this.defaultReplacementsValuesMap = defaultReplacementsValuesMap;
        this.tagSpecificReplacementsValuesMap = tagSpecificReplacementsValuesMap;
        this.additionalTagValuesMap = additionalTagValuesMap;
        this.uploadSlot = uploadSlot;
    }


    // for testing
    getConfigurationMap() {
        return this.actionConfigurationMap;
    }

    getTask(tag, vr) {
        // Mask specific number contingents
        tag = replaceContingentsWithMaskedNumberTag(tag);
        // Mask private Tags
        tag = replacePrivateTagsWithStringPrivate(tag);

        const elementActionConfiguration = this.actionConfigurationMap.get(tag);

        if (elementActionConfiguration === undefined) {
            return {
                action: this.noop,
                parameter: undefined
            };
        } else {
            const action = elementActionConfiguration.action;
            switch (action) {
                case DeIdentificationActionCodes.C:
                    // similar values; TODO
                    break;
                case DeIdentificationActionCodes.D:
                    const replacementValue = this.getReplacementValue(tag, vr);

                    return {
                        action: this.replaceWithDummyValue.bind(this),
                        parameter: replacementValue
                    };
                    // return this.replaceWithDummyValue.bind(this);
                    break;
                case DeIdentificationActionCodes.K:
                    return {
                        action: this.noop,
                        parameter: undefined
                    };
                    // return this.noop;
                    break;
                case DeIdentificationActionCodes.KP:
                    return {
                        action: this.keepAndAddPrefix.bind(this),
                        parameter: this.uploadSlot.studyEdcCode
                    };
                    // return this.noop;
                    break;
                case DeIdentificationActionCodes.U:
                    return {
                        action: this.replaceUID,
                        parameter: undefined
                    };
                    // return this.replaceUID;
                    break;
                case DeIdentificationActionCodes.X:
                    return {
                        action: this.removeItem,
                        parameter: undefined
                    };
                    // return this.removeItem;
                    break;
                case DeIdentificationActionCodes.Z:
                    const parameter = this.getReplacementValue(tag, vr);

                    return {
                        action: this.replaceWithZeroLengthOrDummyValue.bind(this),
                        parameter: parameter
                    };
                    // return this.replaceWithZeroLengthOrDummyValue.bind(this);
                    break;
                default:
                    throw new Error(`Action code: ${action} is not implemented`);

            }
            return task;
        }

    }

    isUidReplacementCandidate(tag) {
        const elementActionConfiguration = this.actionConfigurationMap.get(tag);

        if (elementActionConfiguration != undefined && elementActionConfiguration.action === DeIdentificationActionCodes.U) {
            return true;
        }

        return false;
    }

    noop(dictionary, propertyName, uidGenerator) {
        // console.log(`do nothing ${propertyName}`);
    }

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
                // console.log(`replace ${propertyName} with dummy value ${replacement}`);
            } else {
                // console.log(`replace ${propertyName} with zero length array`);
            }
            dictionary[propertyName].Value = newElementValue;

        } else {
            if (originalElementValue.length > 0) {
                dictionary[propertyName].Value = replacement;
                // console.log(`replace ${propertyName} with dummy value ${replacement}`);
            } else {
                newElementValue = '';
                dictionary[propertyName].Value = newElementValue;
                // console.log(`replace ${propertyName} with zero length value`);
            }

        }
    }

    keepAndAddPrefix(dictionary, propertyName, prefix) {
        const originalElementValue = dictionary[propertyName].Value;
        if (Array.isArray(originalElementValue)) {
            const newElementValue = [];
            if (originalElementValue.length > 0) {
                for (let el of originalElementValue) {
                    newElementValue.push('(' + prefix + ')-' + el);

                }
                // console.log(`replace ${propertyName} with dummy value ${replacement}`);
            } else {
                // console.log(`replace ${propertyName} with zero length array`);
            }
            dictionary[propertyName].Value = newElementValue;

        } else {
            dictionary[propertyName].Value = '(' + prefix + ')-' + originalElementValue;

        }

    }

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

    removeItem(dictionary, propertyName, dicomUidReplacements) {
        delete dictionary[propertyName];
    }

    addReplacementTags(dictionary) {
        //Patient Identity Removed Attribute
        if (this.additionalTagValuesMap.get('00120062') != undefined) {
            if (dictionary['00120062'] === undefined) { // not deIdentified yet
                dictionary['00120062'] = {
                    vr: DicomValueRepresentations.CS,
                    Value: [this.additionalTagValuesMap.get('00120062')]
                };
            } else if (dictionary['00120062'].Value === ['false']) { // patient identity is not already removed yet
                dictionary['00120062'] = {
                    vr: DicomValueRepresentations.CS,
                    Value: [this.additionalTagValuesMap.get('00120062')]
                };
            }
        }

        if (this.additionalTagValuesMap.get('00120063') != undefined) {

            dictionary['00120063'] = {
                vr: DicomValueRepresentations.LO,
                Value: ['Per DICOM PS 3.15 AnnexE. Details in 0012,0064']
            }

        }

        // De-identification Method Code Sequence Attribute
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