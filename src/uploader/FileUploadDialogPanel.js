import React, { Component } from 'react'
import { Dialog } from 'primereact/dialog'

export default class FileUploadDialogPanel extends Component {

    render = () => {

        return (
            <Dialog
                header={"Upload Dialog"}
                visible={this.props.fileUploadDialogPanel}
                style={{ width: '50vw' }}
                onHide={this.props.hideFileUploadDialogPanel}
            >
                Files: {this.props.selectedDicomFiles.length}
            </Dialog>
        )
    }
}