// React and Redux
import React, { Component } from 'react'
import { connect } from 'react-redux'

/**
 * Dicom Browser component
 */
class DicomBrowser extends Component {

    /**
     * Render the component
     */
    render() {
        return (
            'DicomBrowser'
            // <div disabled={ !this.props.isCheckDone || this.props.isUploadStarted }>
            //     <Row>
            //         <DisplayStudies multiUpload={this.props.multiUpload} studiesRows={this.buildStudiesRows()} />
            //     </Row>
            //     <Row>
            //         <DisplaySeries seriesRows={this.buildSeriesRows()} />
            //     </Row>
            // </div>
        )
    }
}

const mapStateToProps = state => {
    return {
        series: state.Series.series,
        studies: state.Studies.studies,
        seriesReady: state.DisplayTables.seriesReady,
        studiesReady: state.DisplayTables.studiesReady,
        selectedStudy: state.DisplayTables.selectedStudy,
        selectedSeries: state.DisplayTables.selectedSeries,
        warningsSeries: state.Warnings.warningsSeries,
        warningsStudies: state.WarningsStudy.warningsStudy
    }
}

export default connect(mapStateToProps, null)(DicomBrowser)
