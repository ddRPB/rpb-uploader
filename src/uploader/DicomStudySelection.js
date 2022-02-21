
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { OverlayPanel } from 'primereact/overlaypanel';
import React, { Component } from 'react';
import styledComponents from 'styled-components';

export class DicomStudySelection extends Component {

    /**
     * Format studies from Redux State to display in study table
     * @return {array}
     */
    buildStudiesRows() {
        let studies = []
        for (let study of Object.values(this.props.studies)) {
            study.studyType = study.getStudyType();
            study.seriesModalities = (Array.from(new Set((study.getSeriesModalitiesArray())))).sort().join(", ");
            study.files = study.getInstancesSize();

            studies.push({ ...study })
        }
        return Array.from(studies)
    }

    uploadSlotAnalysisResultTemplate(node, column) {
        let key = column.rowIndex;

        const StyledButton = styledComponents(Button)`{ width: 135px}`;
        const errors = node.result.errors != undefined ? node.result.errors : [];
        const warnings = node.result.warnings != undefined ? node.result.warnings : [];

        let detailsOverlayPanel = React.createRef();
        const detailErrorsList = errors.map((item, index) => <div className='text-pink-500' key={"e" + key + index}>{item}</div>);
        const detailWarningsList = warnings.map((item, index) => <div className='text-yellow-500' key={"w" + key + index}>{item}</div>);
        const detailList = detailErrorsList.concat(detailWarningsList)

        // console.log(errors);

        return <div>
            {errors.length > 0 ?
                <StyledButton
                    type="button"
                    label="Details"
                    className="p-button-sm p-button-danger text-xs h-1rem"
                    icon="pi pi-bolt"
                    onClick={(e) => detailsOverlayPanel.current.toggle(e)}
                >
                    <OverlayPanel ref={detailsOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel text-sm">
                        <h5>Upload Slot Evaluation</h5>
                        {detailList}
                    </OverlayPanel>
                </StyledButton>
                : warnings.length > 0 ?
                    <StyledButton
                        type="button"
                        label="Details"
                        className="p-button-sm p-button-warning"
                        icon="pi pi-bolt" onClick={(e) => detailsOverlayPanel.current.toggle(e)}
                    >
                        <OverlayPanel ref={detailsOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '450px' }} className="overlaypanel text-sm">
                            <h5>Upload Slot Evaluation</h5>
                            {detailList}
                        </OverlayPanel>

                    </StyledButton> : null
            }
        </div>
    }

    render() {
        const StyledDataTablediv = styledComponents.div`.p-datatable .p-datatable-tbody tr td {padding: 5px 5px; }`;

        return (
            <StyledDataTablediv>
                <DataTable
                    value={this.buildStudiesRows()}
                    selection={this.props.selectedStudy}
                    onSelectionChange={(e) => this.props.selectStudy(e)}
                    dataKey="studyInstanceUID"
                >
                    <Column selectionMode="single" headerStyle={{ width: '3em' }} className="text-sm" />
                    <Column field="studyType" header="Study Type" className="text-sm" />
                    <Column className="text-sm" columnKey="Warnings" header="" body={this.uploadSlotAnalysisResultTemplate.bind(this)} />
                    <Column field="studyDescription" header="Study Description" className="text-sm" />
                    <Column field="studyDate" header="Study Date" className="text-sm" />
                    <Column field="files" header="Files" className="text-sm" />
                    <Column field="seriesModalities" header="Modalities" className="text-sm" />
                </DataTable>
            </StyledDataTablediv>
        )
    }
}