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
import React, { Component } from "react";
// Primereact
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";

/**
 * Dicom Browser component
 */
class DicomBrowser extends Component {
  /**
   * Format studies from props to display in study table
   * @return {array}
   */
  buildStudiesRows() {
    let studies = [];
    for (let study of Object.values(this.props.studies)) {
      study.status = this.getStudyStatus(study.studyInstanceUID);
      study.selectedStudies = this.props.studiesReady.includes(study.studyInstanceUID);
      studies.push({ ...study });
    }
    return studies;
  }

  /**
   * Check the study status according to its warnings and its series warnings
   * @param {String} studyInstanceUID
   * @return {Boolean}
   */
  getStudyStatus(studyInstanceUID) {
    if (this.props.warningsStudies[studyInstanceUID] === undefined) {
      // If no warning at study level, look if remaining warnings at series level
      let seriesArray = this.getSeriesFromStudy(studyInstanceUID);

      for (let series of seriesArray) {
        if (!this.isSeriesWarningsPassed(series.seriesInstanceUID)) {
          return "Incomplete";
        }
      }
      // If not, study is valid
      return "Valid";
    } else {
      // If warning at study level return them as string
      if (this.props.warningsStudies[studyInstanceUID]["ALREADY_KNOWN_STUDY"] !== undefined) {
        return "Already Known";
      }

      if (this.props.warningsStudies[studyInstanceUID]["NULL_VISIT_ID"] !== undefined) {
        return "Rejected";
      }
    }
  }

  /**
   * Get DicomSeries from props, based on StudyInstanceUID
   * @param {string} studyInstanceUID
   */
  getSeriesFromStudy = (studyInstanceUID) => {
    //Read available series in Redux
    let seriesArray = Object.values(this.props.series);
    //Select series belonging to the current study
    let seriesToDisplay = seriesArray.filter((series) => {
      return series.studyInstanceUID === studyInstanceUID;
    });

    return seriesToDisplay;
  };

  /**
   * Fetch studies from props to display in Series table
   * @return {Object}
   */
  buildSeriesRows() {
    let seriesArray = [];

    if (this.props.selectedStudy !== null) {
      let seriesToDisplay = this.getSeriesFromStudy(this.props.selectedStudy);

      seriesToDisplay.forEach((series) => {
        series.status = this.isSeriesWarningsPassed(series.seriesInstanceUID) ? "Valid" : "Rejected";
        series.selectedSeries = this.props.seriesReady.includes(series.seriesInstanceUID);
        seriesArray.push({
          ...series,
        });
      });
    }

    return seriesArray;
  }

  /**
   * Check if the series warnings have been all passed
   * @param {Object} series
   * @return {Boolean}
   */
  isSeriesWarningsPassed(series) {
    for (const warning in this.props.warningsSeries[series]) {
      if (!this.props.warningsSeries[series][warning].dismissed) {
        return false;
      }
    }
    return true;
  }

  /**
   * Action to change the Redux state for selected study
   * @param study
   */
  selectedStudyChanged(study) {
    this.props.selectStudy(study.studyInstanceUID);
  }

  /**
   * Action to change the Redux state for selected series
   * @param series
   */
  selectedSeriesChanged(series) {
    this.props.selectSeries(series.seriesInstanceUID);
  }

  /**
   * Render the component
   */
  render() {
    return (
      // onSelectionChange={e => setSelectedProduct3(e.value)}
      <div disabled={!this.props.isAnalysisDone || this.props.isUploadStarted}>
        <DataTable
          value={this.buildStudiesRows()}
          selection={this.props.selectedStudy}
          onSelectionChange={(e) => this.selectedStudyChanged(e.value)}
          dataKey="studyInstanceUID"
        >
          <Column selectionMode="single" headerStyle={{ width: "3em" }} />
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
    );
  }
}

export default DicomBrowser;
