import { v4 as uuidv4 } from 'uuid';

export default class DicomUIDGenerator {

    constructor(prefix) {
        // add prefix logic (check length, charaters, ends with a '.' ....)
        this.prefix = prefix;
        if (prefix === undefined) {
            this.prefix = '2.25.'
        }
        this.generatedUidParts = [];
        this.originalUidToPseudomizedUidMap = new Map();
    }

    getUid(originalUid) {
        // TODO: verify that originalUid is valid
        const replacement = this.originalUidToPseudomizedUidMap.get(originalUid);
        if (replacement === undefined) {
            const uidPartOne = this.generateNewUidPart();
            const uidPartTwo = this.generateNewUidPart();

            const uidReplacement = `${uidPartOne}${uidPartTwo}`;
            const maxUidSize = 64;
            const replacedDicomUid = (`${this.prefix}${uidReplacement}`).substring(0, maxUidSize);
            this.originalUidToPseudomizedUidMap.set(originalUid, replacedDicomUid);
            return replacedDicomUid;
        } else {
            return replacement;
        }
    }

    generateNewUidPart() {
        const uuid = uuidv4().toString();
        const uid = uuid.replaceAll('-', '');

        let buffer = Buffer.from(uid);

        const result = [];

        for (let x = 0; x < buffer.length; x++) {
            result.push(buffer.readUInt8(x) % 10);
        }
        const generatedIntUid = result.join('');
        if (this.generatedUidParts.find(element => element === generatedIntUid)) {
            this.generateNewUidPart();
        } else {
            this.generatedUidParts.push(generatedIntUid);
            return generatedIntUid;
        }

    }

}