// React
import React, {Component} from 'react'

// React GUI components
import Dropzone from 'react-dropzone'

/**
 * Dropzone component
 */
export default class DicomDropZone extends Component {

    state = {
        isDragging : false
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
            isDragging : true
        })
    }

    dragLeave = () => {
        this.setState({
            isDragging : false
        })
    }

    onDrop = (acceptedFiles) => {
        this.dragLeave()
        this.props.addFile(acceptedFiles)
    }

    getTextMessage = () => {
        if (this.props.isParsingFiles ) {
            return 'Parsing ' + Math.round(((this.props.fileParsed + this.props.fileIgnored) / this.props.fileLoaded) * 100) + '%'
        } else if(this.props.isUnzipping) {
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
