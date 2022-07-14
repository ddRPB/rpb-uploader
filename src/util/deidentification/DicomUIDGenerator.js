import { customAlphabet } from 'nanoid';

//
// https://stackoverflow.com/questions/58009141/how-to-convert-uuid-guid-to-oid-dicom-uid-in-javascript

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
            const maxUidSize = 64;
            const size = maxUidSize - this.prefix.length;

            const custnanoid = customAlphabet('1234567890', size);
            let uidReplacement = custnanoid();

            // ensure it does not start with 0
            if (uidReplacement.startsWith('0')) {
                uidReplacement = uidReplacement.substring(1);
            }

            const replacedDicomUid = (`${this.prefix}${uidReplacement}`).substring(0, maxUidSize);

            this.originalUidToPseudomizedUidMap.set(originalUid, replacedDicomUid);
            return replacedDicomUid;
        } else {
            return replacement;
        }
    }


    getOriginalUidToPseudomizedUidMap(uids) {
        const uidMap = new Map();
        if (uids != null) {
            for (let uid of uids) {
                uidMap.set(uid, this.getUid(uid));
            }
        }
        return uidMap;
    }

}