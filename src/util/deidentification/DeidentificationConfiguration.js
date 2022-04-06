import DeIdentificationActionCodes from "../../constants/DeIdentificationActionCodes";

export default class DeIdentificationConfiguration {

    constructor(configurationMap) {
        this.configurationMap = configurationMap;
    }

    // for testing
    getConfigurationMap() {
        return this.configurationMap;
    }

    getTask(tag) {
        // Tag Exceptions - mask number contingents
        if (tag.startsWith('50')) {
            tag = '50xxxxxx';
        }
        if (tag.startsWith('60') && tag.endsWith('3000')) {
            tag = '60xx3000';
        }
        if (tag.startsWith('60') && tag.endsWith('4000')) {
            tag = '60xx4000';
        }
        // private tags
        const group = tag.slice(0, 4);
        if (group > 7 && group % 2 == 1) {
            tag = 'private';
        }


        const elementActionConfiguration = this.configurationMap.get(tag);
        if (elementActionConfiguration === undefined) {
            return this.noop;
        } else {
            const action = elementActionConfiguration.action;
            switch (action) {
                case DeIdentificationActionCodes.C:
                    // similar values; TODO
                    break;
                case DeIdentificationActionCodes.D:
                    return this.replaceWithDummyValue;
                    break;
                case DeIdentificationActionCodes.K:
                    return this.noop;
                    break;
                case DeIdentificationActionCodes.U:
                    return this.replaceUID;
                    break;
                case DeIdentificationActionCodes.X:
                    return this.removeItem;
                    break;
                case DeIdentificationActionCodes.Z:
                    return this.replaceWithZeroLengthValue;
                    break;
                default:
                    throw new Error(`Action code: ${action} is not implemented`);

            }
            return task;
        }

    }

    noop(dictionary, propertyName, uidGenerator) {
        console.log(`do nothing ${propertyName}`);
    }

    replaceWithDummyValue(dictionary, propertyName, uidGenerator) {
        const element = dictionary[propertyName];
        const vr = element.vr;

        switch (vr) {
            case 'UI':
                console.log('test');
                //...
                break;
            default:
                console.log('test');
        }

        if (Array.isArray(element.Value)) {
            console.log('array');
        }
        console.log(`replace ${propertyName} with dummy value`);
    }

    replaceWithZeroLengthValue(dictionary, propertyName, uidGenerator) {
        console.log(`replace ${propertyName} with zero length value`);
    }

    replaceUID(dictionary, propertyName, uidGenerator) {

        console.log(`replace ${propertyName} uid`);
    }

    removeItem(dictionary, propertyName, uidGenerator) {
        delete dictionary[propertyName];
        console.log(`remove item ${propertyName}`);
    }

}