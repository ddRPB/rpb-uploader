// React
import React, { Component } from 'react'

// Boostrap GUI components
import { Modal, Badge } from 'react-bootstrap'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'

/**
 * IgnoredFilesPanel component
 */
export default class IgnoredFilesPanel extends Component {
    
    columns = [
        {
            dataFiled : 'key',
            hidden : true
        },
        {
            dataField: 'file',
            text: 'Files',
        },
        {
            dataField: 'reason',
            text: 'Reasons',
        },
    ];

    /**
     * Create rows for table display
     */
    createRows = () => {
        let ignoredFileNames = Object.keys(this.props.dataIgnoredFiles)
        let rows = []
        ignoredFileNames.forEach(ignoredFileName => {
            rows.push( {
                key : Math.random(),
                file: ignoredFileName,
                reason: this.props.dataIgnoredFiles[ignoredFileName],
            })
        })
        return rows
    }

    /**
     * Render the component
     */
    render = () => {
        return (
            <Modal show={this.props.display} onHide={this.props.closeListener}>
                <Modal.Header className="modal-header" closeButton>
                    <Modal.Title className="modal-title">
                        <Badge variant='warning'> {Object.keys(this.props.dataIgnoredFiles).length} File(s) Ignored</Badge>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body">
                    <BootstrapTable
                        keyField='key'
                        bodyClasses="du-ignored-files-modal td"
                        headerClasses="du-ignored-files-modal th"
                        classes="table table-responsive table-borderless"
                        data={ this.createRows() }
                        pagination={ paginationFactory() }
                        columns={this.columns}
                    />
                </Modal.Body>
            </Modal>
        )
    }
}
