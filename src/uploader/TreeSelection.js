import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { TreeTable } from 'primereact/treetable';
import React, { Component, useRef } from 'react';


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
        // if (this.props.tree.root != null) {
        //     return this.props.tree.root;
        // }
        if (this.props.selectedStudy != null) {
            if(this.props.selectedStudy.rtViewTree != null)
            return this.props.selectedStudy.rtViewTree.root;
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
                        <Column field="modality" header="modality" expander></Column>
                        <Column field="description" header="description"></Column>
                        <Column field="details" header="details"></Column>
                        <Column field="SeriesInstanceUID" header="SeriesInstanceUID"></Column>
                        <Column body={this.actionTemplate.bind(this)} style={{ textAlign: 'center', width: '10rem' }} />
                    </TreeTable>
                </div>
            </div>
        )
    }
}