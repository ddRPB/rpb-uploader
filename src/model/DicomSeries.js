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
  instances = new Map();
  deIdentifiedStudyInstanceUID = null;
  deIdentifiedSeriesInstanceUID = null;
  uploadVerified = false;

  constructor(seriesDetails, parsedParameters, availableDicomTags) {
    this.seriesInstanceUID = seriesDetails.seriesInstanceUID;
    this.seriesDate = seriesDetails.seriesDate;
    this.seriesDescription = seriesDetails.seriesDescription;
    this.modality = seriesDetails.modality;
    this.studyInstanceUID = seriesDetails.studyInstanceUID;

    this.parameters = parsedParameters;

    this.patientID = new Set([parsedParameters.get("patientID")]);
    this.patientBirthDate = new Set([parsedParameters.get("patientBirthDate")]);
    this.patientSex = new Set([parsedParameters.get("patientSex")]);
    this.patientName = new Set([parsedParameters.get("patientName")]);

    this.burnedInAnnotation = new Set([parsedParameters.get("BurnedInAnnotation")]);
    this.identityRemoved = new Set([parsedParameters.get("IdentityRemoved")]);

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
      throw new Error("Null SeriesInstanceUID");
    }
    return this.seriesInstanceUID;
  }

  getSeriesDate() {
    return this.seriesDate == null ? "" : this.seriesDate;
  }

  getSeriesDescription() {
    return this.seriesDescription == null ? "" : this.seriesDescription;
  }

  getModality() {
    return this.modality == null ? "" : this.modality;
  }

  getStudyInstanceUID() {
    if (this.studyInstanceUID == null) {
      throw new Error("Null StudyInstanceUID");
    }
    return this.studyInstanceUID;
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
      this.instances.set(dicomInstance.sopInstanceUID, dicomInstance);
    } else {
      throw Error("Existing instance");
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
    this.calculatePropertiesFromInstances();
  }

  calculatePropertiesFromInstances() {
    for (let instanceUID of this.instances.keys()) {
      const instanceObject = this.instances.get(instanceUID);

      this.patientID = new Set([...this.patientID, ...[instanceObject.parsedParameters.get("patientID")]]);
      this.patientBirthDate = new Set([
        ...this.patientBirthDate,
        ...[instanceObject.parsedParameters.get("patientBirthDate")],
      ]);
      this.patientSex = new Set([...this.patientSex, ...[instanceObject.parsedParameters.get("patientSex")]]);
      this.patientName = new Set([...this.patientName, ...[instanceObject.parsedParameters.get("patientName")]]);
    }
  }

  instanceExists(sopInstanceUID) {
    return this.instances.has(sopInstanceUID);
  }

  getInstance(instanceUID) {
    return this.instances.get(instanceUID);
  }

  getInstancesByUIDArray(instanceUIDArray) {
    const result = [];
    instanceUIDArray.forEach((UID) => {
      result.push(this.getInstance(UID));
    });
    return result;
  }

  getInstances() {
    return Array.from(this.instances.values());
  }

  getInstancesObject() {
    return this.instances;
  }

  getInstancesSize() {
    return this.instances.size;
  }

  getSopInstancesUIDs() {
    return Array.from(this.instances.keys());
  }

  /**
   * Instances refer to other instances of DICOM Series.
   * This function returns an Array of all references of the instances that belong to this series.
   */
  getInstancesReferencesDetails() {
    const references = [];
    for (let instanceUID of this.instances.keys()) {
      const instanceObject = this.instances.get(instanceUID);
      for (let referencedUID of instanceObject.referencedSopInstanceUids.keys()) {
        references.push({
          sourceInstanceUID: instanceUID,
          destinationInstanceUID: referencedUID,
          sourceDicomSeriesInstanceUID: this.seriesInstanceUID,
        });
      }
    }
    return references;
  }

  /**
   * Returns a set of DicomInstanceUIDs that are referenced by this series.
   */
  getReferencedInstancesUIDs() {
    let referencedSeriesUIDs = new Set();
    for (let instanceUID of this.instances.keys()) {
      const instanceObject = this.instances.get(instanceUID);
      referencedSeriesUIDs = new Set([...referencedSeriesUIDs, ...instanceObject.referencedSopInstanceUids]);
    }
    return referencedSeriesUIDs;
  }

  /**
   * Returns a boolean that indicates if the DICOM tool (dcmjs) can parse the files of this series without errors.
   */
  getIsParsableState() {
    let parsable = true;
    for (let instanceUID of this.instances.keys()) {
      const instanceObject = this.instances.get(instanceUID);
      parsable = parsable && instanceObject.parsable;
    }
    return parsable;
  }

  /**
   * Returns an array with the file names if some files cannot be parsed properly by the DICOM tool (dcmjs).
   */
  getNotParsableFileNames() {
    const fileNames = [];
    for (let instanceUID of this.instances.keys()) {
      const instanceObject = this.instances.get(instanceUID);
      if (!instanceObject.parsable) {
        fileNames.push(instanceObject.fileObject.name);
      }
    }
    return fileNames;
  }
}
