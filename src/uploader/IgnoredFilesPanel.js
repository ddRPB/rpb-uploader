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


/**
 * IgnoredFilesPanel component
 */
export default class IgnoredFilesPanel extends Component {

    // TODO: https://www.primefaces.org/primereact/datatable/paginator/

    /**
     * Create rows for table display
     */
    // createRows = () => {
    //     let ignoredFileNames = Object.keys(this.props.dataIgnoredFiles)
    //     let rows = []
    //     ignoredFileNames.forEach(ignoredFileName => {
    //         rows.push({
    //             key: Math.random(),
    //             file: ignoredFileName,
    //             reason: this.props.dataIgnoredFiles[ignoredFileName],
    //         })
    //     })
    //     return rows
    // }

    createRows = () => {
        const ignoredFiles = this.props.dataIgnoredFiles;
        let rows = []
        ignoredFiles.forEach(ignoredFile => {
            rows.push({
                key: Math.random(),
                fileName: ignoredFile.fileName,
                reason: ignoredFile.errorMessage,
            })
        })
        return rows
    }

    /**
     * Render header for ignored files dialog
     */
    renderHeader = () => {
        return (
            <div>
                Ignored Files: {Object.keys(this.props.dataIgnoredFiles).length}
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
                style={{ width: '50vw' }}
                onHide={this.props.closeListener}
            >
                <DataTable
                    value={this.createRows()}
                >
                    <Column field="fileName" header="File" />
                    <Column field="reason" header="Reason" />
                </DataTable>
                <ScrollTop />
            </Dialog>
        )
    }
}
