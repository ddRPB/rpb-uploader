import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";
import DicomValueRepresentations from "../../constants/DicomValueRepresentations";
import { replaceContingentsWithMaskedNumberTag, replacePrivateTagsWithStringPrivate } from "./DeIdentificationHelper";

export default class DeIdentificationConfiguration {

    constructor(actionConfigurationMap, defaultReplacementsValuesMap, tagSpecificReplacementsValuesMap, additionalTagValuesMap) {
        this.actionConfigurationMap = actionConfigurationMap;
        this.defaultReplacementsValuesMap = defaultReplacementsValuesMap;
        this.tagSpecificReplacementsValuesMap = tagSpecificReplacementsValuesMap;
        this.additionalTagValuesMap = additionalTagValuesMap;
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

    noop(dictionary, propertyName, uidGenerator) {
        // console.log(`do nothing ${propertyName}`);
    }

    replaceWithDummyValue(dictionary, propertyName, replacement) {
        const originalElementValue = dictionary[propertyName].Value;
        if (Array.isArray(originalElementValue)) {
            const newElementValue = [];

            for (let el of originalElementValue) {
                newElementValue.push(replacement);
                console.log(`replace ${propertyName} with dummy value ${replacement}`);
            }

            dictionary[propertyName].Value = newElementValue;

        } else {
            dictionary[propertyName].Value = replacement;
            console.log(`replace ${propertyName} with dummy value ${replacement}`);
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
                console.log(`replace ${propertyName} with dummy value ${replacement}`);
            } else {
                console.log(`replace ${propertyName} with zero length array`);
            }
            dictionary[propertyName].Value = newElementValue;

        } else {
            if (originalElementValue.length > 0) {
                dictionary[propertyName].Value = replacement;
                console.log(`replace ${propertyName} with dummy value ${replacement}`);
            } else {
                newElementValue = '';
                dictionary[propertyName].Value = newElementValue;
                console.log(`replace ${propertyName} with zero length value`);
            }

        }
    }

    replaceUID(dictionary, propertyName, dicomUidReplacements) {
        const originalElementValue = dictionary[propertyName].Value;
        let newElementValue;
        if (Array.isArray(originalElementValue)) {
            newElementValue = [];
            for (let uid of originalElementValue) {
                newElementValue.push(dicomUidReplacements.get(uid));
                console.log(`replace ${uid} uid with  ${dicomUidReplacements.get(uid)}`);
            }
        } else {
            newElementValue = dicomUidReplacements.get(uid);
            console.log(`replace ${originalElementValue} uid with  ${dicomUidReplacements.get(originalElementValue)}`);
        }
        dictionary[propertyName].Value = newElementValue;

    }

    removeItem(dictionary, propertyName, dicomUidReplacements) {
        delete dictionary[propertyName];
        console.log(`remove item ${propertyName}`);
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