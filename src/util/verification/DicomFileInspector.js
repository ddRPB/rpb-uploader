import dcmjs from 'dcmjs';


const { DicomMetaDictionary, DicomDict, DicomMessage } = dcmjs.data;
const { cleanTags } = dcmjs.anonymizer;


export default class DicomFileInspector {


    constructor(fileObject, deIdentificationConfiguration) {
        this.fileObject = fileObject;
        this.deIdentificationConfiguration = deIdentificationConfiguration;
        this.uids = [];

    }

    async getBufferForTest() {
        return this.readDicomFile(this.fileObject);
    }

    async analyzeFile() {
        try {
            const reader = await this.__pFileReader(this.fileObject.fileObject);
            const arrayBuffer = reader.result;

            const uidArray = await this.readDicomFile(arrayBuffer);
            return uidArray;
        } catch (e) {
            console.log("DicomFileInspector.analyzeFile : " + e.toString());
        }

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
                console.log("DicomFileInspector.__pFileReader: " + error);
                reject(error);
            }
        });
    }

    readDicomFile(arrayBuffer) {

        let uidArray = [];

        try {
            this.dataSet = DicomMessage.readFile(arrayBuffer);
        } catch (e) {
            console.log("DicomFileInspector.readDicomFile.readFile: " + e.toString());
        }
        try {
            uidArray = uidArray.concat(this.parseDicomData(this.dataSet.meta));
        } catch (e) {
            console.log("DicomFileInspector.readDicomFile.this.dataSet.meta: " + e.toString());
        } try {
            uidArray = uidArray.concat(this.parseDicomData(this.dataSet.dict));
        } catch (e) {
            console.log("DicomFileInspector.readDicomFile  this.dataSet.dict: " + e.toString());
        }

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
                        // filter just tags that are supposed to be replaced by configuration
                        if (this.deIdentificationConfiguration.isUidReplacementCandidate(propertyName)) {
                            if (Array.isArray(element.Value)) {
                                uidArray = uidArray.concat(element.Value);
                            } else {
                                uidArray.push(element.Value);
                            }
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