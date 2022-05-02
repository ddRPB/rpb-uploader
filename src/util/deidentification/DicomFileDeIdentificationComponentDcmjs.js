import dcmjs from 'dcmjs';

const { DicomMetaDictionary, DicomDict, DicomMessage } = dcmjs.data;
const { cleanTags } = dcmjs.anonymizer;


export default class DicomFileDeIdentificationComponentDcmjs {


    constructor(dicomUidReplacements, configuration, fileObject) {
        this.dicomUidReplacements = dicomUidReplacements;
        this.configuration = configuration;
        this.fileObject = fileObject;

    }

    async getBufferForTest() {
        return this.deIdentDicomFile(this.fileObject);
    }

    async getBuffer() {
        const reader = await this.__pFileReader(this.fileObject.fileObject);

        const arrayBuffer = reader.result;

        return {
            buffer: this.deIdentDicomFile(arrayBuffer)
        };
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

    deIdentDicomFile(arrayBuffer) {
        this.dataSet = DicomMessage.readFile(arrayBuffer);
        this.applyDeIdentificationActions(this.dataSet.meta);
        this.applyDeIdentificationActions(this.dataSet.dict);
        this.configuration.addReplacementTags(this.dataSet.dict);

        return this.dataSet.write();
    }

    applyDeIdentificationActions(dataSetDict) {

        for (let propertyName in dataSetDict) {
            const element = dataSetDict[propertyName];

            if (element.vr) {
                const vr = element.vr;
                switch (vr) {
                    case 'SQ':
                        for (let seqElement of element.Value) {
                            this.applyDeIdentificationActions(seqElement);
                        }
                        break;
                    default:
                        let { action, parameter } = this.configuration.getTask(propertyName, vr);
                        if (vr === 'UI') parameter = this.dicomUidReplacements;
                        action(dataSetDict, propertyName, parameter);
                        break;
                }

            }




        }


    }

}