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
import { Dialog } from "primereact/dialog";

export default class RedirectDialog extends Component {
  render = () => {
    return (
      <Dialog header={"Redirect"} visible={this.props.redirectDialogPanel} closable={false} maximized={true}>
        You will be redirected to the RPB portal.
      </Dialog>
    );
  };
}
