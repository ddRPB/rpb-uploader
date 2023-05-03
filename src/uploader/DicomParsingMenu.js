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
import SanityCheckResultsPanel from './SanityCheckResultsPanel';
import SettingsDialog from './SettingsDialog';

/**
 * DicomParsingDetails menu component
 */
export default class DicomParsingMenu extends Component {

    state = {
        showIgnoredFiles: false,
        showSanityCheckResultsPanel: false,
        showSettingsDialog: false,
    }

    toggleShowIgnoredFile = () => {
        this.setState((state) => { return { showIgnoredFiles: !state.showIgnoredFiles } })
    }

    toggleSanityCheckResultsPanel = () => {
        this.setState((state) => { return { showSanityCheckResultsPanel: !state.showSanityCheckResultsPanel } })
    }

    toggleSettingsDialog = () => {
        this.setState((state) => { return { showSettingsDialog: !state.showSettingsDialog } })
    }

    resetAll() {
        this.props.resetAll();
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
                            <StyledButton
                                className={"pr-3 p-button-secondary"}
                                label="Setup"
                                icon="pi pi-sliders-h"
                                iconPos="right"
                                onClick={this.toggleSettingsDialog}
                            />
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
                                label="Ignored:"
                                className={this.props.ignoredFilesCount === 0 ? "p-button-outlined p-button-warning" : "p-button-warning"} style={{ "width": "135px" }}
                                onClick={this.toggleShowIgnoredFile}
                            >
                                <Badge
                                    severity="warning"
                                    value={this.props.ignoredFilesCount}
                                />
                            </StyledButton>
                            <StyledButton
                                type="button"
                                label="Selected:"
                                className="p-button-outlined p-button-secondary"
                                onClick={this.toggleSanityCheckResultsPanel}

                            >
                                <Badge
                                    className="text-900"
                                    value={this.props.selectedDicomFiles.length}
                                />

                            </StyledButton>
                        </React.Fragment>}
                    right={
                        < React.Fragment >
                            <StyledButton
                                label="Connect"
                                onClick={this.props.getServerUploadParameter}
                                icon="pi pi-download"
                                iconPos="right"
                                className='p-button-success'
                                hidden={this.props.uploadApiKey != null}
                            />
                            <StyledButton
                                label="Issues"
                                onClick={this.toggleSanityCheckResultsPanel}
                                icon="pi pi-exclamation-triangle"
                                iconPos="right"
                                className='p-button-warning'
                                hidden={this.props.sanityCheckResults.length === 0 && this.props.deIdentificationCheckResults.length === 0}
                            />
                            <StyledButton
                                label="Upload"
                                disabled={Object.keys(this.props.selectedNodeKeys).length === 0 || !this.props.selectedFilesCanBeParsed}
                                onClick={this.props.submitUploadPackage}
                                icon="pi pi-cloud-upload"
                                iconPos="right"
                                className='p-button-success'
                                hidden={
                                    this.props.uploadApiKey === null || this.props.sanityCheckResults.length > 0 || this.props.deIdentificationCheckResults.length > 0
                                }
                            />
                        </React.Fragment>

                    }
                >
                </Toolbar >
                <IgnoredFilesPanel
                    display={this.state.showIgnoredFiles}
                    closeListener={this.toggleShowIgnoredFile}
                    isParsingFiles={this.props.isParsingFiles}
                    ignoredFilesCount={this.props.ignoredFilesCount}
                    ignoredFilesDetails={this.props.ignoredFilesDetails}
                />

                <SanityCheckResultsPanel
                    display={this.state.showSanityCheckResultsPanel}
                    closeListener={this.toggleSanityCheckResultsPanel}
                    sanityCheckConfiguration={this.props.sanityCheckConfiguration}
                    sanityCheckResults={this.props.sanityCheckResults}
                    updateSanityCheckConfiguration={this.props.updateSanityCheckConfiguration}
                    deIdentificationCheckResults={this.props.deIdentificationCheckResults}
                    deIdentificationCheckResultsPerSeries={this.props.deIdentificationCheckResultsPerSeries}
                    deIdentificationCheckConfiguration={this.props.deIdentificationCheckConfiguration}
                    updateDeIdentificationCheckConfiguration={this.props.updateDeIdentificationCheckConfiguration}
                />

                <SettingsDialog
                    display={this.state.showSettingsDialog}
                    closeListener={this.toggleSettingsDialog}
                    sanityCheckConfiguration={this.props.sanityCheckConfiguration}
                    updateSanityCheckConfiguration={this.props.updateSanityCheckConfiguration}
                    deIdentificationCheckConfiguration={this.props.deIdentificationCheckConfiguration}
                    updateDeIdentificationCheckConfiguration={this.props.updateDeIdentificationCheckConfiguration}
                    language={this.props.language}
                    resetAll={this.props.resetAll}
                />

            </React.Fragment >
        )
    }
}
