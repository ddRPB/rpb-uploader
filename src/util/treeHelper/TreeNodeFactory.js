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

import TreeNode from "../../model/TreeNode";

export default class TreeNodeFactory {

    createTreeNode(dicomSeries) {
        const treeNode = new TreeNode();
        this.parseStudyParameter(dicomSeries, treeNode);
        this.parseSeriesParameter(dicomSeries, treeNode);
        this.addDicomInstancesInformation(dicomSeries, treeNode);
        this.parseByModality(dicomSeries, treeNode)
        treeNode.calculateDetailsFromInstances();

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
        treeNode.seriesInstanceUID = dicomSeries.getSeriesInstanceUID();
        treeNode.data.seriesDate = dicomSeries.getSeriesDate();
        treeNode.data.SOPInstanceUID = dicomSeries.parameters.get("SOPInstanceUID");
    }

    addDicomInstancesInformation(dicomSeries, treeNode) {
        treeNode.sopInstancesUIDs = dicomSeries.getSopInstancesUIDs();
        treeNode.data.instancesSize = treeNode.sopInstancesUIDs.length;
        treeNode.referencesDetails = dicomSeries.getInstancesReferencesDetails();
        treeNode.parsable = dicomSeries.getIsParsableState();

        if (treeNode.parsable) {
            treeNode.notParsableFileNames = [];
        } else {
            treeNode.notParsableFileNames = dicomSeries.getNotParsableFileNames();
        }
        treeNode.instances = dicomSeries.instances;
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
                // nothing to do
                break;
            default:
            // nothing to do
        }

    }

    parseRTStruct(dicomSeries, treeNode) {

        treeNode.data.StructureSetDate = dicomSeries.parameters.get("StructureSetDate");

        if (dicomSeries.parameters.get("StructureSetDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("StructureSetDate");
        }

        treeNode.data.ReferencedFrameOfReferenceUID = dicomSeries.parameters.get("ReferencedFrameOfReferenceUID");
        treeNode.ReferencedFrameOfReferenceSequence = dicomSeries.parameters.get("ReferencedFrameOfReferenceSequence");

    }

    parseRTPlan(dicomSeries, treeNode) {

        treeNode.data.RTPlanDate = dicomSeries.parameters.get("RTPlanDate");

        if (dicomSeries.parameters.get("RTPlanDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("RTPlanDate");
        }

        treeNode.ReferencedStructureSetSequence = dicomSeries.parameters.get("ReferencedStructureSetSequence");
    }

    parseRTDose(dicomSeries, treeNode) {

        treeNode.data.InstanceCreationDate = dicomSeries.parameters.get("InstanceCreationDate");

        if (dicomSeries.parameters.get("InstanceCreationDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("InstanceCreationDate");
        }

        treeNode.ReferencedRTPlanSequence = dicomSeries.parameters.get("ReferencedRTPlanSequence");
    }

    parseRTImage(dicomSeries, treeNode) {

        treeNode.data.InstanceCreationDate = dicomSeries.parameters.get("InstanceCreationDate");

        if (dicomSeries.parameters.get("InstanceCreationDate") !== "" && treeNode.data.seriesDate === "") {
            treeNode.data.seriesDate = dicomSeries.parameters.get("InstanceCreationDate");
        }

        treeNode.ReferencedRTPlanSequence = dicomSeries.parameters.get("ReferencedRTPlanSequence");
    }

}