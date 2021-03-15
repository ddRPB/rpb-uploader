// React
import React, { Component } from 'react'

// Primereact
import { Badge } from 'primereact/badge'
import { Button } from 'primereact/button'

// Custom GUI components
import IgnoredFilesPanel from './IgnoredFilesPanel'

/**
 * DicomParsingDetails component
 */
export default class DicomParsingDetails extends Component {

    state = {
        showIgnoredFiles : false
    }

    toggleShowIgnoredFile = () => {
        this.setState((state) => { return { showIgnoredFiles : !state.showIgnoredFiles } })
    }

    /**
     * Render the component
     */
    render = () => {
        return (
            <>
                <Button type="button" label="Loaded:" className="p-button-info">
                    <Badge value={this.props.fileLoaded} />
                </Button>
                <Button type="button" label="Parsed:" className="p-button-success">
                    <Badge value={this.props.fileParsed} />
                </Button>
                <Button
                    type="button"
                    label="Ignored (Click to show):" className="p-button-warning"
                    onClick={this.toggleShowIgnoredFile}
                    >
                    <Badge
                        severity="danger"
                        value={Object.keys(this.props.dataIgnoredFiles).length}
                    />
                </Button>
                <IgnoredFilesPanel
                    display={this.state.showIgnoredFiles}
                    closeListener={this.toggleShowIgnoredFile}
                    dataIgnoredFiles={this.props.dataIgnoredFiles}
                />
            </>
        )
    }
}
