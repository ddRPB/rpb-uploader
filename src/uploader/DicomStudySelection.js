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

import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Tooltip } from 'primereact/tooltip';
import React, { Component, Fragment } from 'react';
import styledComponents from 'styled-components';

export class DicomStudySelection extends Component {

    /**
     * Format studies from the props state to display in study table
     * @return {array}
     */
    buildStudiesRows() {
        let studies = []
        for (let study of Object.values(this.props.studies)) {
            study.studyType = study.getStudyType();
            study.joinedStudyDates = study.getStudyDate();
            study.joinedStudyDescriptions = study.getStudyDescription();
            study.seriesModalities = (Array.from(new Set((study.getSeriesModalitiesArray())))).sort().join(", ");
            study.files = study.getInstancesSize();
            study.patientPropertiesDifferent = study.patientPropertiesHaveDifferentValues();

            studies.push({ ...study })
        }
        return Array.from(studies)
    }

    /**
     * Template for the details column and overlay panel that can be triggered in the Datatable
     */
    detailsActionTemplate(node, column) {
        let key = column.rowIndex;
        let detailsOverlayPanel = React.createRef();

        const patientDetailsList = this.createPatientDetailsList(node, key);
        const StyledButton = styledComponents(Button)`{ width: 135px }`;
        const differentPropertyValues = node.patientPropertiesDifferent;

        if (differentPropertyValues) {
            return <StyledButton
                type="button"
                label="Details"
                className="p-button-sm p-button-warning"
                icon="pi pi-exclamation-triangle"
                iconPos="right"
                onClick={(e) => detailsOverlayPanel.current.toggle(e)}
            >
                <OverlayPanel ref={detailsOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '300px' }} className="overlaypanel text-sm">
                    <Card title="Patient Details">
                        {patientDetailsList}
                    </Card>
                </OverlayPanel>
            </StyledButton>
        }

        return <div>
            <StyledButton
                type="button"
                label="Details"
                className="p-button-sm"
                onClick={(e) => detailsOverlayPanel.current.toggle(e)}
            >
                <OverlayPanel ref={detailsOverlayPanel} showCloseIcon id="overlay_panel" style={{ width: '300px' }} className="overlaypanel text-sm">
                    <Card title="Patient Details">
                        {patientDetailsList}
                    </Card>
                </OverlayPanel>
            </StyledButton>
        </div>
    }

    getExclamationToolTip(description) {
        return <Fragment>
            <Tooltip target=".exclamation-triangle-icon" />
            <span className="exclamation-triangle-icon" data-pr-tooltip={description}>
                <i
                    className="pi pi-exclamation-triangle"
                    style={{ 'color': 'red' }}
                ></i>
            </span>
        </Fragment>;
    }

    createPatientDetailsList(node, key) {
        const patientDetailsList = [];
        const inconsitentValuesMessages = 'Values are not consistent in all files.';

        if (node.patientName != undefined) {
            if (node.patientName.size > 0) {
                patientDetailsList.push(
                    <div key={key + '1'}>
                        <b>Name :</b>  {[...node.patientName].join(' / ')} {node.patientName.size === 1 ? null : this.getExclamationToolTip(inconsitentValuesMessages)}
                    </div>
                );
            }
        }

        if (node.patientID != undefined) {
            if (node.patientID.size > 0) {
                patientDetailsList.push(
                    <div key={key + '2'}>
                        <b>PID :</b> {[...node.patientID].join(' / ')} {node.patientID.size === 1 ? null : this.getExclamationToolTip(inconsitentValuesMessages)}
                    </div>
                );
            }
        }

        if (node.patientBirthDate != undefined) {
            if (node.patientBirthDate.size > 0) {
                patientDetailsList.push(
                    <div key={key + '3'}>
                        <b>Birth Date :</b> {[...node.patientBirthDate].join(' / ')} {node.patientBirthDate.size === 1 ? null : this.getExclamationToolTip(inconsitentValuesMessages)}
                    </div>
                );
            }
        }

        if (node.patientSex != undefined) {
            if (node.patientSex.size > 0) {
                patientDetailsList.push(
                    <div key={key + '4'}>
                        <b>Sex :</b> {[...node.patientSex].join(' / ')} {node.patientSex.size === 1 ? null : this.getExclamationToolTip(inconsitentValuesMessages)}
                    </div>);
            }
        }
        return patientDetailsList;
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
                    <Column className="text-sm" columnKey="Details" header="Details" body={this.detailsActionTemplate.bind(this)} />
                    <Column field="joinedStudyDescriptions" header="Study Description" className="text-sm" />
                    <Column field="joinedStudyDates" header="Study Date" className="text-sm" />
                    <Column field="files" header="Files" className="text-sm" />
                    <Column field="seriesModalities" header="Modalities" className="text-sm" />
                </DataTable>
            </StyledDataTablediv>
        )
    }
}