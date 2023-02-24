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
 * DicomSeries domain object
 */
export default class DicomSeries {

    instances = {};
    deIdentifiedStudyInstanceUID = null;
    deIdentifiedSeriesInstanceUID = null;
    uploadVerified = false;

    constructor(seriesDetails, patientData, parsedParameters, availableDicomTags) {

        this.seriesInstanceUID = seriesDetails.seriesInstanceUID;
        this.seriesDate = seriesDetails.seriesDate;
        this.seriesDescription = seriesDetails.seriesDescription;
        this.modality = seriesDetails.modality;
        this.studyInstanceUID = seriesDetails.studyInstanceUID;

        this.parameters = parsedParameters;

        this.patientID = new Set([patientData.patientID]);
        this.patientBirthDate = new Set([patientData.patientBirthDate]);
        this.patientSex = new Set([patientData.patientSex]);
        this.patientName = new Set([patientData.patientName]);

        this.burnedInAnnotation = new Set([parsedParameters.get('BurnedInAnnotation')]);
        this.identityRemoved = new Set([parsedParameters.get('IdentityRemoved')]);

        this.availableDicomTags = availableDicomTags;

    }

    /**
     * Merges the existing DICOM series with a new that has been generated from another file of the same series.
     * The parameters will be added to a set to detect inconsistent values.
     */
    addSeries(seriesObject) {
        this.patientID = new Set([...this.patientID, ...seriesObject.patientID]);
        this.patientBirthDate = new Set([...this.patientBirthDate, ...seriesObject.patientBirthDate]);
        this.patientSex = new Set([...this.patientSex, ...seriesObject.patientSex]);
        this.patientName = new Set([...this.patientName, ...seriesObject.patientName]);

        this.burnedInAnnotation = new Set([...this.burnedInAnnotation, ...seriesObject.burnedInAnnotation]);
        this.identityRemoved = new Set([...this.identityRemoved, ...seriesObject.identityRemoved]);
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
        if (!this.instanceExists(dicomInstance.sopInstanceUID)) {
            this.instances[dicomInstance.sopInstanceUID] = dicomInstance
        } else {
            throw Error("Existing instance")
        }
    }

    addInstances(dicomInstancesArray) {
        dicomInstancesArray.forEach((item) => {
            try {
                this.addInstance(item);
            } catch (error) {
                // do nothing
            }
        });
    }

    instanceExists(sopInstanceUID) {
        let knownInstancesUID = Object.keys(this.instances);
        return knownInstancesUID.includes(sopInstanceUID);
    }

    getInstance(instanceUID) {
        return this.instances[instanceUID]
    }

    getInstancesByUIDArray(instanceUIDArray) {
        const result = [];
        instanceUIDArray.forEach((UID) => {
            result.push(this.getInstance(UID));
        })
        return result;
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

    getSopInstancesUIDs() {
        return Object.keys(this.instances);
    }

    /**
     * Instances refer to other instances of DICOM Series. 
     * This function returns an Array of all references of the instances that belong to this series.
     */
    getInstancesReferencesDetails() {
        const references = [];
        for (let instanceUID of Object.keys(this.instances)) {
            const instanceObject = this.instances[instanceUID];
            for (let referencedUID of instanceObject.referencedSopInstanceUids.keys()) {
                references.push({
                    sourceInstanceUID: instanceUID,
                    destinationInstanceUID: referencedUID,
                    sourceDicomSeriesInstanceUID: this.seriesInstanceUID
                })
            }
        }
        return references;
    }

    /**
     * Returns a set of DicomInstanceUIDs that are referenced by this series.
     */
    getReferencedInstancesUIDs() {
        let referencedSeriesUIDs = new Set();
        for (let instanceUID of Object.keys(this.instances)) {
            const instanceObject = this.instances[instanceUID];
            referencedSeriesUIDs = new Set([...referencedSeriesUIDs, ...instanceObject.referencedSopInstanceUids]);
        }
        return referencedSeriesUIDs;
    }

    /**
     * Returns a boolean that indicates if the DICOM tool (dcmjs) can parse the files of this series without errors.
     */
    getIsParsableState() {
        let parsable = true;
        for (let instanceUID of Object.keys(this.instances)) {
            const instanceObject = this.instances[instanceUID];
            parsable = parsable && instanceObject.parsable;
        }
        return parsable;
    }

    /**
     * Returns an array with the file names if some files cannot be parsed properly by the DICOM tool (dcmjs).
     */
    getNotParsableFileNames() {
        const fileNames = [];
        for (let instanceUID of Object.keys(this.instances)) {
            const instanceObject = this.instances[instanceUID];
            if (!instanceObject.parsable) {
                fileNames.push(instanceObject.fileObject.name);
            }
        }
        return fileNames;
    }
}