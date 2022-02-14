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
        if (element === undefined) { return "" }

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
     * Returns tag item as a String or an empty String if the tag is undefined
     * @param {*} tag DICOM tag
     */
    _getDicomTag(tag) {
        const element = this.dataSet.elements['x' + tag]
        if (element !== undefined && element.length > 0) {
            // Return the string value of the DICOM attribute
            return this._getString(element)

            //this.dataSet.string('x' + tag)
        } else {
            return ""
        }
    }

    async readDicomFile() {
        const reader = await this.__pFileReader(this.fileObject);

        const arrayBuffer = reader.result;
        const byteArray = new Uint8Array(arrayBuffer);

        this.parseDicomData(byteArray);
    }

    parseDicomData(byteArray){
        this.byteArray = byteArray;
        this.dataSet = dicomParser.parseDicom(byteArray)

        this.studyInstanceUID = this.getStudyInstanceUID()
        this.seriesInstanceUID = this.getSeriesInstanceUID()

        const modality = this.getModality();
        this.parsedParameters = new Map();
        this.parsedParameters.set('Modality', modality);

        switch (modality) {
            case "RTSTRUCT":
                this.parseRtStructProperties(this.dataSet.elements, this.parsedParameters);
                break;
            case "RTPLAN":
                this.parseRtPlanProperties(this.dataSet.elements, this.parsedParameters);
                break;
            case "RTDOSE":
                this.parseRtDoseProperties(this.dataSet.elements, this.parsedParameters);
                break;
            case "RTIMAGE":
                this.parseRtImageProperties(this.dataSet.elements, this.parsedParameters);
                break;
            case "CT":
                this.parseCtProperties(this.dataSet.elements, this.parsedParameters);
                break;
            default:
            // 
        }
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

                    let structureSetROISequenceArray = [];
                    resultMap.set("StructureSetROISequence", structureSetROISequenceArray);

                    for (let structureSetROISequenceItem of element.items) {
                        let structureSetROIMap = new Map();
                        structureSetROISequenceArray.push(structureSetROIMap)

                        structureSetROIMap.set("ROINumber", this._getString(structureSetROISequenceItem.dataSet.elements['x30060022']));
                        structureSetROIMap.set("ReferencedFrameOfReferenceUID", this._getString(structureSetROISequenceItem.dataSet.elements['x30060024']));
                        structureSetROIMap.set("ROIName", this._getString(structureSetROISequenceItem.dataSet.elements['x30060026']));
                        structureSetROIMap.set("ROIGenerationAlgorithm", this._getString(structureSetROISequenceItem.dataSet.elements['x30060036']));
                    }

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

                    let rTROIObservationsSequenceArray = [];
                    resultMap.set("RTROIObservationsSequence", rTROIObservationsSequenceArray);

                    for (let rTROIObservationsItem of element.items) {
                        let rTROIObservationsMap = new Map();
                        rTROIObservationsSequenceArray.push(rTROIObservationsMap)

                        rTROIObservationsMap.set("ObservationNumber", this._getString(rTROIObservationsItem.dataSet.elements['x30060082']));
                        rTROIObservationsMap.set("ReferencedROINumber", this._getString(rTROIObservationsItem.dataSet.elements['x30060084']));
                        rTROIObservationsMap.set("ROIObservationLabel", this._getString(rTROIObservationsItem.dataSet.elements['x30060085']));
                        rTROIObservationsMap.set("RTROIInterpretedType", this._getString(rTROIObservationsItem.dataSet.elements['x300600a4']));
                        rTROIObservationsMap.set("ROI Interpreter", this._getString(rTROIObservationsItem.dataSet.elements['x300600a6']));
                    }

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
                    let referencedFrameOfReferenceSequenceArray = [];
                    resultMap.set("ReferencedFrameOfReferenceSequence", referencedFrameOfReferenceSequenceArray);

                    for (let frameOfReferenceItem of element.items) {
                        let frameOfReferenceMap = new Map();
                        referencedFrameOfReferenceSequenceArray.push(frameOfReferenceMap);

                        if (frameOfReferenceItem.dataSet.elements['x00200052']) {
                            frameOfReferenceMap.set("FrameOfReferenceUID", this._getString(frameOfReferenceItem.dataSet.elements['x00200052']));

                            let referencedStudySequenceArray = [];
                            frameOfReferenceMap.set("RTReferencedStudySequence", referencedStudySequenceArray);

                            if (frameOfReferenceItem.dataSet.elements['x30060012']) {

                                let rTReferencedStudyMap = new Map();
                                referencedStudySequenceArray.push(rTReferencedStudyMap);

                                for (let rTReferencedStudyItem of frameOfReferenceItem.dataSet.elements['x30060012'].items) {

                                    rTReferencedStudyMap.set("ReferencedSOPClassUID", this._getString(rTReferencedStudyItem.dataSet.elements['x00081150']));
                                    rTReferencedStudyMap.set("ReferencedSOPInstanceUID", this._getString(rTReferencedStudyItem.dataSet.elements['x00081155']));

                                    let contourImageSequenceArray = [];
                                    rTReferencedStudyMap.set("ContourImageSequence", contourImageSequenceArray)

                                    if (rTReferencedStudyItem.dataSet.elements['x30060014']) {

                                        for (let referencedContourImagesItem of rTReferencedStudyItem.dataSet.elements['x30060014'].items) {

                                            let referencedContourImagesMap = new Map();
                                            contourImageSequenceArray.push(referencedContourImagesMap);

                                            referencedContourImagesMap.set("SeriesInstanceUID", this._getString(referencedContourImagesItem.dataSet.elements['x0020000e']))

                                            let contourSequenceArray = [];
                                            referencedContourImagesMap.set("ContourSequence", contourSequenceArray);

                                            if (referencedContourImagesItem.dataSet.elements['x30060016']) {

                                                for (let contourSequenceItem of referencedContourImagesItem.dataSet.elements['x30060016'].items) {
                                                    let contourMap = new Map();
                                                    contourSequenceArray.push(contourMap);

                                                    contourMap.set("ReferencedSOPClassUID", this._getString(contourSequenceItem.dataSet.elements['x00081150']));
                                                    contourMap.set("ReferencedSOPInstanceUID", this._getString(contourSequenceItem.dataSet.elements['x00081155']));

                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    break;
                case "x00200052":
                    resultMap.set("FrameOfReferenceUID", this._getString(element));
                    resultMap.set("ReferencedFrameOfReferenceUID", this._getString(element));
                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    break;
                case "x00081030":
                    resultMap.set("StudyDescription", this._getString(element));
                    break;
                case "x0008103e":
                    resultMap.set("SeriesDescription", this._getString(element));
                    break;

                default:
                // 
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
                    let referencedStructureSetSequenceArray = [];
                    resultMap.set("ReferencedStructureSetSequence", referencedStructureSetSequenceArray);

                    for (let referencedStructureSetItem of element.items) {
                        let referencedStructureSetMap = new Map();
                        referencedStructureSetSequenceArray.push(referencedStructureSetMap)

                        referencedStructureSetMap.set("ReferencedSOPClassUID", this._getString(referencedStructureSetItem.dataSet.elements['x00081150']));
                        referencedStructureSetMap.set("ReferencedSOPInstanceUID", this._getString(referencedStructureSetItem.dataSet.elements['x00081155']));
                    }
                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    resultMap.set("ReferencedRTPlanUID", this._getString(element));
                    break;
                case "x00081030":
                    resultMap.set("StudyDescription", this._getString(element));
                    break;
                case "x0008103e":
                    resultMap.set("SeriesDescription", this._getString(element));
                    break;
                default:
                //
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
                    // "ReferencedRTPlanSequence"
                    let referenceRTPlanSequenceArray = [];
                    resultMap.set("ReferencedRTPlanSequence", referenceRTPlanSequenceArray);

                    for (let referencedRTPlanItem of element.items) {
                        let referencedStructureSetMap = new Map();
                        referenceRTPlanSequenceArray.push(referencedStructureSetMap)

                        referencedStructureSetMap.set("ReferencedSOPClassUID", this._getString(referencedRTPlanItem.dataSet.elements['x00081150']));
                        referencedStructureSetMap.set("ReferencedSOPInstanceUID", this._getString(referencedRTPlanItem.dataSet.elements['x00081155']));
                    }

                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    resultMap.set("ReferencedRTPlanUID", this._getString(element));
                    break;
                case "x00081030":
                    resultMap.set("StudyDescription", this._getString(element));
                    break;
                case "x0008103e":
                    resultMap.set("SeriesDescription", this._getString(element));
                    break;
                default:
                // 
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
                    let referenceRTPlanSequenceArray = [];
                    resultMap.set("ReferencedRTPlanSequence", referenceRTPlanSequenceArray);

                    for (let referencedRTPlanItem of element.items) {
                        let referencedStructureSetMap = new Map();
                        referenceRTPlanSequenceArray.push(referencedStructureSetMap)

                        referencedStructureSetMap.set("ReferencedSOPClassUID", this._getString(referencedRTPlanItem.dataSet.elements['x00081150']));
                        referencedStructureSetMap.set("ReferencedSOPInstanceUID", this._getString(referencedRTPlanItem.dataSet.elements['x00081155']));
                    }

                    break;
                case "x00081155":
                    resultMap.set("ReferencedSOPInstanceUID", this._getString(element));
                    resultMap.set("ReferencedRTPlanUID", this._getString(element));
                    break;
                case "x00081030":
                    resultMap.set("StudyDescription", this._getString(element));
                    break;
                case "x0008103e":
                    resultMap.set("SeriesDescription", this._getString(element));
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
                case "x00180015":
                    resultMap.set("BodyPartExamined", this._getString(element));
                    break;
                case "x00081030":
                    resultMap.set("StudyDescription", this._getString(element));
                    break;
                case "x0008103e":
                    resultMap.set("SeriesDescription", this._getString(element));
                    break;
                case "x00080008":
                    resultMap.set("ImageType", this._getString(element));
                    break;
                default:
                //
            }
        }
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
