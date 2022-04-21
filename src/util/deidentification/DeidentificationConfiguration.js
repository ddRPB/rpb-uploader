import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";
import { replaceContingentsWithMaskedNumberTag, replacePrivateTagsWithStringPrivate } from "./DeIdentificationHelper";

export default class DeIdentificationConfiguration {

    constructor(configurationMap) {
        this.configurationMap = configurationMap;
        this.replacementValues = this.getDefaultValues();
    }


    // for testing
    getConfigurationMap() {
        return this.configurationMap;
    }

    getTask(tag) {
        // Mask specific number contingents
        tag = replaceContingentsWithMaskedNumberTag(tag);
        // Mask private Tags
        tag = replacePrivateTagsWithStringPrivate(tag);

        const elementActionConfiguration = this.configurationMap.get(tag);

        if (elementActionConfiguration === undefined) {
            return {
                action: this.noop,
                parameter: this.noop
            };
        } else {
            const action = elementActionConfiguration.action;
            switch (action) {
                case DeIdentificationActionCodes.C:
                    // similar values; TODO
                    break;
                case DeIdentificationActionCodes.D:
                    return {
                        action: this.replaceWithDummyValue.bind(this),
                        parameter: this.noop
                    };
                    // return this.replaceWithDummyValue.bind(this);
                    break;
                case DeIdentificationActionCodes.K:
                    return {
                        action: this.noop,
                        parameter: this.noop
                    };
                    // return this.noop;
                    break;
                case DeIdentificationActionCodes.U:
                    return {
                        action: this.replaceUID,
                        parameter: this.noop
                    };
                    // return this.replaceUID;
                    break;
                case DeIdentificationActionCodes.X:
                    return {
                        action: this.removeItem,
                        parameter: this.noop
                    };
                    // return this.removeItem;
                    break;
                case DeIdentificationActionCodes.Z:
                    return {
                        action: this.replaceWithZeroLengthOrDummyValue.bind(this),
                        parameter: this.noop
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

    replaceWithDummyValue(dictionary, propertyName, dicomUidReplacements) {
        const element = dictionary[propertyName];
        const vr = element.vr;

        switch (vr) {
            case 'UI':
                // console.log('test');
                //...
                break;
            default:
            // console.log('test');
        }

        if (Array.isArray(element.Value)) {
            // console.log('array');
        }
        // console.log(`replace ${propertyName} with dummy value`);
    }

    replaceWithZeroLengthOrDummyValue(dictionary, propertyName, dicomUidReplacements) {
        const originalElementValue = dictionary[propertyName].Value;
        if (Array.isArray(originalElementValue)) {
            if (originalElementValue.length > 0) {
                // this.replaceWithDummyValue(dictionary, propertyName, dicomUidReplacements).bind(this);
            } else {
                newElementValue = [];
                dictionary[propertyName].Value = newElementValue;
                console.log(`replace ${propertyName} with zero length array`);
            }

        } else {
            newElementValue = '';
            dictionary[propertyName].Value = newElementValue;
            console.log(`replace ${propertyName} with zero length value`);
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

}