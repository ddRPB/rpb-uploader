// Cornerstone dicomParser
import dicomParser from 'dicom-parser'

/**
 * DICOM file representation
 */
export default class DicomFile {

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

    getSeriesInstanceUID() {
        return this._getDicomTag('0020000e')
    }

    getStudyInstanceUID() {
        return this._getDicomTag('0020000d')
    }
}
