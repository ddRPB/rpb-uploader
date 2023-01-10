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

// React
import React, { Component } from 'react';
// Primereact
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { ScrollTop } from 'primereact/scrolltop';
import styledComponents from 'styled-components';

export default class SanityCheckResultsPanel extends Component {

    createSanityCheckResultRows = () => {
        const sanityCheckResults = this.props.sanityCheckResults;
        const rows = []

        sanityCheckResults.forEach((evaluationResultItem, index) => {
            rows.push({
                title: evaluationResultItem.title,
                category: evaluationResultItem.category,
                message: evaluationResultItem.message,
                severity: evaluationResultItem.severity,
                ignore: evaluationResultItem.ignore,
                type: 'sanity-check',
            })
        })

        return rows
    }

    createDeIdentificationCheckResultRows = () => {
        const deIdentificationCheckResults = this.props.deIdentificationCheckResults;
        const rows = []

        deIdentificationCheckResults.forEach((evaluationResultItem, index) => {
            rows.push({
                title: evaluationResultItem.title,
                category: evaluationResultItem.category,
                message: evaluationResultItem.message,
                severity: evaluationResultItem.severity,
                ignore: evaluationResultItem.ignore,
                type: 'de-identification-check',
            })
        })

        return rows
    }

    createCombinedRows() {
        const sanityCheckResultRows = this.createSanityCheckResultRows();
        const deIdentificationResultRows = this.createDeIdentificationCheckResultRows();
        return sanityCheckResultRows.concat(deIdentificationResultRows);
    }

    /**
     * Sets the parameter to false in the sanitycheck configuration and triggers the update of
     * the sanity check results for the uploader.
     */
    updateSanityCheckConfigurationParameterToFalse(category) {
        const sanityCheckConfiguration = this.props.sanityCheckConfiguration;
        const updatedSanityCheckConfiguration = { ...sanityCheckConfiguration, [category]: false };
        this.props.updateSanityCheckConfiguration(updatedSanityCheckConfiguration);
    }

    updateDeIdentificationCheckConfigurationParameterToFalse(category) {
        const deIdentificationCheckConfiguration = this.props.deIdentificationCheckConfiguration;
        const updatedDeIdentificationCheckConfiguration = { ...deIdentificationCheckConfiguration, [category]: false };
        this.props.updateDeIdentificationCheckConfiguration(updatedDeIdentificationCheckConfiguration);
    }

    sanityCheckResultCommandsActionTemplate(node, column) {
        const key = column.rowIndex;
        const sanityCheckConfiguration = this.props.sanityCheckConfiguration;
        const StyledButton = styledComponents(Button)`{ width: 135px }`;

        if (sanityCheckConfiguration[[node.category]] === true) { // button is active if configuration for that category is set to true
            return <div>
                <StyledButton
                    type="button"
                    label={'Disable ' + node.severity}
                    className="p-button-sm"
                    onClick={(e) => this.updateSanityCheckConfigurationParameterToFalse(node.category)}
                >
                </StyledButton>
            </div>
        }
        return null;
    }

    deIdentificationCheckResultCommandsActionTemplate(node, column) {
        const key = column.rowIndex;
        const deIdentificationCheckConfiguration = this.props.deIdentificationCheckConfiguration;
        const StyledButton = styledComponents(Button)`{ width: 135px }`;

        if (deIdentificationCheckConfiguration[[node.category]] === true) { // button is active if configuration for that category is set to true
            return <div>
                <StyledButton
                    type="button"
                    label={'Disable ' + node.severity}
                    className="p-button-sm"
                    onClick={(e) => this.updateDeIdentificationCheckConfigurationParameterToFalse(node.category)}
                >
                </StyledButton>
            </div>
        }
        return null;
    }

    /**
     * Provides the action template, based on the type
     */
    getCommandActionTemplate(node, column) {
        if (node.type === 'sanity-check') {
            return this.sanityCheckResultCommandsActionTemplate(node, column);
        } else {
            return this.deIdentificationCheckResultCommandsActionTemplate(node, column);
        }
    }


    /**
        * Render header
        */
    renderHeader = () => {
        return (
            <div>
                Sanity Check Results
            </div>
        )
    }

    /**
    * Render the component
    */
    render = () => {

        return (
            <Dialog
                header={this.renderHeader()}
                visible={this.props.display}
                onHide={this.props.closeListener}
                style={{ width: '50vw', height: '50vw' }}
            >
                <DataTable
                    size="small"
                    value={this.createCombinedRows()}
                >
                    <Column className="text-sm" field="message" sortable header="Message" />
                    <Column className="text-sm" columnKey="Disable" header="Commands" body={this.getCommandActionTemplate.bind(this)} />
                </DataTable>
                <ScrollTop />
            </Dialog>
        )
    }

}