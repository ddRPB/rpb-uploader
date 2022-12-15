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

import EvaluationResultItem from "./EvaluationResultItem";
import sanityCheckCategories from "../../constants/sanitityChecks/sanityCheckCategories";

export default class DicomStudyAnalyser {
    studyEvaluationResults;
    seriesEvaluationResults;


    constructor(studyObject, uploadSlotDefinition) {
        new EvaluationResultItem
        this.studyObject = studyObject;
        this.uploadSlotDefinition = uploadSlotDefinition;

        this.studyEvaluationResults = [];
        this.seriesEvaluationResults = [];

        if (this.studyObject != null) {
            this.evaluateStudyFilePropertiesAreConsistent();
        }
    }

    evaluateStudyFilePropertiesAreConsistent() {

        if (this.studyObject.studyDate.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                sanityCheckCategories.study,
                `The files of that study have inconsistent study dates - ${[...this.studyObject.studyDate].join(' / ')}`,
                'Warning'
            ));
        }

        if (this.studyObject.studyDescription.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                sanityCheckCategories.study,
                `The files of that study have inconsistent study description - ${[...this.studyObject.studyDescription].join(' / ')}`,
                'Warning'
            ));
        }

        if (this.studyObject.patientID.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                sanityCheckCategories.study,
                `The files of that study have inconsistent PatientID - ${[...this.studyObject.patientID].join(' / ')}`,
                'Warning'
            ));
        }

        if (this.studyObject.patientBirthDate.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                sanityCheckCategories.study,
                `The files of that study have inconsistent patient birthdate - ${[...this.studyObject.patientBirthDate].join(' / ')}`,
                'Warning'
            ));
        }

        if (this.studyObject.patientSex.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                sanityCheckCategories.study,
                `The files of that study have inconsistent patient sex - ${[...this.studyObject.patientSex].join(' / ')}`,
                'Warning'
            ));
        }

        if (this.studyObject.patientName.size > 1) {
            this.studyEvaluationResults.push(new EvaluationResultItem(
                'DicomStudy file properties inconsistent',
                sanityCheckCategories.study,
                `The files of that study have inconsistent patient name - ${[...this.studyObject.patientName].join(' / ')}`,
                'Warning'
            ));
        }
    }

    getStudyEvaluationResult() {
        return this.studyEvaluationResults;
    }

    updateWithSeriesAnalysis(series) {
        this.seriesEvaluationResults = [];
        this.studyEvaluationResults.push(...this.seriesEvaluationResults);
        return this.studyEvaluationResults

    }

    getEvaluationResult() {
        return this.seriesEvaluationResults;
    }
}