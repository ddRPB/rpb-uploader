/*
 * This file is part of RadPlanBio
 * 
 * Copyright (C) 2013 - 2022 RPB Team
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation version 3 of the License.
 * 
 * This program is distributed in the hope that it will be useful
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 * 
 */

/**
 * DicomStudy domain object
 */
export default class DicomStudy {

    series = {}

    constructor(studyInstanceUID, studyDate, studyDescription, patientID, patientName, patientBirthDate, patientSex) {
        this.studyInstanceUID = studyInstanceUID
        this.studyDate = studyDate
        this.studyDescription = studyDescription
        this.patientID = new Set([(patientID === undefined || patientID === null) ? '' : patientID]);
        this.patientBirthDate = new Set([(patientBirthDate === undefined || patientBirthDate === null) ? '' : patientBirthDate]);
        this.patientSex = new Set([(patientSex === undefined || patientSex === null) ? '' : patientSex]);
        this.patientName = new Set([(patientName === undefined || patientName === null) ? '' : patientName]);
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

    addStudy(studyObject) {
        this.patientID = new Set([...this.patientID, ...studyObject.patientID]);
        this.patientBirthDate = new Set([...this.patientBirthDate, ...studyObject.patientBirthDate]);
        this.patientSex = new Set([...this.patientSex, ...studyObject.patientSex]);
        this.patientName = new Set([...this.patientName, ...studyObject.patientName]);
    }

    addSeries(seriesObject) {
        if (!this.seriesExists(seriesObject.seriesInstanceUID)) {
            this.series[seriesObject.seriesInstanceUID] = seriesObject;
            return seriesObject;
        } else {
            return this.series[seriesObject.seriesInstanceUID];
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
        [...this.patientBirthDate].join(' / ');
    }

    getPatientSex() {
        return [...this.patientSex].join(' / ');
    }

    getPatientID() {
        return [...this.patientID].join(' / ');
    }

    getPatientName() {
        return [...this.patientName].join(' / ');
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

    getSeriesByInstanceUID(id) {
        let childSeriesArray = this.getSeriesArray();
        return childSeriesArray[id];

    }

    propertiesHaveDifferentValues() {
        if (this.patientID.size > 1) { return true; }
        if (this.patientBirthDate.size > 1) { return true; }
        if (this.patientSex.size > 1) { return true; }
        if (this.patientName.size > 1) { return true; }
        return false;
    }

}