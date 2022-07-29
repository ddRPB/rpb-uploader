import dcmjs from 'dcmjs';
import DicomValueRepresentations from '../../constants/DicomValueRepresentations';


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

            const parsingResult = this.readDicomFile(arrayBuffer);
            return parsingResult;
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
        let identities = [];
        let dataSet;

        try {
            dataSet = DicomMessage.readFile(arrayBuffer);
        } catch (e) {
            console.log("DicomFileInspector.readDicomFile.readFile: " + e.toString());
        }
        try {
            let parsingResultMeta = this.parseDicomData(dataSet.meta);
            if (parsingResultMeta.uidArray) {
                uidArray = uidArray.concat(parsingResultMeta.uidArray);
            }
        } catch (e) {
            console.log("DicomFileInspector.readDicomFile.this.dataSet.meta: " + e.toString());
        } try {
            let parsingResult = this.parseDicomData(dataSet.dict);
            if (parsingResult.uidArray) {
                uidArray = uidArray.concat(parsingResult.uidArray);
            }
            if (parsingResult.identities) {
                identities = identities.concat(parsingResult.identities);
            }
        } catch (e) {
            console.log("DicomFileInspector.readDicomFile  this.dataSet.dict: " + e.toString());
        }

        return {
            uidArray,
            identities
        };

    }

    parseDicomData(dataSetDict) {
        let uidArray = [];
        const identityRemoved = this.isPatientIdentityRemoved(dataSetDict);
        let identities = [];

        for (let propertyName in dataSetDict) {
            const element = dataSetDict[propertyName];

            if (element.vr) {
                const vr = element.vr;
                switch (vr) {
                    case DicomValueRepresentations.SQ:
                        for (let seqElement of element.Value) {
                            let parsingResult = this.parseDicomData(seqElement);
                            if (parsingResult.uidArray) {
                                uidArray = uidArray.concat(parsingResult.uidArray);
                            }
                            if (parsingResult.identities) {
                                identities = identities.concat(parsingResult.identities);
                            }
                        }
                        break;

                    case DicomValueRepresentations.UI:
                        // filter just tags that are supposed to be replaced by configuration
                        if (this.deIdentificationConfiguration.isUidReplacementCandidate(propertyName)) {
                            if (Array.isArray(element.Value)) {
                                uidArray = uidArray.concat(element.Value);
                            } else {
                                uidArray.push(element.Value);
                            }
                        }
                        break;

                    case DicomValueRepresentations.PN:
                        const identityData = {};
                        let value = element.Value;
                        // unwrap array value if there is just one item
                        if (Array.isArray(value)) {
                            identities = identities.concat(value);
                        } else {
                            identities.push(value);
                        }

                        break;
                    default:
                        // console.log(`tag: ${propertyName} - value: ${element.Value}`)
                        break;
                }

            }

        }
        return {
            uidArray,
            identities: identities.filter(element => { return element !== "" })
        };
    }

    isPatientIdentityRemoved(dataSetDict) {
        const element = dataSetDict['00120062'];
        if (element != undefined) {
            if (element.value === 'YES') {
                return true;
            }
        }
        return false;
    }

}