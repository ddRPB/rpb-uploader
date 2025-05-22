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

import { file } from "jszip";

/**
 * DicomInstance domain object
 */
export default class DicomInstance {
  constructor(fileObject, fileObjectDetails) {
    this.fileObject = fileObject;
    this.sopInstanceUID = fileObjectDetails.sopInstanceUID;
    this.referencedSopInstanceUids = fileObjectDetails.referencedSopInstanceUids;
    this.description = fileObjectDetails.description;
    this.parsable = fileObjectDetails.parsable;
    this.parsingMessage = fileObjectDetails.parsingMessage;
    this.parsedParameters = fileObjectDetails.parsedParameters;
  }

  getFile() {
    return this.fileObject;
  }
}
