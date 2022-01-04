
import React, { Component, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export class DicomStudySelection extends Component {
    
    constructor(props) {
        super(props);
    }

    /**
     * Format studies from Redux State to display in study table
     * @return {array}
     */
     buildStudiesRows() {
        let studies = []
        for (let study of Object.values(this.props.studies)) {
            // study.status = this.getStudyStatus(study.studyInstanceUID)
        //     // study.selectedStudies = this.props.studiesReady.includes(study.studyInstanceUID)
            studies.push({ ...study })
        }
       return Array.from(studies)
    }

    render(){
        return (
            <DataTable
                    value={this.buildStudiesRows()}
                    selection={this.props.selectedStudy}
                    onSelectionChange={(e) => this.props.selectStudy(e)}
                    dataKey="studyInstanceUID"
                    >
                    <Column selectionMode="single" headerStyle={{width: '3em'}} />
                    <Column field="studyType" header="Type" />
                    <Column field="studyDescription" header="Description" />
                    <Column field="studyDate" header="Date" />
                </DataTable>
        )
    }
}