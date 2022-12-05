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
// DICOM domain model

/**
 * DicomSeries domain object
 */
export default class DicomSeries {

    instances = {};
    deIdentifiedStudyInstanceUID = null;
    deIdentifiedSeriesInstanceUID = null;
    uploadVerified = false;

    constructor(seriesInstanceUID, seriesDate, seriesDescription, modality, studyInstanceUID, parameters) {
        this.seriesInstanceUID = seriesInstanceUID
        this.seriesDate = seriesDate
        this.seriesDescription = seriesDescription
        this.modality = modality
        this.studyInstanceUID = studyInstanceUID
        this.parameters = parameters
    }

    getSeriesInstanceUID() {
        if (this.seriesInstanceUID == null) {
            throw new Error('Null SeriesInstanceUID')
        }
        return this.seriesInstanceUID
    }

    getSeriesDate() {
        return this.seriesDate == null ? '' : this.seriesDate
    }

    getSeriesDescription() {
        return this.seriesDescription == null ? '' : this.seriesDescription
    }

    getModality() {
        return this.modality == null ? '' : this.modality
    }

    getStudyInstanceUID() {
        if (this.studyInstanceUID == null) {
            throw new Error('Null StudyInstanceUID')
        }
        return this.studyInstanceUID
    }


    setDeIdentifiedStudyInstanceUID(uid) {
        this.deIdentifiedStudyInstanceUID = uid;
    }

    setDeIdentifiedStudyInstanceUID(uid) {
        this.deIdentifiedStudyInstanceUID = uid;
    }

    setUploadVerified(isVerified) {
        this.uploadVerified = isVerified;
    }

    addInstance(dicomInstance) {
        if (!this.instanceExists(dicomInstance.SOPInstanceUID)) {
            this.instances[dicomInstance.SOPInstanceUID] = dicomInstance
        } else {
            throw Error("Existing instance")
        }
    }

    instanceExists(SOPInstanceUID) {
        let knownInstancesUID = Object.keys(this.instances)
        return knownInstancesUID.includes(SOPInstanceUID)
    }

    getInstance(instanceUID) {
        return this.instances[instanceUID]
    }

    getInstances() {
        return Object.values(this.instances)
    }

    getInstancesObject() {
        return this.instances
    }

    getInstancesSize() {
        return Object.keys(this.instances).length;
    }
}