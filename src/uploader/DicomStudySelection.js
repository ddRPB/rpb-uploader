
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
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
                    <Column selectionMode="single" headerStyle={{ width: '3em' }} />
                    <Column field="studyType" header="Study Type" />
                    <Column field="studyDescription" header="Study Description" />
                    <Column field="studyDate" header="Study Date" />
                    <Column field="files" header="Files" />
                    <Column field="seriesModalities" header="Modalities" />
                    {/* <Column field="studyInstanceUID" header="studyInstanceUID" /> */}
                    {/* <Column field="patientID" header="patientID" />
                    <Column field="patientBirthDate" header="patientBirthDate" />
                    <Column field="patientSex" header="patientSex" />
                    <Column field="patientName" header="patientName" /> */}
                </DataTable>
            </StyledDataTablediv>
        )
    }
}