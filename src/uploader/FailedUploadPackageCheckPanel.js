// React
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
// Primereact
import { Dialog } from 'primereact/dialog'
import { ScrollTop } from 'primereact/scrolltop';
import React, { Component } from 'react'


/**
 * FailedUploadPackageCheckPanel component
 */
export default class FailedUploadPackageCheckPanel extends Component {

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
                header={"Validation Errors"}
                visible={this.props.uploadPackageCheckFailedPanel}
                style={{ width: '50vw' }}
                onHide={this.props.hideUploadCheckResultsPanel}
            >
                <DataTable
                    value={this.props.evaluationUploadCheckResults}
                >
                    <Column field="title" header="Title" />
                    <Column field="message" header="Message" />
                    <Column field="series" header="Series" />
                    <Column field="file" header="File" />
                </DataTable>
                <ScrollTop />
            </Dialog>
        )
    }
}
