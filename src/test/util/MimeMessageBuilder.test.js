import fs from 'fs';
import path from 'path';
import DicomFile from '../../model/DicomFile';
import MimeMessageBuilder from "../../util/MimeMessageBuilder";

describe("MimeMessageBuilder", () => {

    test.skip("creates a valid Mime message with one Dicom file", async () => {
        const basicPath = path.join(__dirname, './../../test/dicomfiles');
        const file = fs.readFileSync(path.join(basicPath, 'image-00000.dcm'));

        const originalDicomFile = new DicomFile();
        originalDicomFile.parseDicomData(file);

        const fileName = 'dummmyFileName';
        const contentId = 'dummyId';
        const contentDescription = 'description';
        const dataBuffer = Buffer.from(file, 'binary');

        const boundary = "XXXXXXXXX";

        const mimeMessageBuilder = new MimeMessageBuilder(boundary);

        const result = mimeMessageBuilder.addDicomContent(dataBuffer, fileName, contentId, contentDescription).build();
        const simpleParser = require('mailparser').simpleParser;
        let parsed = await simpleParser(result);
        let array = parsed.attachments;
        let fileBuffer = array[0].content;

        let receivedDicomFile = new DicomFile();
        receivedDicomFile.parseDicomData(fileBuffer);

        expect(receivedDicomFile).not.toBeUndefined;
        expect(receivedDicomFile.getModality()).toBe(originalDicomFile.getModality());
        expect(receivedDicomFile.getSOPInstanceUID()).toBe(originalDicomFile.getSOPInstanceUID());

    })
})