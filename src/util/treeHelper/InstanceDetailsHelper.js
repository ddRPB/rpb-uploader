/*
 * This file is part of RadPlanBio
 *
 * Copyright (C) 2013 - 2023 RPB Team
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
 * Extracts and summarizes detail properties of the instances that are part of the DicomSeries or virtual DicomSeries
 */
export default class InstanceDetailsHelper {
  // single parameters will be added to the parameters object
  parameters = {};
  // ROI Sequences
  structureSetROISequenceMap = new Map();
  rTROIObservationsSequence = new Map();

  /**
   * Add DicomInstances
   * @param  {Map} instancesObject  Map with DicomInstances
   */
  addInstances(instancesObject) {
    for (let instanceUID of instancesObject.keys()) {
      const instanceParameters = instancesObject.get(instanceUID).parsedParameters;

      for (let [parameterName, parameterValue] of instanceParameters) {
        if (parameterValue instanceof Map || parameterValue instanceof Array) {
          switch (parameterName) {
            case "StructureSetROISequence":
              parameterValue.forEach((value) => {
                this.structureSetROISequenceMap.set(value.get("ROINumber"), value);
              });
              break;
            case "RTROIObservationsSequence":
              parameterValue.forEach((value) => {
                this.rTROIObservationsSequence.set(value.get("ReferencedROINumber"), value);
              });
              break;

            default:
              break;
          }
        } else {
          // default - single parameters will be added to parameters object
          this.addParameter(parameterName, parameterValue);
        }
      }
    }
  }

  /**
   * Single parameters will be collected in Sets to avoid duplicates
   *
   * @param {String} name parameter name
   * @param {String} value parameter value
   *
   */
  addParameter(name, value) {
    if (this.parameters[name] == undefined) {
      this.parameters[name] = new Set();
    }
    this.parameters[name].add(value);
  }

  /**
   * Aggregates all values of a set to a single String with delimiter
   *
   * @param {String} name parameter name
   * @returns {String}
   */
  getParameter(name) {
    if (this.parameters[name] != undefined) {
      return Array.from(this.parameters[name]).join(" / ");
    } else {
      return "";
    }
  }

  /**
   * Aggregates all values of a set to an Array of Strings
   *
   * @param {String} name parameter name
   * @returns {Array<String>}
   */
  getParameterArray(name) {
    if (this.parameters[name] != undefined) {
      return Array.from(this.parameters[name]);
    } else {
      return "";
    }
  }

  /**
   * Creates an array with (with patient related) name, value JSON objects that can be used in the UI for generating lists with the parameters and their values.
   *
   *  * @returns {Array<String>}
   */
  getPatientDetails() {
    const patientDetails = [];
    patientDetails.push(this.getDetailsItem("ID", this.getParameter("patientID")));
    patientDetails.push(this.getDetailsItem("Name", this.getParameter("patientName")));
    patientDetails.push(this.getDetailsItem("Sex", this.getParameter("patientSex")));
    return patientDetails;
  }

  /**
   * Creates an array (of date parameters) with (with patient related) name, value JSON objects that can be used in the UI for generating lists with the parameters and their values.
   * The separation of the date parameters is necessary to parse the Strings to a language specific format.
   *
   *  * @returns {Array<String>}
   */
  getPatientDateDetails() {
    const patientDateDetails = [];
    patientDateDetails.push(this.getDetailsItem("Birth Date", this.getParameterArray("patientBirthDate")));
    return patientDateDetails;
  }

  /**
   * Creates an array with (de-identification related) name, value JSON objects that can be used in the UI for generating lists with the parameters and their values.
   *
   *  * @returns {Array<String>}
   */
  getDeIdentificationDetails() {
    const deIdentificationDetails = [];
    deIdentificationDetails.push(this.getDetailsItem("BurnedInAnnotation", this.getParameter("BurnedInAnnotation")));
    deIdentificationDetails.push(this.getDetailsItem("IdentityRemoved", this.getParameter("IdentityRemoved")));
    return deIdentificationDetails;
  }

