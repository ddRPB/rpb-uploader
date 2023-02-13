
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

import TreeNodeFactory from "./treeHelper/TreeNodeFactory";

export default class TreeBuilder {
    allRootChildrenNodes = {
        rTStructs: {},
        rTStructArray: [],
        rtPlans: {},
        rtPlanArray: [],
        rTDoses: {},
        rTDoseArray: [],
        rTImages: {},
        rTImageArray: [],
        cTs: {},
        otherSeries: {},
        root: [],
    };


    rtViewNodes = {
        rTStructs: {},
        rTStructArray: [],
        rtPlans: {},
        rtPlanArray: [],
        rTDoses: {},
        rTDoseArray: [],
        rTImages: {},
        rTImageArray: [],
        cTs: {},
        otherSeries: {},
        root: [],
    };

    rtViewVirtualSeriesNodes = {
        rTStructs: {},
        rTStructArray: [],
        rtPlans: {},
        rtPlansArray: [],
        rTDoses: {},
        rTDoseArray: [],
        rTImages: {},
        rTImageArray: [],
        cTs: {},
        otherSeries: {},
        virtualSeriesNodes: new Map(),

    };

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
        this.buildSeriesNodesMaps(this.allRootChildrenNodes);

        let result = {}
        result.root = [];

        for (let otherSeriesId in this.allRootChildrenNodes.otherSeries) {
            const otherSeries = this.allRootChildrenNodes.otherSeries[otherSeriesId];
            result.root.push(otherSeries);
        }

        for (let ctId in this.allRootChildrenNodes.cTs) {
            const ctSeries = this.allRootChildrenNodes.cTs[ctId];
            result.root.push(ctSeries);
        }

        for (let rTStruct of this.allRootChildrenNodes.rTStructArray) {
            result.root.push(rTStruct);
        }

        for (let rTPlan of this.allRootChildrenNodes.rtPlanArray) {
            result.root.push(rTPlan);
        }


        for (let rTImage of this.allRootChildrenNodes.rTImageArray) {
            result.root.push(rTImage);
        }

        for (let rTDose of this.allRootChildrenNodes.rTDoseArray) {
            result.root.push(rTDose);
        }

