import dcmjs from 'dcmjs';


const { DicomMetaDictionary, DicomDict, DicomMessage } = dcmjs.data;
const { cleanTags } = dcmjs.anonymizer;


export default class DicomFileInspector {


    constructor(fileObject) {
        this.fileObject = fileObject;
        this.uids = new Array();

    }

    async getBufferForTest() {
        return this.readDicomFile(this.fileObject);
    }

    async analyzeFile() {
        const reader = await this.__pFileReader(this.fileObject.fileObject);
        const arrayBuffer = reader.result;

        const uidArray = await this.readDicomFile(arrayBuffer);
        return uidArray;
    }

    getUids() {
        return this.uids;
    }

    async __pFileReader(file) {
        return new Promise((resolve, reject) => {
            var fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);
            fileReader.onload = () => {
                resolve(fileReader);
            }
            fileReader.onerror = (error) => {
                reject(error);
            }
        });
    }

    readDicomFile(arrayBuffer) {
        let uidArray = [];
        this.dataSet = DicomMessage.readFile(arrayBuffer);
        uidArray = uidArray.concat(this.parseDicomData(this.dataSet.meta));
        uidArray = uidArray.concat(this.parseDicomData(this.dataSet.dict));
        return uidArray;
    }

    parseDicomData(dataSetDict) {
        let uidArray = [];

        for (let propertyName in dataSetDict) {
            const element = dataSetDict[propertyName];

            if (element.vr) {
                const vr = element.vr;
                switch (vr) {
                    case 'SQ':
                        for (let seqElement of element.Value) {
                            uidArray = uidArray.concat(this.parseDicomData(seqElement));
                        }
                        break;

                    case 'UI':
                        if (Array.isArray(element.Value)) {
                            uidArray = uidArray.concat(element.Value);
                        } else {
                            uidArray.push(element.Value);
                        }
                        break;
                    default:
                        // console.log(`tag: ${propertyName} - value: ${element.Value}`)
                        break;
                }

            }

        }
        return uidArray;
    }

}