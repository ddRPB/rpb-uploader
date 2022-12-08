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
 * The DicomUploadDictionary model aggregates studies, based on the provided files.
 */
export default class DicomUploadDictionary {

    data = {}

    /**
     * Add specified DICOM study to the upload dictionary
     * @param {DicomStudy} studyObject
     */
    addStudy(studyObject) {
        if (!this.studyExists(studyObject.studyInstanceUID)) {
            this.data[studyObject.studyInstanceUID] = studyObject;
            return studyObject;
        } else {
            return this.data[studyObject.studyInstanceUID];
        }
    }

    /**
     * Get DICOM study with specified study instance UID from upload dictionary
     * @param {String} studyInstanceUID
     */
    getStudy(studyInstanceUID) {
        return this.data[studyInstanceUID]
    }

    /**
     * Check if DICOM study with specified study instance UID is present in the upload dictionary
     * @param {String} studyInstanceUID
     */
    studyExists(studyInstanceUID) {
        return Object.keys(this.data).includes(studyInstanceUID)
    }

    /**
     * Get list of all DICOM studies from upload dictionary
     */
    getStudies() {
        return Object.values(this.data)
    }

}