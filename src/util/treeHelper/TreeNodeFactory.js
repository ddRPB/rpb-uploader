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

import TreeNode from "../../model/TreeNode";

export default class TreeNodeFactory {

    createTreeNode(dicomSeries) {
        const treeNode = new TreeNode();
        this.parseStudyParameter(dicomSeries, treeNode);
        this.parseSeriesParameter(dicomSeries, treeNode);
        this.parsePatientDetails(dicomSeries, treeNode);
        this.parseDeIdentificationDetails(dicomSeries, treeNode);
        this.addDicomInstancesInformation(dicomSeries, treeNode);
        this.parseByModality(dicomSeries, treeNode)

        return treeNode;
    }

    parseStudyParameter(dicomSeries, treeNode) {
        treeNode.data.studyInstanceUID = dicomSeries.getStudyInstanceUID();
    }

    parseSeriesParameter(dicomSeries, treeNode) {
        // key property for React
        treeNode.key = dicomSeries.getSeriesInstanceUID();
        treeNode.data.modality = dicomSeries.modality;
        treeNode.data.seriesInstanceUID = dicomSeries.getSeriesInstanceUID();
        treeNode.data.seriesDate = dicomSeries.getSeriesDate();
        treeNode.data.seriesDescription = dicomSeries.getSeriesDescription();
        treeNode.data.SOPInstanceUID = dicomSeries.parameters.get("SOPInstanceUID");
    }

    parseDicomInstancesParameters(dicomSeries, treeNode) {
        // todo replace
        treeNode.data.instancesSize = dicomSeries.getInstancesSize();
    }

    parsePatientDetails(dicomSeries, treeNode) {
        const patientBirthdate = dicomSeries.patientBirthDate;
        const patientID = dicomSeries.patientID;
        const patientName = dicomSeries.patientName;
        const patientSex = dicomSeries.patientSex;

        treeNode.data.patientDetails = [];
        treeNode.data.patientDetails.push(this.getDetailsItem("ID", patientID));
        treeNode.data.patientDetails.push(this.getDetailsItem("Name", patientName));
        treeNode.data.patientDetails.push(this.getDetailsItem("Sex", patientSex));
        treeNode.data.patientDetails.push(this.getDetailsItem("Birth Date", patientBirthdate));

    }

    parseDeIdentificationDetails(dicomSeries, treeNode) {
        treeNode.data.deIdentificationStatus = [];
        treeNode.data.deIdentificationStatus.push(this.getDetailsItem("BurnedInAnnotation", dicomSeries.burnedInAnnotation));
        treeNode.data.deIdentificationStatus.push(this.getDetailsItem("IdentityRemoved", dicomSeries.identityRemoved));

    }

    addDicomInstancesInformation(dicomSeries, treeNode) {
        treeNode.sopInstancesUIDs = dicomSeries.getSopInstancesUIDs();
        treeNode.data.instancesSize = treeNode.sopInstancesUIDs.length;
        treeNode.referencesDetails = dicomSeries.getInstancesReferencesDetails();
    }

    getDetailsItem(name, value) {
        return {
            "name": name,
            "value": value
        }

    }

    parseByModality(dicomSeries, treeNode) {
        switch (dicomSeries.modality) {
            case "RTSTRUCT":
                this.parseRTStruct(dicomSeries, treeNode);
                break;
            case "RTPLAN":
                this.parseRTPlan(dicomSeries, treeNode);
                break;
            case "RTDOSE":
                this.parseRTDose(dicomSeries, treeNode);
                break;
            case "RTIMAGE":
                this.parseRTImage(dicomSeries, treeNode);
                break;
            case "CT":
                this.parseCT(dicomSeries, treeNode);
                break;
            default:
            // nothing to do
        }

    }