        return result;

    }

    buildRTNodesTree(base = this.rtViewNodes) {
        this.buildSeriesNodesMaps(base);

        let result = {
            root: []
        };

        for (let ctId in base.cTs) {
            const ctSeries = base.cTs[ctId];
            result.root.push(ctSeries);
        }

        for (let rTImage of base.rTImageArray) {
            const refSequence = rTImage["ReferencedRTPlanSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((base.rtPlans[refSOPUID]) !== undefined) {
                    if (base.rtPlans[refSOPUID].children !== undefined) {
                        base.rtPlans[refSOPUID].children.push(rTImage);
                        rTImage.addParentNode(base.rtPlans[refSOPUID]);
                    }
                } else {
                    result.root.push(rTImage);
                }
            }
        }

        for (let rTDose of base.rTDoseArray) {
            const refSequence = rTDose["ReferencedRTPlanSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((base.rtPlans[refSOPUID]) !== undefined) {
                    if (base.rtPlans[refSOPUID].children !== undefined) {
                        base.rtPlans[refSOPUID].children.push(rTDose);
                        rTDose.addParentNode(base.rtPlans[refSOPUID]);
                    }
                } else {
                    result.root.push(rTDose);
                }
            }

        }

        for (let rTPlan of base.rtPlanArray) {
            const refSequence = rTPlan["ReferencedStructureSetSequence"];
            for (let reference of refSequence) {
                const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                if ((base.rTStructs[refSOPUID]) !== undefined) {
                    if (base.rTStructs[refSOPUID].children !== undefined) {
                        base.rTStructs[refSOPUID].children.push(rTPlan);
                        rTPlan.addParentNode(base.rTStructs[refSOPUID]);
                    }
                } else {
                    result.root.push(rTPlan);
                }
            }
        }

        for (let rTStruct of base.rTStructArray) {
            const refSequence = rTStruct["ReferencedFrameOfReferenceSequence"];
            for (let frameOfReferenceItem of refSequence) {
                if (frameOfReferenceItem.get("RTReferencedStudySequence") !== undefined) {
                    for (let reference of frameOfReferenceItem.get("RTReferencedStudySequence")) {
                        const refSOPUID = reference.get("ReferencedSOPInstanceUID");
                        if ((base.cTs[refSOPUID]) !== undefined) {
                            if (base.cTs[refSOPUID].children !== undefined) {
                                base.cTs[refSOPUID].children.push(rTStruct);
                                rTStruct.addParentNode(base.cTs[refSOPUID]);
                            }
                        } else {
                            for (let contourImage of reference.get("ContourImageSequence")) {
                                if ((base.cTs[contourImage.get("SeriesInstanceUID")]) !== undefined) {
                                    if (base.cTs[contourImage.get("SeriesInstanceUID")].children !== undefined) {
                                        base.cTs[contourImage.get("SeriesInstanceUID")].children.push(rTStruct);
                                        rTStruct.addParentNode(base.cTs[contourImage.get("SeriesInstanceUID")]);
                                    }
                                }
                            }

                        }

                        if (rTStruct.parentNodes.length === 0) {
                            result.root.push(rTStruct);
                        }
                    }
                }
            }
        }

        return result;
    }

    removeNodeFromRoot(rootNodeArray, key) {
        const newRootNodeArray = [];

        for (let node of rootNodeArray) {
            if (node.key != key) {
                newRootNodeArray.push(node);
            }
        }

        return newRootNodeArray;

    }

    buildVirtualNodesTree() {
        const seriesBasedTree = this.buildRTNodesTree(this.rtViewVirtualSeriesNodes);
        const newVirtualNodesArray = [];

        const rTStructsAfterFirstSplit = [];
        const rtPlansAfterFirstSplit = [];

        for (let rTStruct of this.rtViewVirtualSeriesNodes.rTStructArray) {
            const resultNodes = rTStruct.splitIfNodeHasTwoParents();
            rTStructsAfterFirstSplit.push(...resultNodes);
            if (resultNodes.length > 1) {
                newVirtualNodesArray.push(...resultNodes);
            }
        }

        for (let rTPlan of this.rtViewVirtualSeriesNodes.rtPlanArray) {
            const resultNodes = rTPlan.splitIfNodeHasTwoParents();
            rtPlansAfterFirstSplit.push(...resultNodes);
            if (resultNodes.length > 1) {
                newVirtualNodesArray.push(...resultNodes);
            }
        }

        for (let rTDose of this.rtViewVirtualSeriesNodes.rTDoseArray) {
            const resultNodes = rTDose.splitIfNodeHasTwoParents();
            if (resultNodes.length > 1) {
                newVirtualNodesArray.push(...resultNodes);
            }
        }

        for (let rTImage of this.rtViewVirtualSeriesNodes.rTImageArray) {
            const resultNodes = rTImage.splitIfNodeHasTwoParents();
            if (resultNodes.length > 1) {
                newVirtualNodesArray.push(...resultNodes);
            }
        }


        for (let rTStruct of rTStructsAfterFirstSplit) {
            const newNodes = rTStruct.splitBySOPInstanceUIDIfImageIsReferenced(this.rtViewVirtualSeriesNodes.referencedSOPInstanceUIDs);

            const parent = rTStruct.getParent();
            if (newNodes.length > 1) {
                newVirtualNodesArray.push(...newNodes);
                if (parent != null) {
                    parent.removeChildrenNode(rTStruct);
                    parent.children.push(...newNodes);
                } else {
                    seriesBasedTree.root = this.removeNodeFromRoot(seriesBasedTree.root, rTStruct.key);
                    seriesBasedTree.root.push(...newNodes);
                }
            }
        }

        for (let rTPlan of rtPlansAfterFirstSplit) {
            const newNodes = rTPlan.splitBySOPInstanceUIDIfImageIsReferenced(this.rtViewVirtualSeriesNodes.referencedSOPInstanceUIDs);

            const parent = rTPlan.getParent();
            if (newNodes.length > 1) {
                newVirtualNodesArray.push(...newNodes);
                if (parent != null) {
                    parent.removeChildrenNode(rTPlan);
                    parent.children.push(...newNodes);
                } else {
                    seriesBasedTree.root = this.removeNodeFromRoot(seriesBasedTree.root, rTPlan.key);
                    seriesBasedTree.root.push(...newNodes);
                }
            }
        }

        const newVirtualNodesMap = new Map();
        newVirtualNodesArray.forEach((item) => {
            if (item.isVirtual === true) {
                newVirtualNodesMap.set(item.key, item);
            }
        });

        return {
            seriesBasedTree,
            newVirtualNodes: newVirtualNodesMap
        };
    }


    /**
     * DicomSeries will converted into Tree nodes and sorted into maps with respect to their modality.
     * This steps prepares creating a tree that visualizes the relationship between RT series.
     */
    buildSeriesNodesMaps(base = this.allRootChildrenNodes) {
        base.rTStructs = {};
        base.rTStructArray = [];
        base.rtPlans = {};
        base.rtPlanArray = [];
        base.rTDoses = {};
        base.rTDoseArray = [];
        base.rTImages = {};
        base.rTImageArray = [];
        base.cTs = {};
        base.otherSeries = {};
        base.referencedSOPInstanceUIDs = new Set();


        for (let studyObject of this.dicomStudyArray) {
            let series = studyObject.getSeriesArray();
            for (let seriesObject of series) {
                const modality = seriesObject.modality;
                const treeNode = this.getTreeNode(seriesObject);
                // base.referencedSOPInstanceUIDs = new Set([...base.referencedSOPInstanceUIDs, ...seriesObject.getReferencedInstancesUIDs()]);

                switch (modality) {
                    case "RTSTRUCT":
                        base.rTStructArray.push(treeNode);
                        for (let SOPInstanceUID of seriesObject.getSopInstancesUIDs()) {
                            base.rTStructs[SOPInstanceUID] = treeNode;
                        }
                        // base.referencedSOPInstanceUIDs = new Set([...base.referencedSOPInstanceUIDs, ...seriesObject.getReferencedInstancesUIDs()]);
                        break;
                    case "RTPLAN":
                        base.rtPlanArray.push(treeNode);
                        for (let SOPInstanceUID of seriesObject.getSopInstancesUIDs()) {
                            base.rtPlans[SOPInstanceUID] = treeNode;
                        }
                        base.referencedSOPInstanceUIDs = new Set([...base.referencedSOPInstanceUIDs, ...seriesObject.getReferencedInstancesUIDs()]);
                        break;
                    case "RTDOSE":
                        base.rTDoseArray.push(treeNode);
                        for (let SOPInstanceUID of seriesObject.getSopInstancesUIDs()) {
                            base.rTDoses[SOPInstanceUID] = treeNode;
                        }
                        base.referencedSOPInstanceUIDs = new Set([...base.referencedSOPInstanceUIDs, ...seriesObject.getReferencedInstancesUIDs()]);
                        break;
                    case "RTIMAGE":
                        base.rTImageArray.push(treeNode);
                        for (let SOPInstanceUID of seriesObject.getSopInstancesUIDs()) {
                            base.rTImages[SOPInstanceUID] = treeNode;
                        }
                        base.referencedSOPInstanceUIDs = new Set([...base.referencedSOPInstanceUIDs, ...seriesObject.getReferencedInstancesUIDs()]);
                        break;
                    case "CT":
                        base.cTs[seriesObject.parameters.get("SeriesInstanceUID")] = this.getTreeNode(seriesObject);
                        break;
                    default:
                        base.otherSeries[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                }

            }

        }
    }
}
