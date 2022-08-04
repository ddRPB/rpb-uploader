import dcmjs from 'dcmjs';

const { DicomMetaDictionary, DicomDict, DicomMessage } = dcmjs.data;
const { cleanTags } = dcmjs.anonymizer;


export default class DicomFileDeIdentificationComponentDcmjs {


    constructor(dicomUidReplacements, configuration, fileObject, logger) {
        this.dicomUidReplacements = dicomUidReplacements;
        this.configuration = configuration;
        this.fileObject = fileObject;
        if (logger != null) {
            this.log = logger;
        } else {
            this.log = new Logger(LogLevels.FATAL);
        }

    }

    async getBufferForTest() {
        return this.deIdentDicomFile(this.fileObject);
    }

    async getDeIdentifiedFileContentAsBuffer() {
        this.log.trace('Start de-identification of file', {}, { name: this.fileObject.fileObject.name })
        const reader = await this.__pFileReader(this.fileObject.fileObject);

        const arrayBuffer = reader.result;
        this.log.trace('file content read', {}, { name: this.fileObject.fileObject.name });

        return {
            name: this.fileObject.fileObject.name,
            path: this.fileObject.fileObject.path,
            size: this.fileObject.fileObject.size,
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
        this.log.trace('DicomMessage file content read.', {}, { name: this.fileObject.fileObject.name });

        this.applyDeIdentificationActions(this.dataSet.meta);
        this.log.trace('Meta section de-identified.', {}, { name: this.fileObject.fileObject.name });

        this.applyDeIdentificationActions(this.dataSet.dict);
        this.log.trace('Dict section de-identified.', {}, { name: this.fileObject.fileObject.name });

        this.configuration.addReplacementTags(this.dataSet.dict);
        this.log.trace('Replacement tags added.', {}, { name: this.fileObject.fileObject.name });

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