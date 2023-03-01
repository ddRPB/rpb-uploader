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

export default class InstanceDetailsHelper {

    parameters = {};

    addInstances(instancesObject) {
        for (let instanceUID of instancesObject.keys()) {
            const instanceParameters = instancesObject.get(instanceUID).parsedParameters;
            // this.parametersByInstanceUID.set(instanceUID, instanceParameters);

            for (let [parameterName, parameterValue] of instanceParameters) {
                if (parameterValue instanceof Map || parameterValue instanceof Array) {
                    // ignore
                } else {
                    this.addParameter(parameterName, parameterValue);
                }
            }

        }

    }

    addParameter(name, value) {
        if (this.parameters[name] == undefined) {
            this.parameters[name] = new Set();
        }
        this.parameters[name].add(value);
    }

    getParameter(name) {
        if (this.parameters[name] != undefined) {
            return Array.from(this.parameters[name]).join(' / ');
        } else {
            return '';
        }
    }

    getPatientdetails() {
        const patientDetails = [];
        patientDetails.push(this.getDetailsItem("ID", this.getParameter('patientID')));
        patientDetails.push(this.getDetailsItem("Name", this.getParameter('patientName')));
        patientDetails.push(this.getDetailsItem("Sex", this.getParameter('patientSex')));
        patientDetails.push(this.getDetailsItem("Birth Date", this.getParameter('patientBirthDate')));
        return patientDetails;
    }

    getDeIdentificationDetails() {
        const deIdentificationDetails = [];
        deIdentificationDetails.push(this.getDetailsItem("BurnedInAnnotation", this.getParameter('BurnedInAnnotation')));
        deIdentificationDetails.push(this.getDetailsItem("IdentityRemoved", this.getParameter('IdentityRemoved')));
        return deIdentificationDetails;
    }

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

    parseRTStruct(detailsArray) {
        this.addParameterIfAvailable(detailsArray, 'StructureSetLabel');
        this.addParameterIfAvailable(detailsArray, 'StructureSetName');
        this.addParameterIfAvailable(detailsArray, 'StructureSetDescription');
        this.addParameterIfAvailable(detailsArray, 'StructureSetDate');
        this.addParameterIfAvailable(detailsArray, 'ROINumber');
        this.addParameterIfAvailable(detailsArray, 'ApprovalStatus');
    }

    parseRTPlan(detailsArray) {
        this.addParameterIfAvailable(detailsArray, 'RTPlanLabel');
        this.addParameterIfAvailable(detailsArray, 'ManufacturerModelName');
        this.addParameterIfAvailable(detailsArray, 'Manufacturer');
        this.addParameterIfAvailable(detailsArray, 'RTPlanName');
        this.addParameterIfAvailable(detailsArray, 'RTPlanDate');
        this.addParameterIfAvailable(detailsArray, 'RTPlanDescription');
        this.addParameterIfAvailable(detailsArray, 'RTPlanGeometry');
        this.addParameterIfAvailable(detailsArray, 'PrescriptionDescription');
        this.addParameterIfAvailable(detailsArray, 'ReferencedStructureSetSequence');
        this.addParameterIfAvailable(detailsArray, 'ApprovalStatus');
    }

    parseRTDose(detailsArray) {
        this.addParameterIfAvailable(detailsArray, 'DoseComment');
        this.addParameterIfAvailable(detailsArray, 'DoseSummationType');
        this.addParameterIfAvailable(detailsArray, 'DoseUnits');
        this.addParameterIfAvailable(detailsArray, 'DoseType');
        this.addParameterIfAvailable(detailsArray, 'InstanceCreationDate');
        this.addParameterIfAvailable(detailsArray, 'ApprovalStatus');
    }

    parseRTImage(detailsArray) {
        this.addParameterIfAvailable(detailsArray, 'RTImageName');
        this.addParameterIfAvailable(detailsArray, 'RTImageLabel');
        this.addParameterIfAvailable(detailsArray, 'RTImageDescription');
        this.addParameterIfAvailable(detailsArray, 'InstanceCreationDate');
        this.addParameterIfAvailable(detailsArray, 'ApprovalStatus');
    }

    parseCT(detailsArray) {
        this.addParameterIfAvailable(detailsArray, 'ImageType');
        this.addParameterIfAvailable(detailsArray, 'BodyPartExamined');
    }

    addParameterIfAvailable(detailsArray, parameterName) {
        if (this.getParameter(parameterName).length > 0) {
            detailsArray.push(this.getDetailsItem(parameterName, this.getParameter(parameterName)));
        }
    }

    calculateSeriesDescription() {
        let seriesDescription = this.getParameter('SeriesDescription');

        if (seriesDescription.length === 0 || seriesDescription === '(S0)-') {
            for (let modality of this.parameters.Modality.values())
                switch (modality) {
                    case "RTSTRUCT":
                        seriesDescription = this.getParameter('StructureSetDescription');
                        if (seriesDescription.length === 0) {
                            seriesDescription = this.getParameter('StructureSetLabel');
                        }
                        if (seriesDescription.length === 0) {
                            seriesDescription = this.getParameter('StructureSetName');
                        }
                        break;
                    case "RTPLAN":
                        seriesDescription = this.getParameter('RTPlanDescription');
                        if (seriesDescription.length === 0) {
                            seriesDescription = this.getParameter('RTPlanLabel');
                        }
                        if (seriesDescription.length === 0) {
                            seriesDescription = this.getParameter('RTPlanName');
                        }
                        break;
                    case "RTDOSE":
                        seriesDescription = this.getParameter('DoseComment');
                        break;
                    case "RTIMAGE":
                        seriesDescription = this.getParameter('RTImageName');
                        if (seriesDescription.length === 0) {
                            seriesDescription = this.getParameter('RTImageLabel');
                        }
                        if (seriesDescription.length === 0) {
                            seriesDescription = this.getParameter('RTImageDescription');
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

    getDetailsItem(name, value) {
        return {
            "name": name,
            "value": value
        }

    }


}