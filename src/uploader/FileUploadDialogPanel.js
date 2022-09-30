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
            { label: 'Link DICOM Study' },
            { label: 'De-Identify and Upload' },
            { label: 'Verify' }
        ];

        const StyledCommandButton = styledComponents(Button)`{ width: 140px }`;
        const StyledDisabbledButton = styledComponents(Button)`{ width: 140px }`;

        return (
            <Dialog
                header={"Upload Dialog"}
                visible={this.props.fileUploadDialogPanel}
                closable={this.props.evaluationUploadCheckResults.length > 0}
                // style={{ width: '50vw' }}
                maximized={true}
                onHide={this.props.hideFileUploadDialogPanel}
            >
                Start uploading of {this.props.selectedDicomFiles.length} {this.props.selectedDicomFiles.length > 1 ? 'files' : 'file'}.
                <Divider />
                <Steps model={states} activeIndex={this.props.uploadProcessState} />

                <Divider />
                <div
                    hidden={!this.props.fileUploadInProgress}
                >
                    <ProgressBar
                        mode="indeterminate"
                    />
                </div>

                <Divider />

                <React.Fragment>
                    <Toolbar
                        model={[{}]}
                        left={
                            <React.Fragment>
                                <StyledDisabbledButton
                                    type="button"
                                    label="Analysed:"
                                    className="text-sm p-button-outlined p-button-secondary"
                                    disabled={true}
                                >
                                    <Badge
                                        className="text-900"
                                        value={this.props.analysedFilesCount}
                                    />
                                </StyledDisabbledButton>
                                <StyledDisabbledButton
                                    type="button"
                                    label="Uploaded:"
                                    className="text-sm p-button-outlined p-button-secondary"
                                    disabled={true}
                                >
                                    <Badge
                                        className="text-900"
                                        value={this.props.uploadedFilesCount}
                                    />
                                </StyledDisabbledButton>
                                <StyledDisabbledButton
                                    type="button"
                                    label="Verified:"
                                    className="text-sm p-button-outlined p-button-secondary"
                                    disabled={true}
                                >
                                    <Badge
                                        className="text-900"
                                        value={this.props.verifiedUploadedFilesCount}
                                    />
                                </StyledDisabbledButton>

                            </React.Fragment>
                        }
                        right={
                            <React.Fragment>
                                <StyledCommandButton
                                    hidden={
                                        !(this.props.studyIsLinked && this.props.verifiedUploadedFilesCount === this.props.uploadedFilesCount && this.props.uploadedFilesCount > 0)
                                    }
                                    className={"text-sm p-button-success pr-3"} label="Finish" icon="pi pi-check" iconPos="right" onClick={this.props.redirectToPortal} />
                                <StyledCommandButton
                                    hidden={
                                        this.props.evaluationUploadCheckResults.length == 0 && this.props.dicomUidReplacements != null
                                    }
                                    className={"text-sm p-button-warning  pr-3"} label="Log file" icon="pi pi-file" iconPos="right" onClick={this.props.generateLogFile} />
                                <StyledCommandButton
                                    hidden={
                                        this.props.evaluationUploadCheckResults.length == 0 && this.props.dicomUidReplacements != null
                                    }
                                    className={"text-sm p-button-success pr-3"} label="Retry" icon="pi pi-sync" iconPos="right" onClick={this.props.retrySubmitUploadPackage} />
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
                        <Column field="message" header="Error Messages" />
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