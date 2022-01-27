// React
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
// Primereact
import { Dialog } from 'primereact/dialog'
import { ScrollTop } from 'primereact/scrolltop';
import React, { Component } from 'react'


/**
 * IgnoredFilesPanel component
 */
export default class IgnoredFilesPanel extends Component {

    /**
     * Create rows for table display
     */
    createRows = () => {
        let ignoredFileNames = Object.keys(this.props.dataIgnoredFiles)
        let rows = []
        ignoredFileNames.forEach(ignoredFileName => {
            rows.push({
                key: Math.random(),
                file: ignoredFileName,
                reason: this.props.dataIgnoredFiles[ignoredFileName],
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
                    <Column field="file" header="File" />
                    <Column field="reason" header="Reason" />
                </DataTable>
                <ScrollTop />
            </Dialog>
        )
    }
}
