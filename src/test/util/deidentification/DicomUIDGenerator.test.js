import { v4 as uuidv4 } from 'uuid';
import DicomUIDGenerator from '../../../util/deidentification/DicomUIDGenerator';

describe('Test DicomUIDGenerator', () => {

    describe('Basic Tests', () => {
        test('Generated UID is not undefined', () => {

            const uidGenerator = new DicomUIDGenerator();
            const originalUid = '12345';
            const generatedUid = uidGenerator.getUid(originalUid);

            expect(generatedUid != undefined);
            expect(generatedUid.length).toBe(64);
            expect(generatedUid).string;
            expect(generatedUid).toMatch(/^[0-9,.]+/);
        })

        test('Generated UID is consitent', () => {

            const uidGenerator = new DicomUIDGenerator();
            const originalUid = '12345';
            const generatedUidOne = uidGenerator.getUid(originalUid);
            const generatedUidTwo = uidGenerator.getUid(originalUid);

            expect(generatedUidOne).not.toBe(originalUid);
            expect(generatedUidTwo).not.toBe(originalUid);
            expect(generatedUidOne).toBe(generatedUidTwo);
        })

    })
})