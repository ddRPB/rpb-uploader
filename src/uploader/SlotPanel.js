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

import React, { Component } from "react";
import styledComponents from "styled-components";
import { Card } from "primereact/card";
import { convertOCDateStringToLocaleString } from "../util/DateParser";

/**
 * SlotPanel component
 */
export class SlotPanel extends Component {
  valueIsNullString = "not defined";

  getStudyName() {
    return this.props.studyIdentifier != null ? this.props.studyIdentifier : this.valueIsNullString;
  }

  getForm() {
    return this.props.formOid != null ? this.props.formOid : this.valueIsNullString;
  }

  getItemGroupOid() {
    return this.props.itemGroupOid != null ? this.props.itemGroupOid : this.valueIsNullString;
  }

  getItemGroupRepeatKey() {
    return this.props.itemGroupRepeatKey != null ? this.props.itemGroupRepeatKey : this.valueIsNullString;
  }

  getStudyInstanceItemOid() {
    return this.props.studyInstanceItemOid != null ? this.props.studyInstanceItemOid : this.valueIsNullString;
  }

  getItemLabel() {
    return this.props.itemLabel != null ? this.props.itemLabel : this.valueIsNullString;
  }

  getSubjectYoB() {
    return this.props.yob != null ? this.props.yob : this.valueIsNullString;
  }

  /**
   * Render the component
   */
  render = () => {
    const StyledDivNameComponent = styledComponents.div`{ 
            width: 100px 
        }`;
    const StyledDivValueComponent = styledComponents.div`{
             min-width: 150px 
            }`;

    return (
      <div>
        <Card title="DICOM Upload Slot">
          <div className="flex flex-wrap card-container text-sm">
            {this.props.studyIdentifier != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">Study:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>{this.getStudyName()}</StyledDivValueComponent>
              </div>
            ) : null}

            {this.props.siteIdentifier != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">Site:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>{this.props.siteIdentifier}</StyledDivValueComponent>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap card-container text-sm">
            {this.props.subjectId != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">SSID:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>{this.props.subjectId}</StyledDivValueComponent>
              </div>
            ) : null}

            {this.props.pid != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">PID:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>{this.props.pid}</StyledDivValueComponent>
              </div>
            ) : null}

            {this.props.gender != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">Subject Sex:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>{this.props.gender}</StyledDivValueComponent>
              </div>
            ) : null}

            {this.props.dob != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">Subject DOB:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>
                  {convertOCDateStringToLocaleString(this.props.dob, this.props.language)}
                </StyledDivValueComponent>
              </div>
            ) : null}

            {this.props.dob == null && this.props.yob != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">Subject YOB:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>{this.getSubjectYoB()}</StyledDivValueComponent>
              </div>
            ) : null}
          </div>

          <div className="mr-2 flex flex-wrap card-container text-sm">
            {this.props.eventName != null && this.props.eventRepeatKey != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">Study Event:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>
                  {this.props.eventName} ({this.props.eventRepeatKey})
                </StyledDivValueComponent>
              </div>
            ) : null}

            {this.props.eventStartDate != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">Start Date:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>
                  {convertOCDateStringToLocaleString(this.props.eventStartDate, this.props.language)}
                </StyledDivValueComponent>
              </div>
            ) : null}

            {this.props.eventEndDate != null ? (
              <div className="flex mr-2">
                <StyledDivNameComponent className="font-bold">End Date:&nbsp;</StyledDivNameComponent>
                <StyledDivValueComponent>
                  {convertOCDateStringToLocaleString(this.props.eventEndDate, this.props.language)}
                </StyledDivValueComponent>
              </div>
            ) : null}

            <div className="flex mr-2">
              <StyledDivNameComponent className="font-bold">Item Label:&nbsp;</StyledDivNameComponent>
              <StyledDivValueComponent>{this.getItemLabel()}</StyledDivValueComponent>
            </div>
          </div>
        </Card>
      </div>
    );
  };
}

export default SlotPanel;
