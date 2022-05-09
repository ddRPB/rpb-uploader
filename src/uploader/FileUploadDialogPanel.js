import { Badge } from 'primereact/badge'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { Divider } from 'primereact/divider'
import { ProgressBar } from 'primereact/progressbar'
import { ScrollTop } from 'primereact/scrolltop'
import { Steps } from 'primereact/steps'
import { Toolbar } from 'primereact/toolbar'
import React, { Component } from 'react'
import styledComponents from 'styled-components'

export default class FileUploadDialogPanel extends Component {

    render = () => {
        const states = [
            { label: 'Evaluate' },
            { label: 'DeIdentify and Upload' },
            // { label: 'Verify' }
        ];

        const StyledButton = styledComponents(Button)`{ width: 135px }`;

        return (
            <Dialog
                header={"Upload Dialog"}
                visible={this.props.fileUploadDialogPanel}
                style={{ width: '50vw' }}
                onHide={this.props.hideFileUploadDialogPanel}
            >
                Start uploading of {this.props.selectedDicomFiles.length} {this.props.selectedDicomFiles.length > 1 ? 'files' : 'file'}.
                <Divider />
                <Steps model={states} activeIndex={this.props.uploadProcessState} />
                <ProgressBar value={this.props.progressPanelValue} />

                <Divider />

                <React.Fragment>
                    <Toolbar
                        model={[{}]}
                        left={
                            <React.Fragment>
                                <Button
                                    type="button"
                                    label="Loaded:"
                                    className="p-button-outlined p-button-info"
                                    style={{ "width": "135px" }}
                                    disabled={true}
                                >
                                    <Badge value={this.props.fileLoaded} />
                                </Button>

                            </React.Fragment>
                        }
                        right={
                            <React.Fragment>
                                <StyledButton
                                    hidden={
                                        this.props.evaluationUploadCheckResults.length == 0 && this.props.dicomUidReplacements != null
                                    }
                                    className={"pr-3"} label="Retry" icon="pi pi-sync" iconPos="right" onClick={this.props.retrySubmitUploadPackage} />
                            </React.Fragment>
                        }

                    >
                    </Toolbar>

                </React.Fragment >

                <div className="mb-3" hidden={this.props.evaluationUploadCheckResults.length == 0}>
                    <DataTable
                        value={this.props.evaluationUploadCheckResults}
                    >
                        {/* <Column field="title" header="Title" /> */}
                        <Column field="message" header="Message" />
                        {/* <Column field="seriesUid" header="Series UID" />
                        <Column field="fileName" header="File Name" />
                        <Column field="sopInstanceUid" header="SOP Instance UID" /> */}
                    </DataTable>
                </div>
                <ScrollTop />
            </Dialog>
        )
    }
}