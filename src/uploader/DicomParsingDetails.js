// React
import React, { Component } from 'react'

// Boostrap GUI components
import Badge from 'react-bootstrap/Badge'

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
        this.setState((state) => {return {showIgnoredFiles : !state.showIgnoredFiles}})
    }

    /**
     * Render the component
     */
    render = () => {
        return (
            <>
                <Badge variant='secondary'>{this.props.fileLoaded} File(s) loaded</Badge>
                <Badge variant='success'>{this.props.fileParsed} File(s) parsed</Badge>
                <Badge
                    variant='warning'
                    className='du-ignored-badge' 
                    onClick={this.toggleShowIgnoredFile}
                    >
                    {Object.keys(this.props.dataIgnoredFiles).length} File(s) ignored (Click to show)
                </Badge>
                <IgnoredFilesPanel
                    display={this.state.showIgnoredFiles}
                    closeListener={this.toggleShowIgnoredFile}
                    dataIgnoredFiles={this.props.dataIgnoredFiles}
                />
            </>
        )
    }
}
