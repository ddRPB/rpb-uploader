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
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { TabPanel, TabView } from "primereact/tabview";
import styledComponents from "styled-components";
import SanityCheckTypesUINames from "./../constants/sanityCheck/SanityCheckTypeUINames";

export default class SettingsDialog extends Component {
  buildSanityConfigurationCheckRows() {
    let configs = [];
    for (let configKey of Object.keys(this.props.sanityCheckConfiguration)) {
      if (!configKey.toString().startsWith("replacement")) {
        const config = {};
        config.name = configKey;
        config.realName = SanityCheckTypesUINames[configKey];
        config.value = this.props.sanityCheckConfiguration[configKey];
        configs.push({ ...config });
      }
    }
    return Array.from(configs);
  }

  buildDeIdentificationCheckRows() {
    let configs = [];
    for (let configKey of Object.keys(this.props.deIdentificationCheckConfiguration)) {
      const config = {};
      config.name = configKey;
      config.value = this.props.deIdentificationCheckConfiguration[configKey];
      configs.push({ ...config });
    }
    return Array.from(configs);
  }

  buildUploaderConfigurationRows() {
    let configs = [];
    for (let configKey of Object.keys(this.props.uploaderConfig)) {
      const config = {};
      config.name = configKey;
      config.value = this.props.uploaderConfig[configKey];
      configs.push({ ...config });
    }
    return Array.from(configs);
  }

  buildCommandsRows() {
    let configs = [
      {
        name: "Reset to Defaults",
      }
    ];
    return Array.from(configs);

  }

  /**
   * Sets the parameter to false in the sanitycheck configuration and triggers the update of
   * the sanity check results for the uploader.
   */
  updateSanityCheckConfigurationParameter(e, nodeName) {
    const sanityCheckConfiguration = this.props.sanityCheckConfiguration;
    const updatedSanityCheckConfiguration = {
      ...sanityCheckConfiguration,
      [nodeName]: e.value,
    };
    this.props.updateSanityCheckConfiguration(updatedSanityCheckConfiguration);
  }

  updateDeIdentificationCheckConfigurationParameter(e, nodeName) {
    const deIdentificationCheckConfiguration = this.props.deIdentificationCheckConfiguration;
    const updatedDeIdentificationCheckConfiguration = {
      ...deIdentificationCheckConfiguration,
      [nodeName]: e.value,
    };
    this.props.updateDeIdentificationCheckConfiguration(updatedDeIdentificationCheckConfiguration);
  }

  sanityConfigurationCheckSwitchActionTemplate(node, column) {
    const key = column.rowIndex;

    return (
      <div>
        <InputSwitch
          checked={node.value}
          onChange={(e) => this.updateSanityCheckConfigurationParameter(e, node.name)}
        />
      </div>
    );
  }

  deIdentificationConfigurationSwitchActionTemplate(node, column) {
    const key = column.rowIndex;

    return (
      <div>
        <InputSwitch
          checked={node.value}
          onChange={(e) => this.updateDeIdentificationCheckConfigurationParameter(e, node.name)}
        />
      </div>
    );
  }

  detailsActionTemplate(node, column) {
    const StyledButton = styledComponents(Button)`{ width: 135px }`;
    switch (node.name) {
      case "Reset to Defaults":
        return (
          <StyledButton
            type="button"
            label="Reset"
            className="p-button-sm"
            icon="pi pi-refresh"
            onClick={(e) => this.resetAll()}
          >
          </StyledButton>
        );
        break;
      default:
        // no elememt
        break;
    }
  }

  /**
   * Render header
   */
  renderHeader = () => {
    return <div>Settings</div>;
  };

  resetAll() {
    this.props.resetAll();
  }

  /**
   * Render the component
   */
  render = () => {

    const sanityCheckConfigurationParameterTableHeader = (
      <div className="table-header">Sanity Check Configuration Parameter</div>
    );

    const deIdentificationCheckConfigurationTableHeader = (
      <div className="table-header">De-Identification Check Configuration Parameter</div>
    );

    const uploaderConfigurationTableHeader = (
      <div className="table-header">Uploader Configuration</div>
    );

    const uploaderConfigurationCommandsTableHeader = (
      <div className="table-header">Commands</div>
    );

    const StyledDataTablediv = styledComponents.div`.p-datatable .p-datatable-tbody tr td {padding: 5px 5px; }`;

    return (
      <Dialog
        header={this.renderHeader()}
        visible={this.props.display}
        onHide={this.props.closeListener}
        style={{ width: "50vw", height: "50vw" }}
      >
        <TabView scrollable="true">
          <TabPanel header="Configuration">
            <StyledDataTablediv>
              <DataTable
                value={this.buildCommandsRows()}
                showHeaders="false"
                dataKey="name"
                header={uploaderConfigurationCommandsTableHeader}
              >
                <Column field="name" className="text-sm" />
                <Column
                  className="text-sm"
                  columnKey="name"
                  body={this.detailsActionTemplate.bind(this)}
                />
              </DataTable>
            </StyledDataTablediv>
            <StyledDataTablediv>
              <DataTable
                value={this.buildUploaderConfigurationRows()}
                dataKey="name"
                header={uploaderConfigurationTableHeader}
              >
                <Column field="name" header="Parameter" className="text-sm" sortable />
                <Column field="value" header="Value" className="text-sm" sortable />
              </DataTable>
            </StyledDataTablediv>

          </TabPanel>
          <TabPanel header="Sanity Check">
            <StyledDataTablediv>
              <DataTable
                value={this.buildSanityConfigurationCheckRows()}
                dataKey="name"
                header={sanityCheckConfigurationParameterTableHeader}
              >
                {/* <Column field="name" header="Parameter" className="text-sm" sortable /> */}
                <Column field="realName" header="Parameter" className="text-sm" sortable />
                <Column
                  className="text-sm"
                  columnKey="value"
                  header="Status"
                  body={this.sanityConfigurationCheckSwitchActionTemplate.bind(this)}
                />
              </DataTable>
            </StyledDataTablediv>
          </TabPanel>

          <TabPanel header="De-Identification Check">
            <StyledDataTablediv>
              <DataTable
                value={this.buildDeIdentificationCheckRows()}
                dataKey="name"
                header={deIdentificationCheckConfigurationTableHeader}
              >
                <Column field="name" header="Parameter" className="text-sm" sortable />
                <Column
                  className="text-sm"
                  columnKey="value"
                  header="Status"
                  body={this.deIdentificationConfigurationSwitchActionTemplate.bind(this)}
                />
              </DataTable>
            </StyledDataTablediv>
          </TabPanel>
        </TabView>
      </Dialog>
    );
  };
}
