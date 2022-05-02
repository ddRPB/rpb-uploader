import React, { Component } from 'react'
import { Steps } from 'primereact/steps'
import { Dialog } from 'primereact/dialog'
import { ProgressBar } from 'primereact/progressbar'

export default class FileUploadDialogPanel extends Component {

    render = () => {
        const states = [
            { label: 'Evaluate' },
            { label: 'DeIdentify' },
            { label: 'Upload' },
            { label: 'Verify' }
        ];

        return (
            <Dialog
                header={"Upload Dialog"}
                visible={this.props.fileUploadDialogPanel}
                style={{ width: '50vw' }}
                onHide={this.props.hideFileUploadDialogPanel}
            >
                Files: {this.props.selectedDicomFiles.length}
                <Steps model={states} activeIndex={this.props.uploadProcessState} />
                <ProgressBar value={this.props.progressPanelValue} />
            </Dialog>
        )
    }
}