import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { TreeTable } from 'primereact/treetable';
import React, { Component } from 'react';
import styledComponents from 'styled-components';


export class TreeSelection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedNodeKeys: [],
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

        let item = formatedRoiNumber + " - (" + formatedObservationNumber + ") - " + rOIName + "(" + rTROIInterpretedType + ")";

        return item;
    }

    roiActionTemplate(node, column) {
        let key = column.rowIndex;
        if (node.data.StructureSetROISequence === undefined || node.data.rOIOberservationSequenceArray === undefined) return <div key={key}></div>;

        let rOISequenceOverlayPanel = React.createRef();
        let rOIOberservationSequenceList = [];

        let rOISequenceLookup = new Map();
        node.data.StructureSetROISequence.forEach((item) => rOISequenceLookup.set(item.get("ROINumber"), item));

        if (node.data.rOIOberservationSequenceArray !== undefined) {
            rOIOberservationSequenceList = node.data.rOIOberservationSequenceArray.map((item, index) => <div key={key + index}>{this.getROIDetailItem(rOISequenceLookup, item)}</div>);
        }

        return <div>
            {rOIOberservationSequenceList.length === 0
                ? null
                : <Button
                    type="button"
                    label="ROI"
                    className="p-button-sm p-button-raised"
                    onClick={(e) => rOISequenceOverlayPanel.current.toggle(e)}
                >
                    <OverlayPanel ref={rOISequenceOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel">
                        <h5>ROI Sequence</h5>
                        {rOIOberservationSequenceList}
                    </OverlayPanel>

                </Button>}

        </div>
    }

    commandActionTemplate(node, column) {
        let key = column.rowIndex;
        if (node.data.detailsArray === undefined) return <div key={key}></div>;

        let detailsOverlayPanel = React.createRef();
        let detailList = node.data.detailsArray.map((item, index) => <div key={key + index}>{item.name + ": " + item.value}</div>);

        return <div>
            {detailList.length === 0
                ? null
                : <Button
                    type="button"
                    label="Details"
                    className="p-button-sm p-button-raised"
                    onClick={(e) => detailsOverlayPanel.current.toggle(e)}
                >
                    <OverlayPanel ref={detailsOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel">
                        <h5>Details</h5>
                        {detailList}
                    </OverlayPanel>
                </Button>}
        </div>

    }

    render() {
        const StyledTreeDiv = styledComponents.div`.p-treetable .p-treetable-tbody tr td {padding: 3px 3px; }`;

        return (
            <div>
                <StyledTreeDiv>
                    <TreeTable value={this.getTree()} selectionMode="checkbox" selectionKeys={this.props.selectedNodeKeys} onSelectionChange={e => this.selectNodes(e)} >
                        <Column field="modality" header="Series Modality" expander></Column>
                        <Column columnKey="ROIs" header="ROIs" body={this.roiActionTemplate.bind(this)} />
                        <Column field="seriesDescription" header="Series Description"></Column>
                        <Column field="instancesSize" header="Files"></Column>
                        <Column columnKey="Commands" header="Commands" body={this.commandActionTemplate.bind(this)} />
                    </TreeTable>
                </StyledTreeDiv>
            </div>
        )
    }
}