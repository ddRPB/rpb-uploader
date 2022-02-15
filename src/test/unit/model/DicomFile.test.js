/**
 * @jest-environment jsdom
 */
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import DicomPropertyNames from '../../../constants/DicomPropertyNames';
import Modalities from '../../../constants/Modalities';
import DicomFile from '../../../model/DicomFile';

const readdir = promisify(fs.readdir)

const basicPath = path.join(__dirname, './../../data');
const dicomUidRegex = /^(([1-9][0-9]*)|0)(\.([1-9][0-9]*|0))+$/;

describe('Test Dicom CT File parsing', () => {
    const fileName = 'ctDicomFile.dcm';
    const dicomFileAsBuffer = fs.readFileSync(path.join(basicPath, fileName));

    const file = new DicomFile();
    file.parseDicomData(dicomFileAsBuffer);
    //    console.log(JSON.stringify(file, replacer));

    test('DicomFile object has all basic properties', () => {
        expect(file).toHasBasicDicomProperties(file);
    });
});


expect.extend({
    toHasBasicDicomProperties(file) {
        let failMessages = [];

        failMessages = failMessages.concat(verifyDicomUidProperty('StudyInstanceUID', file.studyInstanceUID));
        failMessages = failMessages.concat(verifyDicomUidProperty('SeriesInstanceUID', file.seriesInstanceUID));

        failMessages = failMessages.concat(verifyModalityString(file.parsedParameters.get('Modality'), Modalities.CT));
        failMessages = failMessages.concat(verifyCTProperties(file.parsedParameters));

        failMessages = failMessages.concat(verifyDicomUidProperty('SeriesInstanceUID', file.seriesInstanceUID));


        if (failMessages.length === 0) {
            return {
                message: () =>
                    'Basic Dicom properties test passed',
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

function verifyDicomUidProperty(propertyName, propertyValue) {
    const failMessages = [];
    if (propertyValue == null) {
        failMessages.push(`${propertyName} is null or undefined.`)
    } else {
        if (!propertyValue.match(dicomUidRegex)) {
            failMessages.push(`${propertyName} is not a Dicom UID.`)
        }
    }

    return failMessages;
}

function verifyModalityString(value, expectedModality) {
    const failMessages = [];
    if (value == null) {
        failMessages.push(`Modality is null or undefined.`)
    } else {
        if (expectedModality != null) {
            if (value != expectedModality)
                failMessages.push(`${value} is not the expected modality ${expectedModality}.`)
        } else {
            if (!value in Modalities) {
                failMessages.push(`${value} is not a modality.`)
            }
        }
    }

    return failMessages;
}

function verifyString(propertyName, propertyValue) {
    const failMessages = [];
    if (propertyValue == null) {
        failMessages.push(`String \"${propertyName}\" is null or undefined.`)
    } else {
        if (propertyValue.length === 0) {
            failMessages.push(`${propertyName} has no value.`);
        }
    }

    return failMessages;
}

function verifyCTProperties(propertyMap) {
    let failMessages = [];

    const expectedProperties = [
        DicomPropertyNames.SOPInstanceUID,
        DicomPropertyNames.StudyInstanceUID,
        DicomPropertyNames.SeriesInstanceUID,
        DicomPropertyNames.FrameOfReferenceUID,
        DicomPropertyNames.MediaStorageSOPInstanceUID,
        DicomPropertyNames.BodyPartExamined,
        DicomPropertyNames.StudyDescription,
        DicomPropertyNames.SeriesDescription,
        DicomPropertyNames.ImageType
    ];

    expectedProperties.forEach((value, index) => {
        if (!propertyMap.has(value)) {
            failMessages.push(`Expected CT property \"${value}\" not found. \"${index}\"`)
        } else {
            if (value.endsWith('UID')) {
                failMessages = failMessages.concat(verifyDicomUidProperty(value, propertyMap.get(value)))
            } else {
                failMessages = failMessages.concat(verifyString(value, propertyMap.get(value)));
            }
        }

    })

    return failMessages;
}
