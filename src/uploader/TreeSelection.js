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

import React, { Component } from 'react';
import styledComponents from 'styled-components';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { TreeTable } from 'primereact/treetable';


export class TreeSelection extends Component {

    constructor(props) {
        super(props);

        this.state = {
            expandedKeys: {}
        };

        // function provided by uploader
        this.selectNodes = props.selectNodes;
    }

    getTree() {
        if (this.props.selectedStudy != null) {
            if (this.props.selectedStudy.rtViewTree != null && this.props.seriesTree === "rtViewTree") {
                return this.props.selectedStudy.rtViewTree.root;
            }
            if (this.props.selectedStudy.allRootTree != null && this.props.seriesTree === "allRootTree") {
                return this.props.selectedStudy.allRootTree.root;
            }
        }

        return {};
    }

    getROIDetailItem(rOISequenceLookup, rOIOberservationSequenceItem) {
        if (rOIOberservationSequenceItem === undefined) return "";

        let rOINumber = rOIOberservationSequenceItem.get("ReferencedROINumber");
        let observationNumber = rOIOberservationSequenceItem.get("ObservationNumber");
        // let rOIObservationLabel = rOIOberservationSequenceItem.get("ROIObservationLabel");
        let rTROIInterpretedType = rOIOberservationSequenceItem.get("RTROIInterpretedType");

        let rOISequenceItem = rOISequenceLookup.get(rOINumber);
        let rOIName = rOISequenceItem.get("ROIName");

        let numberFormat = new Intl.NumberFormat('en-US', { minimumIntegerDigits: 3 });

        let formatedRoiNumber = numberFormat.format(rOINumber);
        let formatedObservationNumber = numberFormat.format(observationNumber);

        let item = formatedRoiNumber + " - " + rOIName + "(" + rTROIInterpretedType + ")";

        return item;
    }

    commandsActionTemplate(node, column) {
        let key = column.rowIndex;
        if (node.data.StructureSetROISequence === undefined || node.data.rOIOberservationSequenceArray === undefined) return <div key={key}></div>;

        let rOISequenceOverlayPanel = React.createRef();
        let rOIOberservationSequenceList = [];

        let rOISequenceLookup = new Map();
        node.data.StructureSetROISequence.forEach((item) => rOISequenceLookup.set(item.get("ROINumber"), item));

        if (node.data.rOIOberservationSequenceArray !== undefined) {
            rOIOberservationSequenceList = node.data.rOIOberservationSequenceArray.map((item, index) => <div key={key + index}>{this.getROIDetailItem(rOISequenceLookup, item)}</div>);
        }

        const StyledButton = styledComponents(Button)`{ width: 135px }`;

        return <div>
            {rOIOberservationSequenceList.length === 0
                ? null
                : <StyledButton
                    type="button"
                    label="ROI"
                    className="p-button-sm"
                    onClick={(e) => rOISequenceOverlayPanel.current.toggle(e)}
                >
                    <OverlayPanel ref={rOISequenceOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel text-sm">
                        <h5>ROI Sequence</h5>
                        {rOIOberservationSequenceList}
                    </OverlayPanel>

                </StyledButton>}

        </div>
    }

    detailsActionTemplate(node, column) {
        let key = column.rowIndex;
        if (node.data.detailsArray === undefined) return <div key={key}></div>;

        let detailsOverlayPanel = React.createRef();
        let detailList = node.data.detailsArray.map((item, index) => <div key={key + index}>{item.name + ": " + item.value}</div>);

        const StyledButton = styledComponents(Button)`{ width: 135px }`;

        return <div>
            {detailList.length === 0
                ? null
                : <StyledButton
                    type="button"
                    label="Details"
                    className="p-button-sm"
                    onClick={(e) => detailsOverlayPanel.current.toggle(e)}
                >
                    <OverlayPanel ref={detailsOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel text-sm">
                        <h5>Details</h5>
                        {detailList}
                    </OverlayPanel>
                </StyledButton>}
        </div>

    }

    render() {
        const StyledTreeDiv = styledComponents.div`.p-treetable .p-treetable-tbody tr td {padding: 5px 5px; }`;

        return (
            <div>
                <StyledTreeDiv >
                    <TreeTable
                        value={this.getTree()}
                        selectionMode="checkbox"
                        selectionKeys={this.props.selectedNodeKeys}
                        onSelectionChange={e => this.selectNodes(e)}
                        expandedKeys={this.state.expandedKeys}
                        onToggle={e => this.setState({ expandedKeys: e.value })}
                    >
                        <Column className="text-sm" field="modality" header="Series Modality" expander></Column>
                        <Column className="text-sm" columnKey="Commands" header="Commands" body={this.commandActionTemplate.bind(this)} />
                        <Column className="text-sm" field="seriesDescription" header="Series Description"></Column>
                        <Column className="text-sm" field="instancesSize" header="Files"></Column>
                        <Column className="text-sm" columnKey="ROIs" header="ROIs" body={this.roiActionTemplate.bind(this)} />
                    </TreeTable>
                </StyledTreeDiv>
            </div>
        )
    }
}