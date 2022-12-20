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

import LogLevels from "../../constants/LogLevels";
import SanityCheckCategory from "../../constants/sanityCheck/SanityCheckCategory";
import SanityCheckResult from "../../constants/sanityCheck/SanityCheckResult";
import SanityCheckSeverity from "../../constants/sanityCheck/SanityCheckSeverity";
import Logger from "../logging/Logger";
import EvaluationResultItem from "./EvaluationResultItem";

export default class DicomStudyAnalyser {
    studyEvaluationResults;
    seriesEvaluationResults;
    uploadSlotEvaluationResults;


    constructor(studyObject, uploadSlotDefinition, log = new Logger(LogLevels.FATAL)) {
        this.studyObject = studyObject;
        this.uploadSlotDefinition = uploadSlotDefinition;
        this.log = log;

        this.studyEvaluationResults = [];
        this.seriesEvaluationResults = [];
        this.uploadSlotEvaluationResults = [];

        if (this.studyObject != null) {
            this.log.trace(
                "Start sanity checks for selected study.",
                {},
                { studyInstanceUID: this.studyObject.studyInstanceUID }
            );
            this.evaluateStudyFilePropertiesAreConsistent();
        }

        if (this.studyObject != null && this.uploadSlotDefinition != null) {
            this.log.trace(
                "Start sanity checks for selected study in relation to the upload slot.",
                {},
                {
                    studyInstanceUID: this.studyObject.studyInstanceUID,
                    uploadSlotDefinition: Object.entries(this.uploadSlotDefinition),
                }
            );
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
                SanityCheckCategory.study,
                `The files of that study have inconsistent study dates - ${[...this.studyObject.studyDate].join(' / ')}`,
                SanityCheckSeverity.WARNING,
            ));
        }

        if (this.studyObject.studyDescription.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategory.study,
                `The files of that study have inconsistent study description - ${[...this.studyObject.studyDescription].join(' / ')}`,
                SanityCheckSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientID.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategory.study,
                `The files of that study have inconsistent PatientID - ${[...this.studyObject.patientID].join(' / ')}`,
                SanityCheckSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientBirthDate.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategory.study,
                `The files of that study have inconsistent patient birthdate - ${[...this.studyObject.patientBirthDate].join(' / ')}`,
                SanityCheckSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientSex.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategory.study,
                `The files of that study have inconsistent patient sex - ${[...this.studyObject.patientSex].join(' / ')}`,
                SanityCheckSeverity.WARNING,
            ));
        }

        if (this.studyObject.patientName.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                SanityCheckCategory.study,
                `The files of that study have inconsistent patient name - ${[...this.studyObject.patientName].join(' / ')}`,
                SanityCheckSeverity.WARNING,
            ));
        }
    }

    evaluateUploadSlotdefinition() {
        if (this.uploadSlotDefinition.gender === null) {
            this.log.info(
                `Gender is not defined in upload slot`,
                {},
                {
                    studyInstanceUID: this.studyObject.studyInstanceUID,
                    category: SanityCheckCategory.uploadSlot,
                    result: SanityCheckResult.NOT_DEFINED_IN_UPLOADSLOT,
                }
            );

        } else {
            this.evaluateUploadSlotGender();
        }

        if (this.uploadSlotDefinition.dob === null) {
            this.log.info(
                `Date of Birth is not defined in upload slot`,
                {},
                {
                    studyInstanceUID: this.studyObject.studyInstanceUID,
                    category: SanityCheckCategory.uploadSlot,
                    result: SanityCheckResult.NOT_DEFINED_IN_UPLOADSLOT,
                }
            );
        } else {
            this.evaluateUploadSlotDoB();
        }


    }

    evaluateUploadSlotGender() {
        if (this.studyObject.patientSex.size === 1 && this.studyObject.patientSex.has("")) {
            this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
                SanityCheckResult.NOT_DEFINED_IN_STUDYPROPERTY,
                SanityCheckCategory.uploadSlot,
                `patientSex is not defined in study property`,
                SanityCheckSeverity.WARNING,
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
                this.log.trace(
                    `Study property gender matches the upload slot definition`,
                    {},
                    {
                        studyInstanceUID: this.studyObject.studyInstanceUID,
                        category: SanityCheckCategory.uploadSlot,
                        result: SanityCheckResult.MATCHES,
                    }
                );
                return;
            } else {
                this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
                    SanityCheckResult.ONE_MATCHES,
                    SanityCheckCategory.uploadSlot,
                    `One gender property matches the upload slot definition`,
                    SanityCheckSeverity.WARNING,
                ));
                return;
            }

        }

        this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
            SanityCheckResult.CONFLICT,
            SanityCheckCategory.uploadSlot,
            `Gender property does not match the upload slot definition`,
            SanityCheckSeverity.ERROR,
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