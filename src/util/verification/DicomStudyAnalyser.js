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

import SanityCheckCategories from "../../constants/sanityCheck/SanityCheckCategory";
import SanityCheckResults from "../../constants/sanityCheck/SanityCheckResult";
import SanityChecksSeverity from "../../constants/sanityCheck/SanityCheckSeverity";
import EvaluationResultItem from "./EvaluationResultItem";

export default class DicomStudyAnalyser {
    studyEvaluationResults;
    seriesEvaluationResults;
    uploadSlotEvaluationResults;


    constructor(studyObject, uploadSlotDefinition) {
        this.studyObject = studyObject;
        this.uploadSlotDefinition = uploadSlotDefinition;

        this.studyEvaluationResults = [];
        this.seriesEvaluationResults = [];
        this.uploadSlotEvaluationResults = [];

        if (this.studyObject != null) {
            this.evaluateStudyFilePropertiesAreConsistent();
        }

        if (this.studyObject != null && this.uploadSlotDefinition != null) {
            this.evaluateUploadSlotdefinition();
        }
    }

    getStudyEvaluationResults() {
        return this.studyEvaluationResults;
    }

    getUploadSlotEvaluationResults() {
        return this.uploadSlotEvaluationResults;
    }

    getStudyAndUploadSlotEvaluationResults() {
        const result = [];
        result.push(... this.studyEvaluationResults);
        result.push(...this.uploadSlotEvaluationResults);
        return result;
    }

    evaluateStudyFilePropertiesAreConsistent() {

        if (this.studyObject.studyDate.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategories.study,
                `The files of that study have inconsistent study dates - ${[...this.studyObject.studyDate].join(' / ')}`,
                SanityChecksSeverity.WARNING,
            ));
        }

        if (this.studyObject.studyDescription.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategories.study,
                `The files of that study have inconsistent study description - ${[...this.studyObject.studyDescription].join(' / ')}`,
                SanityChecksSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientID.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategories.study,
                `The files of that study have inconsistent PatientID - ${[...this.studyObject.patientID].join(' / ')}`,
                SanityChecksSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientBirthDate.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategories.study,
                `The files of that study have inconsistent patient birthdate - ${[...this.studyObject.patientBirthDate].join(' / ')}`,
                SanityChecksSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientSex.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategories.study,
                `The files of that study have inconsistent patient sex - ${[...this.studyObject.patientSex].join(' / ')}`,
                SanityChecksSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientName.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategories.study,
                `The files of that study have inconsistent patient name - ${[...this.studyObject.patientName].join(' / ')}`,
                SanityChecksSeverity.WARNING,
            ));
        }
    }

    evaluateUploadSlotdefinition() {
        if (this.uploadSlotDefinition.gender === null) {
            // this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
            //     SanityCheckResults.NOT_DEFINED_IN_UPLOADSLOT,
            //     SanityCheckCategories.uploadSlot,
            //     `Gender is not defined in upload slot`,
            //     SanityChecksSeverity.INFO,
            // ));


        } else {
            this.evaluateUploadSlotGender();
        }

        if (this.uploadSlotDefinition.dob === null) {
            // dob is not defined in upload slot
        } else {
            this.evaluateUploadSlotDoB();
        }


    }

    evaluateUploadSlotGender() {
        if (this.studyObject.patientSex.size === 1 && this.studyObject.patientSex.has("")) {
            this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
                SanityCheckResults.NOT_DEFINED_IN_STUDYPROPERTY,
                SanityCheckCategories.uploadSlot,
                `patientSex is not defined in study property`,
                SanityChecksSeverity.WARNING,
            ));
            return;
        }

        if (this.studyObject.patientSex.has(
            this.uploadSlotDefinition.gender.toString().toUpperCase()
        ) || this.studyObject.patientSex.has(
            this.uploadSlotDefinition.gender.toString().toLowerCase()
        )
        ) {
            if (this.studyObject.patientSex.size === 1) {
                // this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
                //     SanityCheckResults.MATCHES,
                //     SanityCheckCategories.uploadSlot,
                //     `Study property gender matches the upload slot definition`,
                //     SanityChecksSeverity.INFO,
                // ));
                return;
            } else {
                this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
                    SanityCheckResults.ONE_MATCHES,
                    SanityCheckCategories.uploadSlot,
                    `One gender property matches the upload slot definition`,
                    SanityChecksSeverity.WARNING,
                ));
                return;
            }

        }

        this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
            SanityCheckResults.CONFLICT,
            SanityCheckCategories.uploadSlot,
            `Gender property does not match the upload slot definition`,
            SanityChecksSeverity.ERROR,
        ));

    }

    evaluateUploadSlotDoB() {
        const replacementDates = ['19000101'];
        const uploadSlotDoB = this.uploadSlotDefinition.dob;
        const studySubjectDobSet = this.studyObject.patientBirthDate;

        if (replacementDates.includes(this.uploadSlotDefinition.dob)) {
            // is replacement
            return;
        }

        if (this.studyObject.patientBirthDate.size === 1) {
            const studyDob = Array.from(this.studyObject.patientBirthDate)[0];
        }

        // for(let replacementDate of replacementDates){
        //     if()
        // }





    }

    updateWithSeriesAnalysis(series) {
        for (let key of Object.keys(series)) {
            console.log(key);
        }

        const result = [];
        result.push(...this.getStudyAndUploadSlotEvaluationResults());
        result.push(...this.seriesEvaluationResults);
        return result;

    }

    getEvaluationResult() {
        return this.seriesEvaluationResults;
    }
}