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
import { Dialog } from "primereact/dialog";
import { ScrollTop } from "primereact/scrolltop";
import { ProgressBar } from "primereact/progressbar";

/**
 * IgnoredFilesPanel component
 */
export default class IgnoredFilesPanel extends Component {
  createRows = () => {
    const ignoredFiles = this.props.ignoredFilesDetails;
    let rows = [];
    ignoredFiles.forEach((ignoredFile, index) => {
      rows.push({
        key: index + 1,
        fileName: ignoredFile.fileName,
        reason: ignoredFile.errorMessage,
      });
    });
    return rows;
  };

  /**
   * Render header for ignored files dialog
   */
  renderHeader = () => {
    return <div>Ignored Files</div>;
  };

  /**
   * Render the component
   */
  render = () => {
    return (
      <Dialog
        header={this.renderHeader()}
        visible={this.props.display}
        onHide={this.props.closeListener}
        style={{ width: "50vw" }}
      >
        {this.props.isParsingFiles ? <ProgressBar mode="indeterminate" /> : null}
        <DataTable
          value={this.createRows()}
          paginator
          responsiveLayout="scroll"
          paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          paginatorClassName="text-sm"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
          rows={10}
          rowsPerPageOptions={[10, 20, 50]}
        >
          <Column className="text-sm" field="key" header="" />
          <Column className="text-sm" field="fileName" header="File Name" />
          <Column className="text-sm" field="reason" header="Reason" />
        </DataTable>

        <ScrollTop />
      </Dialog>
    );
  };
}
