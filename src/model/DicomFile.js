// Cornerstone dicomParser
import dicomParser from 'dicom-parser'
import DicomInstance from './DicomInstance'
import DicomSeries from './DicomSeries'
// DICOM domain model
import DicomStudy from './DicomStudy'


/**
 * DICOM file representation
 */
export default class DicomFile {

    dicomDirSopValues = [
        '1.2.840.10008.1.3.10'
    ]

    constructor(fileObject) {
        this.fileObject = fileObject
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

    /**
     * Returns element content as a string
     * @param {*} element element from the data set
     */
    _getString(element) {
        let position = element.dataOffset
        const length = element.length

        if (length < 0) {
            throw Error('Negative length')
        }
        if (position + length > this.byteArray.length) {
            throw Error('Out of range index')
        }

        var result = ''
        var byte

        for (var i = 0; i < length; i++) {
            byte = this.byteArray[position + i]
            if (byte === 0) {
                position += length
                return result.trim()
            }
            result += String.fromCharCode(byte)
        }
        return result.trim()
    }

    /**
     * Returns tag contain as a string or undefined
     * @param {*} tag DICOM tag
     */
    _getDicomTag(tag) {
        const element = this.dataSet.elements['x' + tag]
        if (element !== undefined && element.length > 0) {
            // Return the string value of the DICOM attribute
            return this._getString(element)
        } else {
            return undefined
        }
    }

    readDicomFile() {
        let self = this

        return this.__pFileReader(this.fileObject).then(reader => {
            const arrayBuffer = reader.result
            const byteArray = new Uint8Array(arrayBuffer)

            self.byteArray = byteArray
            self.dataSet = dicomParser.parseDicom(byteArray)

            self.studyInstanceUID = self.getStudyInstanceUID()
            self.seriesInstanceUID = self.getSeriesInstanceUID()

            const modality = self.getModality();
            self.parsedParameters = new Map();
            self.parsedParameters.set('Modality', modality);


            switch (modality) {
                case "RTSTRUCT":
                    self.parseRtStructProperties(self.dataSet.elements, self.parsedParameters);
                    // console.log(self.parsedParameters);
                    break;
                case "RTPLAN":
                    self.parseRtPlanProperties(self.dataSet.elements, self.parsedParameters);
                    break;
                case "RTDOSE":
                    self.parseRtDoseProperties(self.dataSet.elements, self.parsedParameters);
                    break;
                case "RTIMAGE":
                    self.parseRtImageProperties(self.dataSet.elements, self.parsedParameters);
                    break;
                case "CT":
                    self.parseCtProperties(self.dataSet.elements, self.parsedParameters);
                    // console.log(self.parsedParameters);
                    break;
                default:
                    console.log(`Modality: ${modality}`);
            }

            // console.log(self.parsedParameters);

        }).catch((error) => {
            throw error
        })
    }


    parseRtStructProperties(elements, resultMap) {

        for (let propertyName in elements) {
            let element = elements[propertyName];

            switch (element.tag) {
                case "x00080018":
                    resultMap.set("SOPInstanceUID", this._getString(element));
                    break;
                case "x0020000d":
                    resultMap.set("StudyInstanceUID", this._getString(element));
                    break;
                case "x0020000e":
                    resultMap.set("SeriesInstanceUID", this._getString(element));
                    break;
                // case "x00200052":
                //     resultMap.set("FrameOfReferenceUID", this._getString(element));
                //     break;
                case "x30060002":
                    resultMap.set("StructureSetLabel", this._getString(element));
                    break;
                case "x30060004":
                    resultMap.set("StructureSetName", this._getString(element));
                    break;
                case "x30060006":
                    resultMap.set("StructureSetDescription", this._getString(element));
                    break;
                case "x30060008":
                    resultMap.set("StructureSetDate", this._getString(element));
                    break;
                case "x30060020":
                    // "StructureSetROISequence"
                    this.parseRtStructProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                case "x30060022":
                    resultMap.set("ROINumber", this._getString(element));
                    break;
                case "x30060024":
                    resultMap.set("ReferencedFrameOfReferenceUID", this._getString(element));
                    break;
                case "x30060026":
                    resultMap.set("ROIName", this._getString(element));
                    break;
                case "x30060028":
                    resultMap.set("ROIDescription", this._getString(element));
                    break;
                case "x3006002c":
                    resultMap.set("ROIVolume", this._getString(element));
                    break;
                case "x30060036":
                    resultMap.set("ROIGenerationAlgorithm", this._getString(element));
                    break;
                case "x30060080":
                    // "RTROIObservationsSequence"
                    this.parseRtStructProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                case "x30060082":
                    resultMap.set("ObservationNumber", this._getString(element));
                    break;
                case "x30060084":
                    resultMap.set("ReferencedROINumber", this._getString(element));
                    break;
                case "x30060085":
                    resultMap.set("ROIObservationLabel", this._getString(element));
                    break;
                case "x30060088":
                    resultMap.set("ROIObservationDescription", this._getString(element));
                    break;
                case "x300600a4":
                    resultMap.set("RTROIInterpretedType", this._getString(element));
                    break;
                case "x30060010":
                    // "ReferencedFrameOfReferenceSequence"
                    this.parseRtStructProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                case "x00200052":
                    resultMap.set("FrameOfReferenceUID", this._getString(element));
                    resultMap.set("ReferencedFrameOfReferenceUID", this._getString(element));
                    break;
                case "x30060012":
                    // "RTReferencedStudySequence"
                    this.parseRtStructProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    break;
                case "x30060014":
                    // "RTReferencedSeriesSequence"
                    this.parseRtStructProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                // case "x0020000e":
                //     resultMap.set("SeriesInstanceUID", this._getString(element));
                //     break;
                default:
            }
        }
    }

    parseRtPlanProperties(elements, resultMap) {

        for (let propertyName in elements) {
            let element = elements[propertyName];

            switch (element.tag) {
                case "x00080018":
                    resultMap.set("SOPInstanceUID", this._getString(element));
                    break;
                case "x0020000d":
                    resultMap.set("StudyInstanceUID", this._getString(element));
                    break;
                case "x0020000e":
                    resultMap.set("SeriesInstanceUID", this._getString(element));
                    break;
                case "x00200052":
                    resultMap.set("FrameOfReferenceUID", this._getString(element));
                    break;
                case "x300a0002":
                    resultMap.set("RTPlanLabel", this._getString(element));
                    break;
                case "x300a0003":
                    resultMap.set("RTPlanName", this._getString(element));
                    break;
                case "x300a0004":
                    resultMap.set("RTPlanDescription", this._getString(element));
                    break;
                case "x300a000e":
                    resultMap.set("PrescriptionDescription", this._getString(element));
                    break;
                case "x300a0006":
                    resultMap.set("RTPlanDate", this._getString(element));
                    break;
                case "x300a000c":
                    resultMap.set("RTPlanGeometry", this._getString(element));
                    break;
                case "x300c0060":
                    // "ReferencedStructureSetSequence"
                    this.parseRtPlanProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    resultMap.set("ReferencedRTPlanUID", this._getString(element));
                    break;
                default:
            }
        }
    }

    parseRtDoseProperties(elements, resultMap) {

        for (let propertyName in elements) {
            let element = elements[propertyName];

            switch (element.tag) {
                case "x00080018":
                    resultMap.set("SOPInstanceUID", this._getString(element));
                    break;
                case "x0020000d":
                    resultMap.set("StudyInstanceUID", this._getString(element));
                    break;
                case "x0020000e":
                    resultMap.set("SeriesInstanceUID", this._getString(element));
                    break;
                case "x00200052":
                    resultMap.set("FrameOfReferenceUID", this._getString(element));
                    break;
                case "x30040002":
                    resultMap.set("DoseUnits", this._getString(element));
                    break;
                case "x30040004":
                    resultMap.set("DoseType", this._getString(element));
                    break;
                case "x30040006":
                    resultMap.set("DoseComment", this._getString(element));
                    break;
                case "x3004000a":
                    resultMap.set("DoseSummationType", this._getString(element));
                    break;
                case "x00080012":
                    resultMap.set("InstanceCreationDate", this._getString(element));
                    break;
                case "x300c0002":
                    // "ReferencedRTDoseSequence"
                    this.parseRtDoseProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    resultMap.set("ReferencedRTPlanUID", this._getString(element));
                    break;
                default:
            }
        }
    }

    parseRtImageProperties(elements, resultMap) {

        for (let propertyName in elements) {
            let element = elements[propertyName];

            switch (element.tag) {
                case "x00080018":
                    resultMap.set("SOPInstanceUID", this._getString(element));
                    break;
                case "x0020000d":
                    resultMap.set("StudyInstanceUID", this._getString(element));
                    break;
                case "x0020000e":
                    resultMap.set("SeriesInstanceUID", this._getString(element));
                    break;
                case "x00200052":
                    resultMap.set("FrameOfReferenceUID", this._getString(element));
                    break;
                case "x30020002":
                    resultMap.set("RTImageLabel", this._getString(element));
                    break;
                case "x30020003":
                    resultMap.set("RTImageName", this._getString(element));
                    break;
                case "x30020004":
                    resultMap.set("RTImageDescription ", this._getString(element));
                    break;
                case "x00080012":
                    resultMap.set("InstanceCreationDate", this._getString(element));
                    break;
                case "x300c0002":
                    // "ReferencedRTPlanSequence"
                    this.parseRtImageProperties(element.items[0].dataSet.elements, resultMap);
                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    resultMap.set("ReferencedRTPlanUID", this._getString(element));
                    break;
                default:
            }
        }
    }

    parseCtProperties(elements, resultMap) {

        for (let propertyName in elements) {
            let element = elements[propertyName];

            switch (element.tag) {
                case "x00080018":
                    resultMap.set("SOPInstanceUID", this._getString(element));
                    break;
                case "x0020000d":
                    resultMap.set("StudyInstanceUID", this._getString(element));
                    break;
                case "x0020000e":
                    resultMap.set("SeriesInstanceUID", this._getString(element));
                    break;
                case "x00200052":
                    resultMap.set("FrameOfReferenceUID", this._getString(element));
                    break;
                case "x00020003":
                    resultMap.set("MediaStorageSOPInstanceUID", this._getString(element));
                    break;
                default:
            }
        }
    }

    getParameters(elements) {

        let resultMap = new Map()


        for (let propertyName in elements) {
            let element = elements[propertyName];

            if (element.vr) {
                if (element.vr === 'SQ') {
                    if (element.items) {
                        element.items.forEach(function (item) {
                            resultMap = new Map(this.getParameters(item.dataSet.elements), resultMap);
                        });
                    }

                }
            }

            switch (element.tag) {
                case "x00080060":
                    //result.set("test", this._getString(element))
                    break;
                case "x00081150":
                    resultMap.set("Referenced SOP Class UID Attribute", this._getString(element));
                    break;
                case "x300a0002":
                    resultMap.set("RTPlanLabel", this._getString(element));
                    break;
                default:

            }


        }

        return resultMap;

    }

    getStudyInstanceUID() {
        return this._getDicomTag('0020000d')
    }

    getSeriesInstanceUID() {
        return this._getDicomTag('0020000e')
    }

    getSOPInstanceUID() {
        return this._getDicomTag('00080018')
    }

    getSOPClassUID() {
        return this._getDicomTag('00020002')
    }

    getStudyDate() {
        return this._getDicomTag('00080020')
    }

    getStudyDescription() {
        return this._getDicomTag('00081030')
    }

    getSeriesDate() {
        return this._getDicomTag('00080021')
    }

    getSeriesDescription() {
        return this._getDicomTag('0008103e')
    }

    getModality() {
        return this._getDicomTag('00080060')
    }

    getPatientID() {
        return this._getDicomTag('00100020')
    }

    getPatientName() {
        return this._getDicomTag('00100010')
    }

    getPatientSex() {
        return this._getDicomTag('00100040')
    }

    getPatientBirthDate() {
        return this._getDicomTag('00100030')
    }

    isDicomDir() {
        return this.dicomDirSopValues.includes(this.getSOPClassUID())
    }

    getFilePath() {
        let res = this.fileObject.path;
        if (res === undefined) {
            // Uploaded by folder selection,
            //doesn't have a full path but has a webkitrelativepath
            res = this.fileObject.webkitRelativePath;
        }
        return res;
    }

    getDicomStudyObject() {
        return new DicomStudy(this.getStudyInstanceUID(), this.getStudyDate(), this.getStudyDescription(), this.getPatientID(), this.getPatientName(), this.getPatientBirthDate(), this.getPatientSex())
    }

    getDicomSeriesObject() {
        return new DicomSeries(this.getSeriesInstanceUID(), this.getSeriesDate(), this.getSeriesDescription(), this.getModality(), this.getStudyInstanceUID(), this.parsedParameters);
    }

    getDicomInstanceObject() {
        return new DicomInstance(this.fileObject, this.getSOPInstanceUID())
    }

}