  /**
   * Creates an array with (modality specific) name, value JSON objects that can be used in the UI for generating lists with the parameters and their values.
   *
   *  * @returns {Array<String>}
   */
  getDetailsArray() {
    const detailsArray = [];

    for (let modality of this.parameters.Modality.values())
      switch (modality) {
        case "RTSTRUCT":
          this.parseRTStruct(detailsArray);
          break;
        case "RTPLAN":
          this.parseRTPlan(detailsArray);
          break;
        case "RTDOSE":
          this.parseRTDose(detailsArray);
          break;
        case "RTIMAGE":
          this.parseRTImage(detailsArray);
          break;
        case "CT":
          this.parseCT(detailsArray);
          break;
        default:
        // nothing to do
      }

    return detailsArray;
  }

  /**
   * Creates an array (especialy for date parameters) with (modality specific) name, value JSON objects that can be used in the UI for generating lists with the parameters and their values.
   * The separation of the date parameters is necessary to parse the Strings to a language specific format.
   *
   *  * @returns {Array<String>}
   */
  getDateDetailsArray() {
    const detailsDateArray = [];

    for (let modality of this.parameters.Modality.values())
      switch (modality) {
        case "RTSTRUCT":
          this.parseRTStructDates(detailsDateArray);
          break;
        case "RTPLAN":
          this.parseRTPlanDates(detailsDateArray);
          break;
        case "RTDOSE":
          this.parseRTDoseDates(detailsDateArray);
          break;
        case "RTIMAGE":
          this.parseRTImageDates(detailsDateArray);
          break;
        default:
        // nothing to do
      }

    return detailsDateArray;
  }

  parseRTStruct(detailsArray) {
    this.addParameterIfAvailable(detailsArray, "StructureSetLabel");
    this.addParameterIfAvailable(detailsArray, "StructureSetName");
    this.addParameterIfAvailable(detailsArray, "StructureSetDescription");
    this.addParameterIfAvailable(detailsArray, "ROINumber");
    this.addParameterIfAvailable(detailsArray, "ApprovalStatus");
  }

  parseRTStructDates(detailsDateArray) {
    this.addParameterArrayIfAvailable(detailsDateArray, "StructureSetDate");
  }

  parseRTPlan(detailsArray) {
    this.addParameterIfAvailable(detailsArray, "RTPlanLabel");
    this.addParameterIfAvailable(detailsArray, "ManufacturerModelName");
    this.addParameterIfAvailable(detailsArray, "Manufacturer");
    this.addParameterIfAvailable(detailsArray, "RTPlanName");
    this.addParameterIfAvailable(detailsArray, "RTPlanDescription");
    this.addParameterIfAvailable(detailsArray, "RTPlanGeometry");
    this.addParameterIfAvailable(detailsArray, "PrescriptionDescription");
    this.addParameterIfAvailable(detailsArray, "ReferencedStructureSetSequence");
    this.addParameterIfAvailable(detailsArray, "ApprovalStatus");
  }

  parseRTPlanDates(detailsDateArray) {
    this.addParameterArrayIfAvailable(detailsDateArray, "RTPlanDate");
  }

  parseRTDose(detailsArray) {
    this.addParameterIfAvailable(detailsArray, "DoseComment");
    this.addParameterIfAvailable(detailsArray, "DoseSummationType");
    this.addParameterIfAvailable(detailsArray, "DoseUnits");
    this.addParameterIfAvailable(detailsArray, "DoseType");
    this.addParameterIfAvailable(detailsArray, "ApprovalStatus");
  }

  parseRTDoseDates(detailsDateArray) {
    this.addParameterArrayIfAvailable(detailsDateArray, "InstanceCreationDate");
  }