    parseRTStruct(dicomSeries, treeNode) {

        treeNode.data.StructureSetLabel = dicomSeries.parameters.get("StructureSetLabel");
        treeNode.data.StudyDescription = dicomSeries.parameters.get("StudyDescription");
        treeNode.data.StructureSetName = dicomSeries.parameters.get("StructureSetName");
        treeNode.data.StructureSetDescription = dicomSeries.parameters.get("StructureSetDescription");
        treeNode.data.ApprovalStatus = dicomSeries.parameters.get("ApprovalStatus");

        if (treeNode.data.seriesDescription === "") {
            if (dicomSeries.parameters.get("StructureSetDescription") !== undefined && dicomSeries.parameters.get("StructureSetDescription") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("StructureSetDescription");
            } else if (dicomSeries.parameters.get("StructureSetLabel") !== undefined && dicomSeries.parameters.get("StructureSetLabel") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("StructureSetLabel");
            } else if (dicomSeries.parameters.get("StructureSetName") !== undefined && dicomSeries.parameters.get("StructureSetName") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("StructureSetName");
            }
        }

        treeNode.data.StructureSetDate = dicomSeries.parameters.get("StructureSetDate");

        if (dicomSeries.parameters.get("StructureSetDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("StructureSetDate");
        }

        treeNode.data.StructureSetROISequence = dicomSeries.parameters.get("StructureSetROISequence");

        treeNode.data.ROINumber = dicomSeries.parameters.get("ROINumber");
        treeNode.data.ReferencedFrameOfReferenceUID = dicomSeries.parameters.get("ReferencedFrameOfReferenceUID");
        treeNode.data.ROIName = dicomSeries.parameters.get("ROIName");
        treeNode.data.ROIDescription = dicomSeries.parameters.get("ROIDescription");
        treeNode.data.ROIVolume = dicomSeries.parameters.get("ROIVolume");
        treeNode.data.ROIGenerationAlgorithm = dicomSeries.parameters.get("ROIGenerationAlgorithm");
        treeNode.ReferencedFrameOfReferenceSequence = dicomSeries.parameters.get("ReferencedFrameOfReferenceSequence");
        treeNode.data.ROIGenerationAlgorithm = dicomSeries.parameters.get("ROIGenerationAlgorithm");

        treeNode.data.rOIOberservationSequenceArray = dicomSeries.parameters.get("RTROIObservationsSequence");

        treeNode.data.detailsArray = [];
        // if (this.data.seriesDescription) this.data.detailsArray.push(this.getDetailsItem("SeriesDescription", this.data.seriesDescription));
        if (treeNode.data.StructureSetLabel) treeNode.data.detailsArray.push(this.getDetailsItem("StructureSetLabel", treeNode.data.StructureSetLabel));
        if (treeNode.data.StructureSetName) treeNode.data.detailsArray.push(this.getDetailsItem("StructureSetName", treeNode.data.StructureSetName));
        if (treeNode.data.StructureSetDescription) treeNode.data.detailsArray.push(this.getDetailsItem("StructureSetDescription", treeNode.data.StructureSetDescription));
        if (treeNode.data.StructureSetDate) treeNode.data.detailsArray.push(this.getDetailsItem("StructureSetDate", treeNode.data.StructureSetDate));
        if (treeNode.data.ROINumber) treeNode.data.detailsArray.push(this.getDetailsItem("ROINumber", treeNode.data.ROINumber));
        if (treeNode.data.ApprovalStatus) treeNode.data.detailsArray.push(this.getDetailsItem("ApprovalStatus", treeNode.data.ApprovalStatus));

    }

    parseRTPlan(dicomSeries, treeNode) {
        treeNode.data.FrameOfReferenceUID = dicomSeries.parameters.get("FrameOfReferenceUID");
        treeNode.data.StudyDescription = dicomSeries.parameters.get("StudyDescription");
        treeNode.data.RTPlanLabel = dicomSeries.parameters.get("RTPlanLabel");
        treeNode.data.RTPlanName = dicomSeries.parameters.get("RTPlanName");
        treeNode.data.RTPlanDescription = dicomSeries.parameters.get("RTPlanDescription");
        treeNode.data.ApprovalStatus = dicomSeries.parameters.get("ApprovalStatus");

        if (treeNode.data.seriesDescription === "") {

            if (dicomSeries.parameters.get("RTPlanDescription") !== undefined && dicomSeries.parameters.get("RTPlanDescription") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("RTPlanDescription");
            } else if (dicomSeries.parameters.get("RTPlanLabel") !== undefined && dicomSeries.parameters.get("RTPlanLabel") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("RTPlanLabel");
            } else if (dicomSeries.parameters.get("RTPlanName") !== undefined && dicomSeries.parameters.get("RTPlanName") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("RTPlanName");
            }
        }

        treeNode.data.PrescriptionDescription = dicomSeries.parameters.get("PrescriptionDescription");
        treeNode.data.RTPlanDate = dicomSeries.parameters.get("RTPlanDate");

        if (dicomSeries.parameters.get("RTPlanDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("RTPlanDate");
        }

        treeNode.data.RTPlanGeometry = dicomSeries.parameters.get("RTPlanGeometry");
        treeNode.ReferencedStructureSetSequence = dicomSeries.parameters.get("ReferencedStructureSetSequence");
        treeNode.ManufacturerModelName = dicomSeries.parameters.get("ManufacturerModelName");
        treeNode.Manufacturer = dicomSeries.parameters.get("Manufacturer");
        treeNode.RTPlanGeometry = dicomSeries.parameters.get("RTPlanGeometry");


        treeNode.data.detailsArray = [];
        // if (plan.data.seriesDescription) this.data.detailsArray.push(this.getDetailsItem("SeriesDescription", this.data.RTPlanDescription));
        if (treeNode.data.RTPlanLabel) treeNode.data.detailsArray.push(this.getDetailsItem("RTPlanLabel", treeNode.data.RTPlanLabel));
        if (treeNode.data.ManufacturerModelName) treeNode.data.detailsArray.push(this.getDetailsItem("ManufacturerModelName", treeNode.data.ManufacturerModelName));
        if (treeNode.data.Manufacturer) treeNode.data.detailsArray.push(this.getDetailsItem("Manufacturer", treeNode.data.Manufacturer));
        if (treeNode.data.RTPlanName) treeNode.data.detailsArray.push(this.getDetailsItem("RTPlanName", treeNode.data.RTPlanName));
        if (treeNode.data.RTPlanDate) treeNode.data.detailsArray.push(this.getDetailsItem("RTPlanDate", treeNode.data.RTPlanDate));
        if (treeNode.data.RTPlanDescription) treeNode.data.detailsArray.push(this.getDetailsItem("RTPlanDescription", treeNode.data.RTPlanDescription));
        if (treeNode.data.RTPlanGeometry) treeNode.data.detailsArray.push(this.getDetailsItem("RTPlanGeometry", treeNode.data.RTPlanGeometry));
        if (treeNode.data.PrescriptionDescription) treeNode.data.detailsArray.push(this.getDetailsItem("PrescriptionDescription", treeNode.data.PrescriptionDescription));
        if (treeNode.data.ReferencedStructureSetSequence) treeNode.data.detailsArray.push(this.getDetailsItem("ReferencedStructureSetSequence", treeNode.data.ReferencedStructureSetSequence));
        if (treeNode.data.ApprovalStatus) treeNode.data.detailsArray.push(this.getDetailsItem("ApprovalStatus", treeNode.data.ApprovalStatus));

    }

    parseRTDose(dicomSeries, treeNode) {
        treeNode.data.FrameOfReferenceUID = dicomSeries.parameters.get("FrameOfReferenceUID");
        treeNode.data.StudyDescription = dicomSeries.parameters.get("StudyDescription");
        treeNode.data.DoseUnits = dicomSeries.parameters.get("DoseUnits");
        treeNode.data.DoseType = dicomSeries.parameters.get("DoseType");
        treeNode.data.DoseComment = dicomSeries.parameters.get("DoseComment");

        if (treeNode.data.seriesDescription === "") {
            if (dicomSeries.parameters.get("DoseComment") !== undefined && dicomSeries.parameters.get("DoseComment") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("DoseComment");
            }
        }

        treeNode.data.DoseSummationType = dicomSeries.parameters.get("DoseSummationType");
        treeNode.data.InstanceCreationDate = dicomSeries.parameters.get("InstanceCreationDate");

        if (dicomSeries.parameters.get("InstanceCreationDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("InstanceCreationDate");
        }

        treeNode.ReferencedRTPlanSequence = dicomSeries.parameters.get("ReferencedRTPlanSequence");

        treeNode.data.detailsArray = [];
        if (treeNode.data.DoseComment) treeNode.data.detailsArray.push(this.getDetailsItem("DoseComment", treeNode.data.DoseComment));
        if (treeNode.data.DoseSummationType) treeNode.data.detailsArray.push(this.getDetailsItem("DoseSummationType", treeNode.data.DoseSummationType));
        if (treeNode.data.DoseUnits) treeNode.data.detailsArray.push(this.getDetailsItem("DoseUnits", treeNode.data.DoseUnits));
        if (treeNode.data.DoseType) treeNode.data.detailsArray.push(this.getDetailsItem("DoseType", treeNode.data.DoseType));
        if (treeNode.data.InstanceCreationDate) treeNode.data.detailsArray.push(this.getDetailsItem("InstanceCreationDate", treeNode.data.InstanceCreationDate));
        if (treeNode.data.ApprovalStatus) treeNode.data.detailsArray.push(this.getDetailsItem("ApprovalStatus", treeNode.data.ApprovalStatus));

    }

    parseRTImage(dicomSeries, treeNode) {
        treeNode.data.FrameOfReferenceUID = dicomSeries.parameters.get("FrameOfReferenceUID");
        treeNode.data.StudyDescription = dicomSeries.parameters.get("StudyDescription");
        treeNode.data.RTImageLabel = dicomSeries.parameters.get("RTImageLabel");
        treeNode.data.RTImageName = dicomSeries.parameters.get("RTImageName");
        treeNode.data.RTImageDescription = dicomSeries.parameters.get("RTImageDescription");
        treeNode.data.ApprovalStatus = dicomSeries.parameters.get("ApprovalStatus");

        if (treeNode.data.seriesDescription === "") {
            if (dicomSeries.parameters.get("RTImageName") !== undefined && dicomSeries.parameters.get("RTImageName") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("RTImageName");
            } else if (dicomSeries.parameters.get("RTImageLabel") !== undefined && dicomSeries.parameters.get("RTImageLabel") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("RTImageLabel");
            } else if (dicomSeries.parameters.get("RTImageDescription") !== undefined && dicomSeries.parameters.get("RTImageDescription") !== "") {
                treeNode.data.seriesDescription = dicomSeries.parameters.get("RTImageDescription");
            }
        }

        treeNode.data.InstanceCreationDate = dicomSeries.parameters.get("InstanceCreationDate");

        if (dicomSeries.parameters.get("InstanceCreationDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("InstanceCreationDate");
        }

        treeNode.ReferencedRTPlanSequence = dicomSeries.parameters.get("ReferencedRTPlanSequence");

        treeNode.data.detailsArray = [];
        if (treeNode.data.RTImageName) treeNode.data.detailsArray.push(this.getDetailsItem("RTImageName", treeNode.data.RTImageName));
        if (treeNode.data.RTImageLabel) treeNode.data.detailsArray.push(this.getDetailsItem("RTImageLabel", treeNode.data.RTImageLabel));
        if (treeNode.data.RTImageDescription) treeNode.data.detailsArray.push(this.getDetailsItem("RTImageDescription", treeNode.data.RTImageDescription));
        if (treeNode.data.InstanceCreationDate) treeNode.data.detailsArray.push(this.getDetailsItem("InstanceCreationDate", treeNode.data.InstanceCreationDate));
        if (treeNode.data.ApprovalStatus) treeNode.data.detailsArray.push(this.getDetailsItem("ApprovalStatus", treeNode.data.ApprovalStatus));
    }

    parseCT(dicomSeries, treeNode) {
        treeNode.data.FrameOfReferenceUID = dicomSeries.parameters.get("FrameOfReferenceUID");
        treeNode.data.MediaStorageSOPInstanceUID = dicomSeries.parameters.get("MediaStorageSOPInstanceUID");
        treeNode.data.BodyPartExamined = dicomSeries.parameters.get("BodyPartExamined");
        treeNode.data.StudyDescription = dicomSeries.parameters.get("StudyDescription");
        treeNode.data.ImageType = dicomSeries.parameters.get("ImageType");

        treeNode.data.detailsArray = [];
        if (treeNode.data.ImageType) treeNode.data.detailsArray.push(this.getDetailsItem("ImageType", treeNode.data.ImageType));
        if (treeNode.data.BodyPartExamined) treeNode.data.detailsArray.push(this.getDetailsItem("BodyPartExamined", treeNode.data.BodyPartExamined));

    }

}