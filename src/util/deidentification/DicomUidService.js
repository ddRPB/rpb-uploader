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

/**
 * Provides new generated DICOM UIDs
 * generate by a web service of the Portal
 */
export default class DicomUidService {
  constructor(uids, uidServiceUrl, prefix, apiKey) {
    this.uids = uids;
    this.uidServiceUrl = uidServiceUrl;
    this.prefix = prefix;
    this.apiKey = apiKey;

    this.generatedUids = [];
    this.originalUidToPseudomizedUidMap = new Map();
  }

  /**
   * Fetches UIDs from the service.
   */
  async requestUidsFromWebService() {
    const args = {
      headers: {
        "X-Api-Key": this.apiKey,
      },
    };

    let response = await fetch(`${this.uidServiceUrl}/api/v1/pacs/generateuids?count=${this.uids.length}`, args);

    switch (response.status) {
      case 200:
        const jsonResponse = await response.json();
        this.generatedUids = jsonResponse.uidList;
        break;
      default:
        throw Error(
          `Request failed. URL: ${response.url} status: ${response.status} statustext: ${response.statusText}`
        );
    }
  }

  /**
   * Generates a map originalDicomUID -> deIdentifiedDicomUID
   */
  async getUidMap() {
    const errors = [];

    // check if it is the first run or the request has been made already
    if (this.originalUidToPseudomizedUidMap.size === 0) {
      try {
        await this.requestUidsFromWebService();
      } catch (e) {
        errors.push({
          message: "There was a problem with the UID request",
          data: { error: e },
        });
      }
      if (this.uids.length <= this.generatedUids.length) {
        for (let i = 0; i < this.uids.length; i++) {
          this.originalUidToPseudomizedUidMap.set(this.uids[i], this.generatedUids[i]);
        }
      } else {
        error.push({
          message: `The service did not provide a sufficient count of UIDs (needed: ${this.uids.length} - provided: ${this.generatedUids.length})`,
        });
      }
    }

    return {
      dicomUidReplacements: this.originalUidToPseudomizedUidMap,
      errors,
    };
  }
}
