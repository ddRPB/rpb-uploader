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

import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import React, { Component } from "react";

export class DicomSeriesSelection extends Component {
  constructor(props) {
    super(props);
  }

  buildSeriesRows() {
    let seriesArray = [];

    if (this.props.selectedStudy === null) {
      return seriesArray;
    }

    if (this.props.selectedStudy.series !== null) {
      for (let seriesInstanceUID in this.props.selectedStudy.series) {
        let series = this.props.selectedStudy.series[seriesInstanceUID];
        seriesArray.push(series);
        series.key = seriesInstanceUID;
      }
    }
    return seriesArray;
  }

  render() {
    return (
      <DataTable
        value={this.buildSeriesRows()}
        selection={this.props.selectedSeries}
        onSelectionChange={(e) => this.props.selectSeries(e)}
        dataKey="seriesInstanceUID"
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3em" }} />
        <Column field="modality" header="Modality" />
        <Column field="seriesDescription" header="Description" />
        <Column field="seriesDate" header="Date" />
      </DataTable>
    );
  }
}
