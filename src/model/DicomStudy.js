/**
 * DicomStudy domain object
 */
export default class DicomStudy {

    series = {}

    constructor(studyInstanceUID, studyDate, studyDescription, patientID, patientName, patientBirthDate, patientSex) {
        this.studyInstanceUID = studyInstanceUID
        this.studyDate = studyDate
        this.studyDescription = studyDescription
        this.patientID = patientID
        this.patientBirthDate = patientBirthDate
        this.patientSex = patientSex
        this.patientName = patientName
        this.result = {}
    }

    getStudyType() {
        let modalities = this.getSeriesModalities()
        if ((modalities.includes('CT') || modalities.includes('MR')) && modalities.includes('RTSTRUCT') && !modalities.includes('RTPLAN') && !modalities.includes('RTDOSE')) {
            return 'Contouring'
        }
        else if (modalities.includes('RTSTRUCT') && modalities.includes('RTPLAN') && modalities.includes('RTDOSE')) {
            return 'TreatmentPlan'
        }
        else if (modalities.includes('PT') && modalities.includes('CT')) {
            return 'PET-CT'
        }
        else if (modalities.includes('PT') && modalities.includes('MR')) {
            return 'PET-MRI'
        }
        else if (modalities.includes('MR')) {
            return 'MRI'
        }
        else if (modalities.includes('CT')) {
            return 'CT'
        }
        else if (modalities.includes('US')) {
            return 'US'
        }
        else if (modalities.includes('SPECT')) {
            return 'SPECT'
        }
        else {
            return 'Other'
        }
    }

    addSeries(seriesObject) {
        if (!this.seriesExists(seriesObject.seriesInstanceUID)) {
            this.series[seriesObject.seriesInstanceUID] = seriesObject
            return seriesObject
        } else {
            throw new Error('Existing Series')
        }
    }

    seriesExists(seriesInstanceUID) {
        return Object.keys(this.series).includes(seriesInstanceUID)
    }

    getSeries(seriesInstanceUID) {
        return this.series[seriesInstanceUID]
    }

    getSeriesArray() {
        return Object.values(this.series)
    }

    getChildSeriesInstanceUIDs() {
        return Object.keys(this.series)
    }

    getStudyInstanceUID() {
        if (this.studyInstanceUID === null) {
            throw new Error('Missing StudyInstanceUID')
        }
        else return this.studyInstanceUID
    }

    getStudyDate() {
        return (this.studyDate === undefined || this.studyDate === null) ? '' : this.studyDate
    }

    getStudyDescription() {
        return (this.studyDescription === undefined || this.studyDescription === null) ? '' : this.studyDescription
    }

    getPatientBirthDate() {
        return (this.patientBirthDate === undefined || this.patientBirthDate === null) ? '' : this.patientBirthDate
    }

    getPatientSex() {
        return (this.patientSex === undefined || this.patientSex === null) ? '' : this.patientSex.toUpperCase()
    }

    getPatientID() {
        return (this.patientID === undefined || this.patientID === null) ? '' : this.patientID
    }

    /***
     * returns the Series modalities as an Array of Strings without duplicates
     */
    getSeriesModalities() {
        let childSeriesArray = this.getSeriesArray()
        let modalityArray = childSeriesArray.map(series => {
            return series.getModality()
        })

        return [...new Set(modalityArray)]
    }

    /***
     * returns all Series modalities as an Array of Strings with duplicates
     */
    getSeriesModalitiesArray() {
        let childSeriesArray = this.getSeriesArray()
        let modalityArray = childSeriesArray.map(series => {
            return series.getModality()
        })

        return modalityArray;
    }

    /**
     * returns the sum of files that belong to the study
     */
    getInstancesSize() {
        let childSeriesArray = this.getSeriesArray();
        let result = 0;
        for (let series in childSeriesArray) {
            result += childSeriesArray[series].getInstancesSize();
        }
        return result;
    }

    getSelectedSeriesInstances(selectedNodes) {
        for (let id in selectedNodes) {
            console.log(id);
        }
        return 6;


    }

    getSeriesByInstanceUID(id) {
        let childSeriesArray = this.getSeriesArray();
        return childSeriesArray[id];

    }

    setSlotAnalysisResult(result) {
        this.result = result;
    }

    getSlotAnalysisResult() {
        return this.result;
    }


}