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
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
// Styled Component
import styledComponents from 'styled-components';
// Custom GUI components
import IgnoredFilesPanel from './IgnoredFilesPanel';

/**
 * DicomParsingDetails component
 */
export default class DicomParsingMenu extends Component {

    state = {
        showIgnoredFiles: false
    }

    toggleShowIgnoredFile = () => {
        this.setState((state) => { return { showIgnoredFiles: !state.showIgnoredFiles } })
    }

    /**
     * Render the component
     */
    render = () => {

        const StyledButton = styledComponents(Button)`{ width: 135px }`;

        return (
            <React.Fragment>
                <Toolbar
                    model={[{}]}
                    left={
                        <React.Fragment>
                            <StyledButton className={"pr-3 p-button-secondary"} label="Reset" icon="pi pi-refresh" iconPos="right" onClick={this.props.resetAll} />
                            <StyledButton
                                type="button"
                                label="Loaded:"
                                className="p-button-outlined p-button-secondary"
                                disabled={true}
                            >
                                <Badge
                                    className="text-900"
                                    value={this.props.fileLoaded}

                                />
                            </StyledButton>
                            <StyledButton
                                type="button"
                                label="Parsed:"
                                className="p-button-outlined p-button-success"
                                disabled={true}
                            >
                                <Badge
                                    className="text-900"
                                    value={this.props.fileParsed}
                                />
                            </StyledButton>
                            <StyledButton
                                type="button"
                                label="Ignored:" className={this.props.filesIgnoredCount === 0 ? "p-button-outlined p-button-warning" : "p-button-warning"} style={{ "width": "135px" }}
                                onClick={this.toggleShowIgnoredFile}
                            >
                                <Badge
                                    severity="warning"
                                    value={this.props.filesIgnoredCount}
                                />
                            </StyledButton>
                            <StyledButton
                                type="button"
                                label="Selected:"
                                className={"p-button-outlined p-button-secondary"}
                                disabled={true}
                            >
                                <Badge
                                    className="text-900"
                                    value={this.props.selectedDicomFiles.length}
                                />
                            </StyledButton>
                        </React.Fragment>}
                    right={
                        <React.Fragment>
                            <StyledButton
                                label="Connect"
                                onClick={this.props.getServerUploadParameter}
                                icon="pi pi-download"
                                iconPos="right"
                                className='p-button-success'
                                hidden={this.props.uploadApiKey != null}
                            />
                            <StyledButton
                                label="Upload"
                                disabled={Object.keys(this.props.selectedNodeKeys).length === 0}
                                onClick={this.props.submitUploadPackage}
                                icon="pi pi-cloud-upload"
                                iconPos="right"
                                className='p-button-success'
                                hidden={this.props.uploadApiKey === null}
                            />
                        </React.Fragment>

                    }
                >
                </Toolbar>
                <IgnoredFilesPanel
                    display={this.state.showIgnoredFiles}
                    closeListener={this.toggleShowIgnoredFile}
                    dataIgnoredFiles={this.props.dataIgnoredFiles}
                />

            </React.Fragment >
        )
    }
}
