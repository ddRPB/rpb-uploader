// Cornerstone dicomParser
import dicomParser from 'dicom-parser'

// DICOM domain model
import DicomStudy from './DicomStudy'
import DicomSeries from './DicomSeries'
import DicomInstance from './DicomInstance'

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
        }).catch((error) => {
            throw error
        })
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
        return new DicomStudy(this.getStudyInstanceUID(), this.getStudyDate(), this.getStudyDescription(),  this.getPatientID(), this.getPatientName(), this.getPatientBirthDate(), this.getPatientSex())
    }

    getDicomSeriesObject() {
        return new DicomSeries(this.getSeriesInstanceUID(), this.getSeriesDate(), this.getSeriesDescription(), this.getModality(), this.getStudyInstanceUID());
    }

    getDicomInstanceObject() {
        return new DicomInstance(this.fileObject, this.getSOPInstanceUID())
    }
    
}
