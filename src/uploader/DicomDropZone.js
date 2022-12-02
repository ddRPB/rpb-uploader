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
// React GUI components
import Dropzone from 'react-dropzone';

/**
 * Dropzone component
 */
export default class DicomDropZone extends Component {

    state = {
        isDragging: false
    }

    /**
     * Initialise CSS classes assigned to component states
     */
    getClasses = () => {
        let classArray = ['dropzone']

        if (this.props.isParsingFiles) classArray.push('dz-parsing')
        if (this.props.isUploadStarted) classArray.push('dz-deactivated')
        if (this.state.isDragging) classArray.push('dz-hover')

        return classArray.join(' ')
    }

    dragEnter = () => {
        this.setState({
            isDragging: true
        })
    }

    dragLeave = () => {
        this.setState({
            isDragging: false
        })
    }

    onDrop = (acceptedFiles) => {
        this.dragLeave()
        this.props.addFile(acceptedFiles)
    }

    getTextMessage = () => {
        if (this.props.isParsingFiles) {
            return 'Parsing ' + Math.round(((this.props.fileParsed + this.props.fileIgnored) / this.props.fileLoaded) * 100) + '%'
        } else if (this.props.isUnzipping) {
            return 'Unzipping'
        } else {
            return 'Drag and drop DICOM files here, or click to select folder'
        }
    }

    /**
     * Render the component
     */
    render = () => {
        return (
            <Dropzone onDragEnter={this.dragEnter} onDragLeave={this.dragLeave} onDrop={this.onDrop}>
                {({ getRootProps, getInputProps }) => (
                    <section>
                        <div className={this.getClasses()} {...getRootProps()}>
                            <input directory="" webkitdirectory="" {...getInputProps()} />
                            <p> {this.getTextMessage()}</p>
                        </div>
                    </section>
                )}
            </Dropzone>
        )
    }
}
