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
export default class DicomUploadChunk {


    constructor(studyUid, seriesUid) {
        this.originalStudyUid = studyUid;
        this.originalSeriesUid = seriesUid;
        this.deIdentifiedStudyUid = "";
        this.deIdentifiedSeriesUid = "";
        this.originalSoapInstanceUids = [];

        this.originalFileNames = [];

        this.deIdentified = false;
        this.transfered = false;
        this.uploadVerified = false;

        this.originalInstances = [];
        this.deidentifiedInstances = [];
        this.mimeMessage = null;
        this.messages = [];

    }


    setDeIdentifiedStudyUid(studyUid) {
        this.deIdentifiedStudyUid = studyUid;
    }

    setDeIdentifiedSeriesUid(seriesUid) {
        this.deIdentifiedSeriesUid = seriesUid;
    }

    addInstance(sopInstanceUid, fileObject) {
        this.originalInstances.push({
            sopInstanceUid: sopInstanceUid,
            fileObject: fileObject
        })
    }

    getCount() {
        return this.originalInstances.length;
    }

    getFileNames() {
        return this.originalInstances.map((fileObject) => fileObject.fileObject.fileObject.name);
    }

    getFilePaths() {
        return this.originalInstances.map((fileObject) => fileObject.fileObject.fileObject.path);
    }

    getSoapInstanceUids() {
        return this.originalInstances.map((fileObject) => fileObject.sopInstanceUid);
    }

    cleanupAfterTransfer() {
        this.originalInstances = [];
    }
}