// React
// Primereact
import { Badge } from 'primereact/badge';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import React, { Component } from 'react';
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
                            <StyledButton className={"pr-3"} label="Reset" icon="pi pi-refresh"  iconPos="right" />
                            <Button
                                type="button"
                                label="Loaded:"
                                className="p-button-outlined p-button-info"
                                style={{ "width": "135px" }}
                                disabled={true}
                            >
                                <Badge value={this.props.fileLoaded} />
                            </Button>
                            <Button
                                type="button"
                                label="Parsed:"
                                className="p-button-outlined p-button-success"
                                style={{ "width": "135px" }}
                                disabled={true}
                            >
                                <Badge value={this.props.fileParsed} />
                            </Button>
                            <Button
                                type="button"
                                label="Ignored:" className={Object.keys(this.props.dataIgnoredFiles).length === 0 ? "p-button-outlined p-button-warning" : "p-button-warning"} style={{ "width": "135px" }}
                                onClick={this.toggleShowIgnoredFile}
                            >
                                <Badge
                                    severity="danger"
                                    value={Object.keys(this.props.dataIgnoredFiles).length}
                                />
                            </Button>
                            <Button
                                type="button"
                                label="Selected:"
                                className={"p-button-outlined p-button-info"}
                                style={{ "width": "135px" }}
                                disabled={true}
                            >
                                <Badge value={this.props.selectedDicomFiles.length} />
                            </Button>
                        </React.Fragment>}
                    right={
                        <React.Fragment>
                            <Button label="Submit" disabled={Object.keys(this.props.selectedNodeKeys).length === 0} style={{ "width": "135px" }} icon="pi pi-angle-double-right" iconPos="right" />
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
