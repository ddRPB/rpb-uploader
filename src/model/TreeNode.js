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
 * TreeNode - for the UI (https://www.primefaces.org/primereact/treetable/)
 * 
 */
export default class TreeNode {
    data = {};
    children = [];
    parentNodes = [];
    sopInstancesUIDs = [];
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

    splitIntoVirtualNodes() {
        const nodeArray = [];
        if (this.isLeaf) {
            nodeArray.push(this);
            return nodeArray;
        }

        return nodeArray;
    }

}