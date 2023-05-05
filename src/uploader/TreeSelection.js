/*
 * This file is part of RadPlanBio
 *
 * Copyright (C) 2013 - 2023 RPB Team
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

import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { Divider } from "primereact/divider";
import { OverlayPanel } from "primereact/overlaypanel";
import { TreeTable } from "primereact/treetable";
import React, { Component } from "react";
import styledComponents from "styled-components";
import { convertDicomDateStringArrayToLocaleString } from "../util/DateParser";

export class TreeSelection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      expandedKeys: {},
    };

    // function provided by uploader
    this.selectNodes = props.selectNodes;
  }

  /**
   * The component is used in different contexts. This function selects the tree that will be displayed, based on the seriesTree property.
   */
  getTree() {
    if (this.props.selectedStudy != null) {
      if (this.props.selectedStudy.rtViewTree != null && this.props.seriesTree === "rtViewTree") {
        return this.props.selectedStudy.rtViewTree.root;
      }
      if (this.props.selectedStudy.allRootTree != null && this.props.seriesTree === "allRootTree") {
        return this.props.selectedStudy.allRootTree.root;
      }
      if (
        this.props.selectedStudy.virtualSeriesRtViewTree != null &&
        this.props.seriesTree === "virtualSeriesRtViewTree"
      ) {
        return this.props.selectedStudy.virtualSeriesRtViewTree.root;
      }
    }

    return {};
  }

  getROIDetailItem(rOISequenceDetailsArrayItem) {
    let rOINumber = rOISequenceDetailsArrayItem.get("ReferencedROINumber");
    let rTROIInterpretedType = rOISequenceDetailsArrayItem.get("RTROIInterpretedType");
    let rOIName = rOISequenceDetailsArrayItem.get("ROIName");

    let numberFormat = new Intl.NumberFormat("en-US", {
      minimumIntegerDigits: 3,
    });

    let formatedRoiNumber = numberFormat.format(rOINumber);
    let item = formatedRoiNumber + " - " + rOIName + "(" + rTROIInterpretedType + ")";

    return item;
  }

  /**
   * Creates the button logic for the commands column
   */
  commandsActionTemplate(node, column) {
    let key = column.rowIndex;

    const rOISequenceOverlayPanel = React.createRef();
    let rOIOberservationSequenceList = [];

    if (node.data.rOISequenceDetailsArray.length > 0) {
      rOIOberservationSequenceList = node.data.rOISequenceDetailsArray.map((item, index) => (
        <div key={key + index}>{this.getROIDetailItem(item)}</div>
      ));
    }

    const StyledButton = styledComponents(Button)`{ width: 135px }`;

    return (
      <div>
        {rOIOberservationSequenceList.length === 0 ? null : (
          <StyledButton
            type="button"
            label="ROI"
            className="p-button-sm"
            onClick={(e) => rOISequenceOverlayPanel.current.toggle(e)}
          >
            <OverlayPanel
              ref={rOISequenceOverlayPanel}
              showCloseIcon
              id="overlay_panel"
              style={{ width: "450px" }}
              className="overlaypanel text-sm"
            >
              <Card title="ROI Sequence">{rOIOberservationSequenceList}</Card>
            </OverlayPanel>
          </StyledButton>
        )}
      </div>
    );
  }

  getDetailsButtonClassName(sanityCheckResults, deIdentificationCheckResults, nodeParsable) {
    if (nodeParsable === false) {
      return "p-button-sm p-button-danger";
    }

    if (sanityCheckResults.length > 0 || deIdentificationCheckResults.length > 0) {
      return "p-button-sm p-button-warning";
    }

    return "p-button-sm";
  }

  /**
   * Creates the button logic for the details column
   */
  detailsActionTemplate(node, column) {
    let key = column.rowIndex;
    let detailsOverlayPanel = React.createRef();

    let seriesDetailsList = [];

    if (node.details != undefined) {
      seriesDetailsList = node.details.map((item, index) => (
        <div key={"0" + key + index}>
          <b>{item.name + ": "} </b> {item.value}
        </div>
      ));
    }

    if (node.dateDetails != undefined) {
      let seriesDateDetailsList = [];
      seriesDateDetailsList = node.dateDetails.map((item, index) => (
        <div key={"1" + key + index}>
          <b>{item.name + ": "} </b> {convertDicomDateStringArrayToLocaleString(item.value, this.props.language)}
        </div>
      ));
      seriesDetailsList = seriesDetailsList.concat(seriesDateDetailsList);
    }

    const seriesUid = node.data.seriesInstanceUID;

    let fileList = [];
    if (node.notParsableFileNames.length > 0) {
      fileList = node.notParsableFileNames.map((item, index) => <div key={key + index}>{item}</div>);
    }

    const sanityCheckResults = this.props.sanityCheckResultsPerSeries.get(seriesUid);
    const sanityCheckDetailList = sanityCheckResults.map((item, index) => (
      <div key={key + index}>
        <b>{item.title + ": "} </b> {item.message}
      </div>
    ));

    const deIdentificationCheckResults = this.props.deIdentificationCheckResultsPerSeries.get(seriesUid);
    const deIdentificationCheckDetailList = deIdentificationCheckResults.map((item, index) => (
      <div key={key + index}>
        <b>{item.title + ": "} </b> {item.message}
      </div>
    ));

    let patientDetailsList = node.patientDetails.map((item, index) => (
      <div key={"0" + key + index}>
        <b>{item.name + ": "} </b> {item.value}
      </div>
    ));
    const patientDateDetailsList = node.patientDateDetails.map((item, index) => (
      <div key={"1" + key + index}>
        <b>{item.name + ": "} </b> {convertDicomDateStringArrayToLocaleString(item.value, this.props.language)}
      </div>
    ));
    patientDetailsList = patientDetailsList.concat(patientDateDetailsList);

    const deIdentificationStatusList = node.deIdentificationDetails.map((item, index) => (
      <div key={key + index}>
        <b>{item.name + ": "} </b> {item.value}
      </div>
    ));

    const StyledButton = styledComponents(Button)`{ width: 135px }`;

    return (
      <div>
        {seriesDetailsList.length === 0 && sanityCheckDetailList.length === 0 ? null : (
          <StyledButton
            type="button"
            label="Details"
            className={this.getDetailsButtonClassName(sanityCheckResults, deIdentificationCheckResults, node.parsable)}
            icon={
              sanityCheckResults.length === 0 && deIdentificationCheckResults.length === 0 && node.parsable
                ? ""
                : "pi pi-exclamation-triangle"
            }
            iconPos="right"
            onClick={(e) => detailsOverlayPanel.current.toggle(e)}
          >
            <OverlayPanel
              ref={detailsOverlayPanel}
              showCloseIcon
              id="overlay_panel"
              style={{ width: "600px" }}
              className="overlaypanel text-sm"
            >
              {node.parsable === true ? null : (
                <Card title="DICOM File Parsing" className="text-pink-600">
                  There is a problem parsing one or more files from the dataset:
                  {fileList}
                </Card>
              )}
              {sanityCheckResults.length === 0 ? null : (
                <Card title="Sanity Check" className="text-orange-500">
                  {sanityCheckDetailList}
                </Card>
              )}
              {deIdentificationCheckDetailList.length === 0 ? null : (
                <Card title="De-Identification Check Results" className="text-orange-500">
                  {deIdentificationCheckDetailList}
                </Card>
              )}
              <Card title="Details">
                {seriesDetailsList}

                {patientDetailsList.length === 0 ? null : (
                  <React.Fragment>
                    <Divider />
                    <h5>Patient</h5>
                    {patientDetailsList}
                  </React.Fragment>
                )}
                {deIdentificationStatusList.length === 0 ? null : (
                  <React.Fragment>
                    <Divider />
                    <h5>De-Identification Status</h5>
                    {deIdentificationStatusList}
                  </React.Fragment>
                )}
              </Card>
            </OverlayPanel>
          </StyledButton>
        )}
      </div>
    );
  }

  render() {
    const StyledTreeDiv = styledComponents.div`.p-treetable .p-treetable-tbody tr td {padding: 5px 5px; }`;

    return (
      <div>
        <StyledTreeDiv>
          <TreeTable
            value={this.getTree()}
            selectionMode="checkbox"
            selectionKeys={this.props.selectedNodeKeys}
            onSelectionChange={(e) => this.selectNodes(e)}
            expandedKeys={this.state.expandedKeys}
            onToggle={(e) => this.setState({ expandedKeys: e.value })}
          >
            <Column className="text-sm" field="modality" header="Series Modality" expander></Column>
            <Column
              className="text-sm"
              columnKey="Details"
              header="Details"
              body={this.detailsActionTemplate.bind(this)}
            />
            <Column className="text-sm" field="seriesDescription" header="Series Description"></Column>
            <Column className="text-sm" field="instancesSize" header="Files"></Column>
            <Column
              className="text-sm"
              columnKey="Commands"
              header="Commands"
              body={this.commandsActionTemplate.bind(this)}
            />
          </TreeTable>
        </StyledTreeDiv>
      </div>
    );
  }
}
