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

import DicomStudyVerificationMessages, { GENDER_IS_NOT_DEFINED, GENDER_IS_NOT_VALID } from "../constants/DicomStudyVerificationMessages";
import { parseDicomFormattedDates, parseOcFormattedDates } from "./DateParser";

export default class DicomStudyUploadSlotVerifier {

    constructor(dicomStudy, dicomUploadSlot) {
        this.dicomStudy = dicomStudy;
        dicomUploadSlot != null ? this.dicomUploadSlot = dicomUploadSlot : this.dicomUploadSlot = {};
        this.result = { errors: [], warnings: [] };

        this.femaleEquivalents = ['f', 'female']
        this.maleEquivalents = ['m', 'male']
    }

    getVerificationResult() {
        this.result.errors = [];
        this.result.warnings = [];

        if (this.dicomStudy.studyInstanceUID === null) {
            this.result.errors.push(DicomStudyVerificationMessages.StudyInstanceUID_IS_MISSING)
        } else {
            if (this.dicomStudy.studyInstanceUID === "") this.result.errors.push(DicomStudyVerificationMessages.StudyInstanceUID_IS_EMPTY);
        };

        if ('subjectSex' in this.dicomUploadSlot) {
            const uploadSlotGender = this.dicomUploadSlot.subjectSex.toUpperCase();
            const studyPatientSex = this.dicomStudy.getPatientSex().toUpperCase();

            if (!(uploadSlotGender === 'F' || uploadSlotGender === 'M')) { this.result.errors.push(`${this.dicomUploadSlot.subjectSex} ` + GENDER_IS_NOT_VALID) }
            if (studyPatientSex === '') { this.result.errors.push(GENDER_IS_NOT_DEFINED) }
            else {
                if (uploadSlotGender != studyPatientSex) {
                    this.result.errors.push(`Upload slot gender "${this.dicomUploadSlot.subjectSex}" is not equal to "${this.dicomStudy.getPatientSex()}"`);
                }
            }

        };

        if ('subjectDOB' in this.dicomUploadSlot) {
            let slotDob = null;
            let fileDob = null;

            try {
                slotDob = parseOcFormattedDates(this.dicomUploadSlot.subjectDOB);
            } catch (e) {
                this.result.errors.push('Parsing DicomSlot date of birth failed: ' + e);
            }

            try {
                fileDob = parseDicomFormattedDates(this.dicomStudy.getPatientBirthDate());
            } catch (e) {
                this.result.errors.push('Parsing the date of birth from Dicom file failed: ' + e);
            }

            // if (this.dicomStudy.getPatientBirthDate() === "") {
            //     this.result.errors.push('The birth date in the Dicom study file is empty.')
            // } else {
            //     const parsedFileDob = new Date(this.dicomStudy.getPatientBirthDate());
            //     if (parsedFileDob == 'Invalid Date') {
            //         this.result.errors.push(`The birth date in the dicom file is not valid. Patient birth date is: ${this.dicomStudy.getPatientBirthDate()}`);
            //     } else { fileDob = parsedFileDob; }

            // }



            //TODO: verify dob
            // How to deal with "ONLY_YEAR configuration ?" 
        }

        if ('slotName' in this.dicomUploadSlot) {
            // Verify slotname with study.getStudyType ?
        }

        // this.result.errors.push('Dummy error 1');
        // this.result.errors.push('Dummy error 2');

        // this.result.warnings.push('Dummy warning 1');
        // this.result.warnings.push('Dummy warning 2');


        return this.result;

    }
}