  parseRTImage(detailsArray) {
    this.addParameterIfAvailable(detailsArray, "RTImageName");
    this.addParameterIfAvailable(detailsArray, "RTImageLabel");
    this.addParameterIfAvailable(detailsArray, "RTImageDescription");
    this.addParameterIfAvailable(detailsArray, "ApprovalStatus");
  }

  parseRTImageDates(detailsDateArray) {
    this.addParameterArrayIfAvailable(detailsDateArray, "InstanceCreationDate");
  }

  parseCT(detailsArray) {
    this.addParameterIfAvailable(detailsArray, "ImageType");
    this.addParameterIfAvailable(detailsArray, "BodyPartExamined");
  }

  /**
   * Adds a parameter JSON object to an array if the parameter is available
   * @param {Array} detailsArray where the parameter should be added
   * @param {String} parameterName name of the parameter that will be searched for in this.parameters
   */
  addParameterIfAvailable(detailsArray, parameterName) {
    if (this.getParameter(parameterName).length > 0) {
      detailsArray.push(this.getDetailsItem(parameterName, this.getParameter(parameterName)));
    }
  }

  addParameterArrayIfAvailable(detailsArray, parameterName) {
    if (this.getParameterArray(parameterName).length > 0) {
      detailsArray.push(this.getDetailsItem(parameterName, this.getParameterArray(parameterName)));
    }
  }

  /**
   * Calculates an alternative series description if the original is empty or just a study prefix
   *
   * @returns {String}
   */
  calculateSeriesDescription() {
    let seriesDescription = this.getParameter("SeriesDescription");

    if (seriesDescription.length === 0) {
      for (let modality of this.parameters.Modality.values())
        switch (modality) {
          case "RTSTRUCT":
            seriesDescription = this.getParameter("StructureSetDescription");
            if (seriesDescription.length === 0) {
              seriesDescription = this.getParameter("StructureSetLabel");
            }
            if (seriesDescription.length === 0) {
              seriesDescription = this.getParameter("StructureSetName");
            }
            break;
          case "RTPLAN":
            seriesDescription = this.getParameter("RTPlanDescription");
            if (seriesDescription.length === 0) {
              seriesDescription = this.getParameter("RTPlanLabel");
            }
            if (seriesDescription.length === 0) {
              seriesDescription = this.getParameter("RTPlanName");
            }
            break;
          case "RTDOSE":
            seriesDescription = this.getParameter("DoseComment");
            break;
          case "RTIMAGE":
            seriesDescription = this.getParameter("RTImageName");
            if (seriesDescription.length === 0) {
              seriesDescription = this.getParameter("RTImageLabel");
            }
            if (seriesDescription.length === 0) {
              seriesDescription = this.getParameter("RTImageDescription");
            }
            break;
          case "CT":
            // nothing to do
            break;
          default:
          // nothing to do
        }
    }
    return seriesDescription;
  }

  /**
   * Merges the StructureSetROISequence and RTROIObservationsSequence items and
   * creates a sorted array with one item per ROINumber
   * @returns {Array}
   */
  getCalculatedROISequenceDetails() {
    const rOISequenceDetailsArray = [];

    for (let [key, value] of this.structureSetROISequenceMap) {
      const rTROIObservationsSequenceItem = this.rTROIObservationsSequence.get(key);
      rOISequenceDetailsArray.push(new Map([...rTROIObservationsSequenceItem, ...value]));
    }

    rOISequenceDetailsArray.sort((a, b) => {
      let result = 0;
      try {
        result = parseInt(a.get("ReferencedROINumber")) - parseInt(b.get("ReferencedROINumber"));
      } catch (error) {
        // do nothing
      }
      return result;
    });

    return rOISequenceDetailsArray;
  }

  /**
   * Creates JSON object with name, value properties that can be used in UI components
   *
   * @param {String} name
   * @param {String} value
   * @returns {JSON}
   */
  getDetailsItem(name, value) {
    return {
      name: name,
      value: value,
    };
  }
}
