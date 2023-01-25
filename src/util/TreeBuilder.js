
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

import TreeNode from "../model/TreeNode";
import TreeNodeFactory from "./treeHelper/TreeNodeFactory";

export default class TreeBuilder {
    rTStructs = {};
    rtPlans = {};
    rTDoses = {};
    rTImages = {};
    cTs = {};
    otherSeries = {};

    factory = new TreeNodeFactory();

    constructor(dicomStudyArray) {
        this.dicomStudyArray = dicomStudyArray;
    }

    getTreeNode(dicomSeries) {
        return this.factory.createTreeNode(dicomSeries);
    }

    /**
     * Creates a tree where all nodes are children of root -> 
     * mainly used for studies with non RT related series
     */

    buildAllNodesChildrenOfRoot() {
        this.buildSeriesNodesMaps();

        let result = {}
        result.root = [];

        for (let otherSeriesId in this.otherSeries) {
            const otherSeries = this.otherSeries[otherSeriesId];
            result.root.push(otherSeries);
        }

        for (let ctId in this.cTs) {
            const ctSeries = this.cTs[ctId];
            result.root.push(ctSeries);
        }

        for (let rtStructId in this.rTStructs) {
            const rTStruct = this.rTStructs[rtStructId];
            result.root.push(rTStruct);
        }

        for (let rtPlanId in this.rtPlans) {
            const rTPlan = this.rtPlans[rtPlanId];
            result.root.push(rTPlan);
        }


        for (let imageId in this.rTImages) {
            const rTImage = this.rTImages[imageId];
            result.root.push(rTImage);
        }

        for (let doseId in this.rTDoses) {
            const rTDose = this.rTDoses[doseId];
            result.root.push(rTDose);
        }

        return result;

    }

    buildRTNodesTree() {
        this.buildSeriesNodesMaps();

        this.result = {}
        this.result.root = [];

        for (let ctId in this.cTs) {
            const ctSeries = this.cTs[ctId];
            this.result.root.push(ctSeries);
        }

        for (let imageId in this.rTImages) {
            const rTImage = this.rTImages[imageId];
            const refSequence = rTImage["ReferencedRTPlanSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((this.rtPlans[refSOPUID]) !== undefined) {
                    if (this.rtPlans[refSOPUID].children !== undefined) {
                        this.rtPlans[refSOPUID].children.push(rTImage);
                        rTImage.addParentNode(this.rtPlans[refSOPUID]);
                    }
                };
            }
        }

        for (let doseId in this.rTDoses) {
            const rTDose = this.rTDoses[doseId];
            const refSequence = rTDose["ReferencedRTPlanSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((this.rtPlans[refSOPUID]) !== undefined) {
                    if (this.rtPlans[refSOPUID].children !== undefined) {
                        this.rtPlans[refSOPUID].children.push(rTDose);
                        rTDose.addParentNode(this.rtPlans[refSOPUID]);
                    }
                };
            }

        }

        for (let rtPlanId in this.rtPlans) {
            const rTPlan = this.rtPlans[rtPlanId];
            const refSequence = rTPlan["ReferencedStructureSetSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((this.rTStructs[refSOPUID]) !== undefined) {
                    if (this.rTStructs[refSOPUID].children !== undefined) {
                        this.rTStructs[refSOPUID].children.push(rTPlan);
                        rTPlan.addParentNode(this.rTStructs[refSOPUID]);
                    }
                };
            }
        }

        for (let rtStructId in this.rTStructs) {
            const rTStruct = this.rTStructs[rtStructId];
            const refSequence = rTStruct["ReferencedFrameOfReferenceSequence"];
            for (let frameOfReferenceItem of refSequence) {
                if (frameOfReferenceItem.get("RTReferencedStudySequence") !== undefined) {
                    for (let reference of frameOfReferenceItem.get("RTReferencedStudySequence")) {
                        const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                        if ((this.cTs[refSOPUID]) !== undefined) {
                            if (this.cTs[refSOPUID].children !== undefined) {
                                this.cTs[refSOPUID].children.push(rTStruct);
                                rTStruct.addParentNode(this.cTs[refSOPUID]);
                            }
                        } else {
                            for (let contourImage of reference.get("ContourImageSequence")) {
                                if ((this.cTs[contourImage.get("SeriesInstanceUID")]) !== undefined) {
                                    if (this.cTs[contourImage.get("SeriesInstanceUID")].children !== undefined) {
                                        this.cTs[contourImage.get("SeriesInstanceUID")].children.push(rTStruct);
                                        rTStruct.addParentNode(this.cTs[contourImage.get("SeriesInstanceUID")]);
                                    }
                                }
                            }

                        }
                    }
                }
            }
        }

        return this.result;
    }

    buildVirtualNodesTree() {
        const seriesBasedTree = this.buildRTNodesTree();

        for (let doseId in this.rTDoses) {
            const rTDose = this.rTDoses[doseId];
        }

        return seriesBasedTree;
    }


    /**
     * DicomSeries will converted into Tree nodes and sorted into maps with respect to their modality.
     * This steps prepares creating a tree that visualizes the relationship between RT series.
     */
    buildSeriesNodesMaps() {
        this.rTStructs = {};
        this.rtPlans = {};
        this.rTDoses = {};
        this.rTImages = {};
        this.cTs = {};
        this.otherSeries = {};
        this.isReferencedFromMap = new Map();


        for (let studyObject of this.dicomStudyArray) {
            let series = studyObject.getSeriesArray();
            for (let seriesObject of series) {
                const modality = seriesObject.modality;

                switch (modality) {
                    case "RTSTRUCT":
                        this.rTStructs[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                        break;
                    case "RTPLAN":
                        this.rtPlans[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                        break;
                    case "RTDOSE":
                        this.rTDoses[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                        break
                    case "RTIMAGE":
                        this.rTImages[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                        break;
                    case "CT":
                        this.cTs[seriesObject.parameters.get("SeriesInstanceUID")] = this.getTreeNode(seriesObject);
                        break;
                    default:
                        this.otherSeries[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                }

            }

        }
    }
}
