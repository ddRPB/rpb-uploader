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
        this.op = React.createRef();
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
        console.log(node);
        //console.log(column);

    }

    actionTemplate(node, column) {
        return <div>
            <Button
                type="button"
                icon="pi pi-search"
                className="p-button-success"
                style={{ marginRight: '.5em' }}
                onClick={(e) => this.showDetails(node, column)}
            >
            </Button>
            <Button
                type="button"
                icon="pi pi-pencil"
                className="p-button-warning"
                onClick={(e) => this.op.current.toggle(e)}
            >
                <OverlayPanel ref={this.op} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel-demo">

                </OverlayPanel>

            </Button>
        </div>
    }


    render() {
        return (
            <div>
                <div className="card">
                    <h5>RT View</h5>
                    <TreeTable value={this.getTree()} selectionMode="checkbox" selectionKeys={this.props.selectedNodeKeys} onSelectionChange={e => this.selectNodes(e)} >
                        <Column field="modality" header="Modality" expander></Column>
                        <Column field="seriesDescription" header="Series Description"></Column>
                        <Column field="seriesDate" header="Series Date"></Column>
                        <Column field="details" header="Details"></Column>
                        <Column field="seriesInstanceUID" header="SeriesInstanceUID"></Column>
                        <Column body={this.actionTemplate.bind(this)} style={{ textAlign: 'center', width: '10rem' }} />
                    </TreeTable>
                </div>
            </div>
        )
    }
}