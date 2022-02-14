/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import DicomFile from '../../../model/DicomFile';
import { replacer } from '../../util/ObjectToStringHelper';

const readdir = promisify(fs.readdir)

const basicPath = path.join(__dirname, './../../data');
const dicomUidRegex = /^(([1-9][0-9]*)|0)(\.([1-9][0-9]*|0))+$/;

describe('Test Dicom CT File parsing', () => {
    const fileName = 'ctDicomFile.dcm';
    const dicomFileAsBuffer = fs.readFileSync(path.join(basicPath, fileName));

    const file = new DicomFile();
    file.parseDicomData(dicomFileAsBuffer);
    console.log(JSON.stringify(file, replacer));

    test('StudyInstanceUID', () => {
        expect(file.studyInstanceUID).toBeDefined();
        expect(file.studyInstanceUID).toMatch(dicomUidRegex);
    });

    test('DicomFile object has all basic properties', () => {
        expect(file).toHasBasicDicomProperties(file);
    });
});


expect.extend({
    toHasBasicDicomProperties(file) {
        const failMessages = [];

        const studyInstanceUID = file.studyInstanceUID;

        if (studyInstanceUID == null) {
            failMessages.push(`StudyInstanceUID is null or undefined.`)
        } else {
            if (!studyInstanceUID.match(dicomUidRegex)) {
                failMessages.push(`StudyInstanceUID is not a Dicom UID.`)
            }
        }



        if (failMessages.length === 0) {
            return {
                message: () =>
                    'Basic Dicom properties passed',
                pass: true,
            };
        } else {
            return {
                message: () =>
                    failMessages.toString(),
                pass: false,
            };
        }
    },
});
