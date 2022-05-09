
import dcmjs from 'dcmjs';
import fs from 'fs';
import path from 'path';
import DeIdentificationProfiles from "../../../constants/DeIdentificationProfiles";
import DeIdentificationConfigurationFactory from '../../../util/deidentification/DeIdentificationConfigurationFactory';
import DicomFileDeIdentificationComponentDcmjs from '../../../util/deidentification/DicomFileDeIdentificationComponentDcmjs';
import DicomUIDGenerator from '../../../util/deidentification/DicomUIDGenerator';

const { DicomMetaDictionary, DicomDict, DicomMessage } = dcmjs.data;
const { cleanTags } = dcmjs.anonymizer;



const basicPath = path.join(__dirname, './../../../test/data');
const fileName = 'rtStructFile.dcm';
const dicomFileAsBuffer = fs.readFileSync(path.join(__dirname, './../../../test/data', fileName));


describe('DicomFileDeIdentificationComponentDcmjs',
    () => {

        test('abc',
            async () => {
                const uidGenerator = new DicomUIDGenerator();
                const factory = new DeIdentificationConfigurationFactory(DeIdentificationProfiles.BASIC, uidGenerator);
                const configuration = factory.getConfiguration();
                const file = dicomFileAsBuffer.buffer;

                const deIdentificationComponent = new DicomFileDeIdentificationComponentDcmjs(uidGenerator, configuration, file);
                await deIdentificationComponent.getBufferForTest();
                expect(true).toBe(false);
            }
        )
    }
)