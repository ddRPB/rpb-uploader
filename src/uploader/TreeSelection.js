import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { TreeTable } from 'primereact/treetable';
import React, { Component } from 'react';


export class TreeSelection extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedNodeKeys: [],
        };
        // function provided by uploader
        this.selectNodes = props.selectNodes;
        this.showDetails = this.showDetails.bind(this);
        this.actionTemplate = this.actionTemplate.bind(this);
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

    showDetails(node, column) {
        console.log(node.data.modality);
        //console.log(column);

    }

    actionTemplate(node, column) {
        return <div>
            {this.getDetailsButtonDiv(node)}
        </div>;

    }

    getDetailsButtonDiv(node) {
        let detailsOverlayPanel = React.createRef();
        let detailList = node.data.detailsArray.map((item, index) => <li key={index}>{item.name + ": " + item.value}</li>);

        if (detailList.length > 0) {

            return <div>
                <Button
                    type="button"
                    icon="pi pi-pencil"
                    className="p-button-warning"
                    onClick={(e) => detailsOverlayPanel.current.toggle(e)}
                >
                    <OverlayPanel ref={detailsOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel">
                        <h4>Details</h4>
                        {detailList}
                    </OverlayPanel>

                </Button>
            </div>
        } else {
            return <div></div>
        }
    }

    render() {
        return (
            <div>
                <TreeTable value={this.getTree()} selectionMode="checkbox" selectionKeys={this.props.selectedNodeKeys} onSelectionChange={e => this.selectNodes(e)} >
                    <Column field="modality" header="Modality" expander></Column>
                    <Column field="seriesDescription" header="Series Description"></Column>
                    <Column field="seriesDate" header="Series Date"></Column>
                    {/* <Column field="details" header="Details"></Column> */}
                    {/* <Column field="seriesInstanceUID" header="SeriesInstanceUID"></Column> */}
                    <Column header="Details" body={this.actionTemplate.bind(this)} style={{ textAlign: 'center', width: '10rem' }} />
                </TreeTable>
            </div>
        )
    }
}