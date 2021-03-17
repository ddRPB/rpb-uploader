// React and Redux
import React, { Component } from 'react'
import { connect } from 'react-redux'

// Primereact
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

// Actions
import { selectStudy, addStudyReady, removeStudyReady } from '../actions/DisplayTables'
import { addSeriesReady, removeSeriesReady, selectSeries } from '../actions/DisplayTables'
import { unsetSlotID } from '../actions/Studies'

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
     * @param {String} studyInstanceUID
     * @return {Boolean}
     */
    getStudyStatus(studyInstanceUID) {

        if ( this.props.warningsStudies[studyInstanceUID] === undefined ) {
            // If no warning at study level, look if remaining warnings at series level
            let seriesArray = this.getSeriesFromStudy(studyInstanceUID)

            for (let series of seriesArray ) {
                if ( !this.isSeriesWarningsPassed(series.seriesInstanceUID)) {
                    return 'Incomplete'
                }
            }
            // If not, study is valid
            return 'Valid'

        } else {
            // If warning at study level return them as string
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
     * Fetch studies from Redux State to display in Series table
     * @return {Object}
     */
    buildSeriesRows() {
        let seriesArray = []

        if (this.props.selectedStudy !== null) {

            let seriesToDisplay = this.getSeriesFromStudy(this.props.selectedStudy)

            seriesToDisplay.forEach( (series) => {
                series.status = this.isSeriesWarningsPassed(series.seriesInstanceUID) ? 'Valid' : 'Rejected'
                series.selectedSeries = this.props.seriesReady.includes(series.seriesInstanceUID)
                seriesArray.push({
                    ...series
                })
            })

        }

        return seriesArray
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
     * Action to change the Redux state for selected study
     * @param study
     */
    selectedStudyChanged(study) {
        this.props.selectStudy(study.studyInstanceUID)
    }

    /**
     * Action to change the Redux state for selected series
     * @param series
     */
    selectedSeriesChanged(series) {
        this.props.selectSeries(series.seriesInstanceUID)
    }

    /**
     * Render the component
     */
    render() {
        return (
            // onSelectionChange={e => setSelectedProduct3(e.value)}
            <div disabled={ !this.props.isAnalysisDone || this.props.isUploadStarted }>
                <DataTable
                    value={this.buildStudiesRows()}
                    selection={this.props.selectedStudy}
                    onSelectionChange={(e) => this.selectedStudyChanged(e.value)}
                    dataKey="studyInstanceUID"
                    >
                    <Column selectionMode="single" headerStyle={{width: '3em'}} />
                    <Column field="studyType" header="Type" />
                    <Column field="studyDescription" header="Description" />
                    <Column field="studyDate" header="Date" />
                </DataTable>
                <DataTable
                    value={this.buildSeriesRows()}
                    selection={this.props.selectedSeries}
                    onSelectionChange={(e) => this.selectedSeriesChanged(e.value)}
                    dataKey="seriesInstanceUID"
                    selectionMode="single"
                    >
                    <Column field="modality" header="Modality" />
                    <Column field="seriesDescription" header="Description" />
                    <Column field="seriesDate" header="Date" />
                </DataTable>
            </div>
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

const mapDispatchToProps = {
    selectStudy,
    addStudyReady,
    removeStudyReady,
    unsetSlotID,
    addSeriesReady,
    removeSeriesReady,
    selectSeries
}

export default connect(mapStateToProps, mapDispatchToProps)(DicomBrowser)
