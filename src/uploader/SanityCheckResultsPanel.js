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
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { ScrollTop } from 'primereact/scrolltop';
import { ProgressBar } from 'primereact/progressbar';

export default class SanityCheckResultsPanel extends Component {

    //sanityCheckResults

    createRows = () => {
        const evaluationResultItems = this.props.sanityCheckResults;
        let rows = []
        evaluationResultItems.forEach((evaluationResultItem, index) => {
            rows.push({
                key: index + 1,
                title: evaluationResultItem.title,
                category: evaluationResultItem.category,
                message: evaluationResultItem.message,
                severity: evaluationResultItem.severity,
                ignore: evaluationResultItem.ignore
            })
        })
        return rows
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
                style={{ width: '50vw' }}
            >
                <DataTable
                    value={this.createRows()}
                    paginator responsiveLayout="scroll"
                    paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
                    paginatorClassName="text-sm"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords}" rows={10} rowsPerPageOptions={[10, 20, 50]}

                >
                    <Column className="text-sm" field="key" header="" />
                    <Column className="text-sm" field="title" header="title" />
                    <Column className="text-sm" field="category" header="category" />
                    <Column className="text-sm" field="message" header="message" />
                    <Column className="text-sm" field="severity" header="severity" />
                    <Column className="text-sm" field="ignore" header="ignore" />
                </DataTable>

                <ScrollTop />
            </Dialog>
        )
    }

}