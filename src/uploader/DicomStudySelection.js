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
                    <Column selectionMode="single" headerStyle={{ width: '3em' }} className="text-sm" />
                    <Column field="studyType" header="Study Type" className="text-sm" />
                    <Column field="studyDescription" header="Study Description" className="text-sm" />
                    <Column field="studyDate" header="Study Date" className="text-sm" />
                    <Column field="files" header="Files" className="text-sm" />
                    <Column field="seriesModalities" header="Modalities" className="text-sm" />
                </DataTable>
            </StyledDataTablediv>
        )
    }
}