import { Badge } from 'primereact/badge'
import { Button } from 'primereact/button'
import { Column } from 'primereact/column'
import { DataTable } from 'primereact/datatable'
import { Dialog } from 'primereact/dialog'
import { Divider } from 'primereact/divider'
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
            { label: 'Verify' },
            { label: 'Link Study' }
        ];

        const StyledCommandButton = styledComponents(Button)`{ width: 135px }`;
        const StyledDisabbledButton = styledComponents(Button)`{ width: 135px }`;

        return (
            <Dialog
                header={"Upload Dialog"}
                visible={this.props.fileUploadDialogPanel}
                // closable={false}
                // style={{ width: '50vw' }}
                maximized={true}
                onHide={this.props.hideFileUploadDialogPanel}
            >
                Start uploading of {this.props.selectedDicomFiles.length} {this.props.selectedDicomFiles.length > 1 ? 'files' : 'file'}.
                <Divider />
                <Steps model={states} activeIndex={this.props.uploadProcessState} />

                <Divider />

                <React.Fragment>
                    <Toolbar
                        model={[{}]}
                        left={
                            <React.Fragment>
                                <StyledDisabbledButton
                                    type="button"
                                    label="Analysed:"
                                    className="text-sm p-button-outlined p-button-info"
                                    disabled={true}
                                >
                                    <Badge value={this.props.analysedFilesCount} />
                                </StyledDisabbledButton>
                                <StyledDisabbledButton
                                    type="button"
                                    label="DeIdentified:"
                                    className="text-sm p-button-outlined p-button-info"
                                    disabled={true}
                                >
                                    <Badge value={this.props.deIdentifiedFilesCount} />
                                </StyledDisabbledButton>
                                <StyledDisabbledButton
                                    type="button"
                                    label="Uploaded:"
                                    className="text-sm p-button-outlined p-button-info"
                                    disabled={true}
                                >
                                    <Badge value={this.props.uploadedFilesCount} />
                                </StyledDisabbledButton>
                                <StyledDisabbledButton
                                    type="button"
                                    label="Verified:"
                                    className="text-sm p-button-outlined p-button-info"
                                    disabled={true}
                                >
                                    <Badge value={this.props.verifiedUploadedFilesCount} />
                                </StyledDisabbledButton>

                            </React.Fragment>
                        }
                        right={
                            <React.Fragment>
                                <StyledCommandButton
                                    hidden={
                                        !this.props.studyIsLinked
                                    }
                                    className={"text-sm pr-3"} label="Finish" icon="pi pi-check" iconPos="right" onClick={this.props.redirectToPortal} />
                                <StyledCommandButton
                                    hidden={
                                        this.props.evaluationUploadCheckResults.length == 0 && this.props.dicomUidReplacements != null
                                    }
                                    className={"text-sm p-button-danger pr-3"} label="Retry" icon="pi pi-sync" iconPos="right" onClick={this.props.retrySubmitUploadPackage} />
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