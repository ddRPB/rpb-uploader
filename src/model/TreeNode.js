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
 * TreeNode - for the UI (https://www.primefaces.org/primereact/treetable/)
 * 
 */
export default class TreeNode {
    data = {};
    children = [];
    parentNodes = [];
    sopInstancesUIDs = [];
    referencesDetails = [];
    isVirtual = false;

    constructor() {
    }

    getParent() {
        if (this.parentNodes.length === 1) {
            return this.parentNodes[0];
        } else {
            return undefined;
        }
    }

    addParentNode(node) {
        this.parentNodes.push(node);
    }

    getParentCount() {
        return this.parentNodes.length;
    }

    getChildrenCount() {
        return this.children.length;
    }

    getChildren() {
        return this.children;
    }

    isLeaf() {
        return this.children.length === 0 ? true : false;
    }

    getReferenceDetailsByReferencedSOPInstanceUID(referencedSopInstanceUid) {
        for (let referenceDetail of this.referencesDetails) {
            if (referenceDetail.destinationInstanceUID === referencedSopInstanceUid) {
                return referenceDetail;
            }
        }

        return null;
    }

    getReferenceDetailsBySourceInstanceUID(SopInstanceUids) {
        const result = [];
        for (let referenceDetail of this.referencesDetails) {
            if (SopInstanceUids.includes(referenceDetail.sourceInstanceUID)) {
                result.push(referenceDetail);
            }
        }

        return result;
    }

    evaluateChildren() {
        if (this.isLeaf === true) {
            return;
        }

        const updatedChildrenList = [];

        for (let childNode of this.children) {
            for (let instanceUID of this.sopInstancesUIDs) {
                if (childNode.getReferenceDetails(instanceUID) != null) {
                    if (!updatedChildrenList.includes(childNode)) {
                        updatedChildrenList.push(childNode)
                    }
                }
            }
            childNode.evaluateChildren();
        }

        this.children = updatedChildrenList;

    }

    splitIfNodeHasTwoParents() {
        const nodeArray = [];
        if (this.parentNodes.length < 2) {
            nodeArray.push(this);
            return nodeArray;
        }

        for (let parentNode of this.parentNodes) {
            const parentNodeSopInstanceUIDs = parentNode.sopInstancesUIDs;

            let replacementNode = Object.create(Object.getPrototypeOf(new TreeNode()));
            let replacementNodeTwo = Object.assign(replacementNode, this)

            nodeArray.push(replacementNodeTwo);
            replacementNodeTwo.isVirtual = true;
            replacementNodeTwo.seriesInstanceUID = JSON.parse(JSON.stringify(this.seriesInstanceUID)) + '_' + nodeArray.length;
            replacementNodeTwo.key = JSON.parse(JSON.stringify(this.seriesInstanceUID)) + '_' + nodeArray.length;
            replacementNodeTwo.parentNodes = [];
            replacementNodeTwo.sopInstancesUIDs = [];
            replacementNodeTwo.referencesDetails = [];

            replacementNodeTwo.parentNodes.push(parentNode);
            parentNode.removeChildrenNode(this);
            parentNode.children.push(replacementNodeTwo);

            for (let referencedParentSopInstanceUID of parentNodeSopInstanceUIDs) {
                const referenceDetail = this.getReferenceDetailsByReferencedSOPInstanceUID(referencedParentSopInstanceUID);

                if (referenceDetail != null) {
                    replacementNodeTwo.sopInstancesUIDs.push(referenceDetail.sourceInstanceUID);
                    replacementNodeTwo.referencesDetails.push(referenceDetail);

                } else {
                    // nothing to do
                }
            }
        }

        for (let updatedNode of nodeArray) {
            updatedNode.evaluateChildren();
        }

        return nodeArray;
    }

    splitBySOPInstanceUIDIfImageIsReferenced(referencedSOPInstanceUIDs) {
        const nodeArray = [];
        if (this.sopInstancesUIDs.size < 2) {
            nodeArray.push(this);
            return nodeArray;
        }

        const unreferencedSOPInstanceUIDs = [];
        for (let sopInstancesUID of this.sopInstancesUIDs) {
            if (referencedSOPInstanceUIDs.has(sopInstancesUID)) {
                let replacementNode = Object.create(Object.getPrototypeOf(new TreeNode()));
                let replacementNodeTwo = Object.assign(replacementNode, this);
                replacementNodeTwo.isVirtual = true;
                replacementNodeTwo.seriesInstanceUID = JSON.parse(JSON.stringify(this.seriesInstanceUID)) + '_' + nodeArray.length;
                replacementNodeTwo.key = JSON.parse(JSON.stringify(this.seriesInstanceUID)) + '_' + nodeArray.length;

                replacementNodeTwo.children = [];
                for (let childNode of this.children) {
                    const referencesFromChild = childNode.getReferenceDetailsByReferencedSOPInstanceUID(sopInstancesUID);
                    if (referencesFromChild != null) {
                        replacementNodeTwo.children.push(childNode);
                    }
                }

                replacementNodeTwo.sopInstancesUIDs = JSON.parse(JSON.stringify([sopInstancesUID]));
                replacementNodeTwo.referencesDetails = JSON.parse(JSON.stringify(this.getReferenceDetailsBySourceInstanceUID(sopInstancesUID)));
                nodeArray.push(replacementNodeTwo);


            } else {
                unreferencedSOPInstanceUIDs.push(sopInstancesUID);
            }
        }

        if (unreferencedSOPInstanceUIDs.length > 0) {
            let replacementNode = Object.create(Object.getPrototypeOf(new TreeNode()));
            let replacementNodeTwo = Object.assign(replacementNode, this);
            replacementNodeTwo.isVirtual = true;
            replacementNodeTwo.seriesInstanceUID = JSON.parse(JSON.stringify(this.seriesInstanceUID)) + '_' + nodeArray.length;
            replacementNodeTwo.key = JSON.parse(JSON.stringify(this.seriesInstanceUID)) + '_' + nodeArray.length;
            replacementNodeTwo.children = [];
            replacementNodeTwo.sopInstancesUIDs = JSON.parse(JSON.stringify(unreferencedSOPInstanceUIDs));
            replacementNodeTwo.referencesDetails = JSON.parse(JSON.stringify(this.getReferenceDetailsBySourceInstanceUID(unreferencedSOPInstanceUIDs)));
            nodeArray.push(replacementNodeTwo);
        }

        return nodeArray;

    }

    removeChildrenNode(newChildNode = new TreeNode()) {
        if (newChildNode.data === undefined) {
            return;
        }

        const updatedChildren = [];
        for (let childNode of this.children) {
            if (childNode.data != undefined) {
                if (childNode.data.seriesInstanceUID != newChildNode.data.seriesInstanceUID) {
                    updatedChildren.push(childNode);
                }
            }
        }

        this.children = updatedChildren;
    }

}