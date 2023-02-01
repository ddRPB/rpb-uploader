
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
        rtPlans: {},
        rTDoses: {},
        rTImages: {},
        cTs: {},
        otherSeries: {},
        root: [],
    };


    rtViewNodes = {
        rTStructs: {},
        rtPlans: {},
        rTDoses: {},
        rTImages: {},
        cTs: {},
        otherSeries: {},
        root: [],
    };

    rtViewVirtualSeriesNodes = {
        rTStructs: {},
        rtPlans: {},
        rTDoses: {},
        rTImages: {},
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

        for (let rtStructId in this.allRootChildrenNodes.rTStructs) {
            const rTStruct = this.allRootChildrenNodes.rTStructs[rtStructId];
            result.root.push(rTStruct);
        }

        for (let rtPlanId in this.allRootChildrenNodes.rtPlans) {
            const rTPlan = this.allRootChildrenNodes.rtPlans[rtPlanId];
            result.root.push(rTPlan);
        }


        for (let imageId in this.allRootChildrenNodes.rTImages) {
            const rTImage = this.allRootChildrenNodes.rTImages[imageId];
            result.root.push(rTImage);
        }

        for (let doseId in this.allRootChildrenNodes.rTDoses) {
            const rTDose = this.allRootChildrenNodes.rTDoses[doseId];
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

        for (let imageId in base.rTImages) {
            const rTImage = base.rTImages[imageId];
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

        for (let doseId in base.rTDoses) {
            const rTDose = base.rTDoses[doseId];
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

        for (let rtPlanId in base.rtPlans) {
            const rTPlan = base.rtPlans[rtPlanId];
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

        for (let rtStructId in base.rTStructs) {
            const rTStruct = base.rTStructs[rtStructId];
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
        const newVirtualNodes = [];

        const rTStructsAfterFirstSplit = [];
        const rtPlansAfterFirstSplit = [];

        for (let rtStructId in this.rtViewVirtualSeriesNodes.rTStructs) {
            const rTStruct = this.rtViewVirtualSeriesNodes.rTStructs[rtStructId];
            const resultNodes = rTStruct.splitIfNodeHasTwoParents();
            rTStructsAfterFirstSplit.push(...resultNodes);
            if (resultNodes.length > 1) {
                newVirtualNodes.push(...resultNodes);
            }
        }

        for (let rtPlanId in this.rtViewVirtualSeriesNodes.rtPlans) {
            const rTPlan = this.rtViewVirtualSeriesNodes.rtPlans[rtPlanId];
            const resultNodes = rTPlan.splitIfNodeHasTwoParents();
            rtPlansAfterFirstSplit.push(...resultNodes);
            if (resultNodes.length > 1) {
                newVirtualNodes.push(...resultNodes);
            }
        }

        for (let doseId in this.rtViewVirtualSeriesNodes.rTDoses) {
            const rTDose = this.rtViewVirtualSeriesNodes.rTDoses[doseId];
            const resultNodes = rTDose.splitIfNodeHasTwoParents();
            if (resultNodes.length > 1) {
                newVirtualNodes.push(...resultNodes);
            }
        }

        for (let imageId in this.rtViewVirtualSeriesNodes.rTImages) {
            const rTImage = this.rtViewVirtualSeriesNodes.rTImages[imageId];
            const resultNodes = rTImage.splitIfNodeHasTwoParents();
            if (resultNodes.length > 1) {
                newVirtualNodes.push(...resultNodes);
            }
        }


        for (let rTStruct of rTStructsAfterFirstSplit) {
            const parent = rTStruct.getParent();
            const newNodes = rTStruct.splitIfThereAreMoreThanOneChildrenThatAreNotLeafs();
            if (newNodes.length > 1) {
                newVirtualNodes.push(...newNodes);
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
            const parent = rTPlan.getParent();
            const newNodes = rTPlan.splitIfThereAreMoreThanOneChildrenThatAreNotLeafs();
            if (newNodes.length > 1) {
                newVirtualNodes.push(...newNodes);
                if (parent != null) {
                    parent.removeChildrenNode(rTPlan);
                    parent.children.push(...newNodes);
                } else {
                    seriesBasedTree.root = this.removeNodeFromRoot(seriesBasedTree.root, rTPlan.key);
                    seriesBasedTree.root.push(...newNodes);
                }
            }
        }

        for (let ctId in this.rtViewVirtualSeriesNodes.cTs) {
            const ctSeries = this.rtViewVirtualSeriesNodes.cTs[ctId];
            const parent = ctSeries.getParent();
            const newNodes = ctSeries.splitIfThereAreMoreThanOneChildrenThatAreNotLeafs();
            newVirtualNodes.push(...newNodes);
            if (newNodes.length > 1) {
                seriesBasedTree.root = this.removeNodeFromRoot(seriesBasedTree.root, ctSeries.key);
                seriesBasedTree.root.push(...newNodes);
                // parent.removeChildrenNode(ctSeries);
                // parent.children.push(...newNodes);
            }
        }

        return {
            seriesBasedTree,
            newVirtualNodes
        };
    }


    /**
     * DicomSeries will converted into Tree nodes and sorted into maps with respect to their modality.
     * This steps prepares creating a tree that visualizes the relationship between RT series.
     */
    buildSeriesNodesMaps(base = this.allRootChildrenNodes) {
        base.rTStructs = {};
        base.rtPlans = {};
        base.rTDoses = {};
        base.rTImages = {};
        base.cTs = {};
        base.otherSeries = {};
        this.isReferencedFromMap = new Map();


        for (let studyObject of this.dicomStudyArray) {
            let series = studyObject.getSeriesArray();
            for (let seriesObject of series) {
                const modality = seriesObject.modality;

                switch (modality) {
                    case "RTSTRUCT":
                        base.rTStructs[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                        break;
                    case "RTPLAN":
                        base.rtPlans[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                        break;
                    case "RTDOSE":
                        base.rTDoses[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
                        break
                    case "RTIMAGE":
                        base.rTImages[seriesObject.parameters.get("SOPInstanceUID")] = this.getTreeNode(seriesObject);
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
