import dcmjs from 'dcmjs';

const { DicomMetaDictionary, DicomDict, DicomMessage } = dcmjs.data;
const { cleanTags } = dcmjs.anonymizer;


export default class DicomFileDeIdentificationComponentDcmjs {


    constructor(uidGenerator, configuration, fileObject) {
        this.uidGenerator = uidGenerator;
        this.configuration = configuration;
        this.fileObject = fileObject;

    }

    async getBufferForTest() {
        return this.readDicomFile(this.fileObject);
    }

    async getBuffer() {
        const reader = await this.__pFileReader(this.fileObject.fileObject);

        const arrayBuffer = reader.result;

        return await this.readDicomFile(arrayBuffer);
    }



    __pFileReader(file) {
        return new Promise((resolve, reject) => {
            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = () => {
                resolve(fileReader);
            }
        });
    }

    async readDicomFile(arrayBuffer) {
        this.dataSet = DicomMessage.readFile(arrayBuffer);
        this.parseDicomData(this.dataSet.meta);
        this.parseDicomData(this.dataSet.dict);
    }

    parseDicomData(dataSetDict) {

        for (let propertyName in dataSetDict) {
            const element = dataSetDict[propertyName];

            if (element.vr) {
                const vr = element.vr;
                switch (vr) {
                    case 'SQ':
                        for (let seqElement of element.Value) {
                            this.parseDicomData(seqElement);
                        }
                        break;
                    default:
                        const action = this.configuration.getTask(propertyName);
                        action(dataSetDict, propertyName, this.uidGenerator);
                        break;
                }

            }



        }


    }

}