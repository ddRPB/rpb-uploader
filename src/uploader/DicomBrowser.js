// React and Redux
import React, { Component } from 'react'
import { connect } from 'react-redux'

// Primereact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

/**
 * Dicom Browser component
 */
class DicomBrowser extends Component {

    /**
     * Format studies from Redux State to display in study table
     * @return {array}
     */
    buildStudiesRows() {
        let studies = []
        for (let study of Object.values(this.props.studies)) {
            study.status = this.getStudyStatus(study.studyInstanceUID)
            study.selectedStudies = this.props.studiesReady.includes(study.studyInstanceUID)
            studies.push({ ...study })
        }
        return studies
    }

    /**
     * Check the study status according to its warnings and its series warnings
     * @param {Object} study
     * @return {Boolean}
     */
    getStudyStatus(studyInstanceUID) {

        if ( this.props.warningsStudies[studyInstanceUID] === undefined ) {
            //If no warning at study level, look if remaining warnings at series level
            let seriesArray = this.getSeriesFromStudy(studyInstanceUID)

            for (let series of seriesArray ) {
                if ( !this.isSeriesWarningsPassed(series.seriesInstanceUID)) {
                    return 'Incomplete'
                }
            }
            //If not, study is valid
            return 'Valid'

        } else {
            //If warning at study level return them as string
            if (this.props.warningsStudies[studyInstanceUID]['ALREADY_KNOWN_STUDY'] !== undefined) {
                return 'Already Known'
            }

            if (this.props.warningsStudies[studyInstanceUID]['NULL_VISIT_ID'] !== undefined) {
                return 'Rejected'
            }

        }
    }

    /**
     * Get Series in Redux related to a StudyInstanceUID
     * @param {string} studyInstanceUID
     */
    getSeriesFromStudy = (studyInstanceUID) => {
        //Read available series in Redux
        let seriesArray = Object.values(this.props.series)
        //Select series belonging to the current study
        let seriesToDisplay = seriesArray.filter((series)=> {
            return series.studyInstanceUID === studyInstanceUID
        })

        return seriesToDisplay
    }

    /**
     * Check if the series warnings have been all passed
     * @param {Object} series
     * @return {Boolean}
     */
    isSeriesWarningsPassed(series) {
        for (const warning in this.props.warningsSeries[series]) {
            if (!this.props.warningsSeries[series][warning].dismissed) {
                return false
            }
        }
        return true
    }

    /**
     * Render the component
     */
    render() {
        return (

            <div disabled={ !this.props.isAnalysisDone || this.props.isUploadStarted }>
                <DataTable
                    value={this.buildStudiesRows()}
                    >
                    <Column field="studyType" header="Type" />
                    <Column field="studyDescription" header="Description" />
                    <Column field="studyDate" header="Date" />
                </DataTable>
            </div>

            // <div disabled={ !this.props.isAnalysisDone || this.props.isUploadStarted }>
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
