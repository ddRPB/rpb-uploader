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

import DicomGenderEnum from "../../constants/dicomValueEnums/DicomGenderEnum";
import LogLevels from "../../constants/LogLevels";
import SanityCheckCategory from "../../constants/sanityCheck/SanityCheckCategory";
import SanityCheckResult from "../../constants/sanityCheck/SanityCheckResult";
import SanityCheckSeverity from "../../constants/sanityCheck/SanityCheckSeverity";
import SanityCheckTypes from "../../constants/sanityCheck/SanityCheckTypes";
import { convertDicomDateStringToYear, convertToDicomDateFormatedString } from "../DateParser";
import Logger from "../logging/Logger";
import EvaluationResultItem from "./EvaluationResultItem";

/**
 * The SanityCheckHelper perform some verifications on the DICOM data that will be selected from the user in the UI.
 * Selecting a DICOM study (first step in the UI) triggers the creation of a new Instance that checks on study level.
 * Selecting DICOM series that belong to the study triggers the updateWithSeriesAnalysis function that then verifies against the
 * specific series and updates the analysis results.
 */
export default class SanityCheckHelper {
    studyEvaluationResults;
    seriesEvaluationResults;
    uploadSlotEvaluationResults;


    constructor(studyObject, uploadSlotDefinition, sanityCheckConfiguration, log = new Logger(LogLevels.FATAL)) {
        this.studyObject = studyObject;
        this.uploadSlotDefinition = uploadSlotDefinition;
        this.sanityCheckConfiguration = sanityCheckConfiguration;
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

        this.evaluatePatientIdConsistency(this.studyObject.patientID, this.studyEvaluationResults);

        this.evaluatePatientBirthDateConsistency(this.studyObject.patientBirthDate, this.studyEvaluationResults);

        this.evaluatePatientGenderConsistency(this.studyObject.patientSex, this.studyEvaluationResults);

        this.evaluatePatientNameConsistency(this.studyObject.patientName, this.studyEvaluationResults);

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
            // this.evaluateUploadSlotGender();
            this.evaluatePatientGenderMatchesUploadSlot(this.studyObject.patientSex, this.uploadSlotEvaluationResults);
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
            const studySubjectDobSet = this.studyObject.patientBirthDate;
            this.evaluatePatientBirthDateMatchesUploadSlot(studySubjectDobSet, this.uploadSlotEvaluationResults);
            // this.evaluateUploadSlotDoB();
        }

        if (this.uploadSlotDefinition.yob === null) {
            this.log.info(
                `Year of Birth is not defined in upload slot`,
                {},
                {
                    studyInstanceUID: this.studyObject.studyInstanceUID,
                    category: SanityCheckCategory.uploadSlot,
                    result: SanityCheckResult.NOT_DEFINED_IN_UPLOADSLOT,
                }
            );
        } else {
            this.evaluateUploadSlotYoB();
        }


    }

    evaluateUploadSlotYoB() {
        const replacementYear = ['1900'];
        const uploadSlotYoB = this.uploadSlotDefinition.yob;
        const studySubjectDoBArray = [...this.studyObject.patientBirthDate];

        const studySubjectYobSet = studySubjectDoBArray.map(
            (item) => {
                if (item != "") {
                    return convertDicomDateStringToYear(item);
                }
            });

        if (replacementYear.includes(uploadSlotYoB)) {
            // is replacement
            this.log.info(
                `Year of birth upload slot parameter is a replacement date and cannot be used for sanity check`,
                {},
                {
                    studyInstanceUID: this.studyObject.studyInstanceUID,
                    category: SanityCheckCategory.uploadSlot,
                    result: SanityCheckResult.REPLACEMENT,
                }
            );
            return;
        }

        if (this.studyObject.patientBirthDate.size === 1 && this.studyObject.patientBirthDate.has("")) {
            this.log.info(
                `Date of birth is not defined in study property`,
                {},
                {
                    studyInstanceUID: this.studyObject.studyInstanceUID,
                    category: SanityCheckCategory.uploadSlot,
                    result: SanityCheckResult.NOT_DEFINED_IN_STUDYPROPERTY,
                }
            );
            return;
        }

        if (this.studyObject.patientBirthDate.size === 1) {
            const studyYob = convertDicomDateStringToYear(Array.from(this.studyObject.patientBirthDate)[0]);
            if (replacementYear.includes(studyYob)) {
                // is replacement
                this.log.info(
                    `Study year of birth a replacement. It cannot be used for sanity checks`,
                    {},
                    {
                        studyInstanceUID: this.studyObject.studyInstanceUID,
                        category: SanityCheckCategory.uploadSlot,
                        result: SanityCheckResult.REPLACEMENT,
                    });
                return;
            }

            if (studyYob === uploadSlotYoB) {
                this.log.info(
                    `Study year of birth matches upload slot definition`,
                    {},
                    {
                        studyInstanceUID: this.studyObject.studyInstanceUID,
                        category: SanityCheckCategory.uploadSlot,
                        result: SanityCheckResult.MATCHES,
                    });
                return;
            }
        } else {
            if (studySubjectYobSet.includes(uploadSlotYoB)) {
                this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
                    SanityCheckResult.ONE_MATCHES,
                    SanityCheckCategory.uploadSlot,
                    `One of the study birth years matches upload slot definition`,
                    SanityCheckSeverity.WARNING,
                ));
                return;
            }
        }

        this.uploadSlotEvaluationResults.push(new EvaluationResultItem(
            SanityCheckResult.CONFLICT,
            SanityCheckCategory.uploadSlot,
            `Study year of birth property does not match the upload slot definition`,
            SanityCheckSeverity.ERROR,
        ));

        return;
    }

    updateWithSeriesAnalysis(series, sanityCheckConfiguration) {
        this.sanityCheckConfiguration = sanityCheckConfiguration;

        let patientId = new Set();
        let patientBirthDate = new Set();
        let patientSex = new Set();
        let patientName = new Set();

        for (let key of Object.keys(series)) {
            const seriesObject = series[key];
            patientId = new Set([...patientId, ...seriesObject.patientID]);
            patientBirthDate = new Set([...patientBirthDate, ...seriesObject.patientBirthDate]);
            patientSex = new Set([...patientSex, ...seriesObject.patientSex]);
            patientName = new Set([...patientName, ...seriesObject.patientName]);
        }

        const results = [];

        this.evaluatePatientIdConsistency(patientId, results);

        this.evaluatePatientBirthDateConsistency(patientBirthDate, results);

        this.evaluatePatientGenderConsistency(patientSex, results);

        this.evaluatePatientNameConsistency(patientName, results);

        this.evaluatePatientGenderMatchesUploadSlot(patientSex, results);

        this.evaluatePatientBirthDateMatchesUploadSlot(patientBirthDate, results);

        return results;

    }

    evaluatePatientNameConsistency(patientName, results) {
        if (patientName.size > 1) {
            results.push(new EvaluationResultItem(
                SanityCheckResult.INCONSISTENT,
                SanityCheckTypes.PATIENT_NAME_IS_CONSISTENT,
                `Patient name is inconsistent: ${[...patientName].join(' / ')}`,
                SanityCheckSeverity.WARNING
            ));
        }
    }

    evaluatePatientGenderConsistency(patientSex, results) {
        if (patientSex.size > 1) {
            results.push(new EvaluationResultItem(
                SanityCheckResult.INCONSISTENT,
                SanityCheckTypes.PATIENT_GENDER_IS_CONSISTENT,
                `Patient gender is inconsistent: ${[...patientSex].join(' / ')}`,
                SanityCheckSeverity.WARNING
            ));
        }
    }

    evaluatePatientBirthDateConsistency(patientBirthDate, results) {
        if (patientBirthDate.size > 1) {
            results.push(new EvaluationResultItem(
                SanityCheckResult.INCONSISTENT,
                SanityCheckTypes.PATIENT_BIRTH_DATE_IS_CONSISTENT,
                `Patient birth date is inconsistent: ${[...patientBirthDate].join(' / ')}`,
                SanityCheckSeverity.WARNING
            ));
        }
    }

    evaluatePatientIdConsistency(patientId, results) {
        if (patientId.size > 1) {
            results.push(new EvaluationResultItem(
                SanityCheckResult.INCONSISTENT,
                SanityCheckTypes.PATIENT_ID_IS_CONSISTENT,
                `PatientId is inconsistent: ${[...patientId].join(' / ')}`,
                SanityCheckSeverity.WARNING
            ));
        }
    }

    evaluatePatientGenderMatchesUploadSlot(patientSex, results) {

        if (this.uploadSlotDefinition.gender === null) {
            return;
        }

        if (this.uploadSlotDefinition.gender.toString().toUpperCase === DicomGenderEnum.O) {
            // replacement value
            return;
        }


        if (patientSex.size === 1) {

            if (patientSex.has("")) {
                // not defined -> return
                return;
            }

            if (patientSex.has(DicomGenderEnum.O.toString())) {
                // replacement -> return
                return;
            }

            if (patientSex.has(DicomGenderEnum.O.toString().toLowerCase())) {
                // replacement -> return
                return;
            }

            if (patientSex.has(this.uploadSlotDefinition.gender.toString().toUpperCase()) ||
                patientSex.has(this.uploadSlotDefinition.gender.toString().toLowerCase())
            ) {
                // matches -> return
                return;
            }

        } else {
            // gender is already inconsitent
            if (patientSex.has(this.uploadSlotDefinition.gender.toString().toUpperCase()) ||
                patientSex.has(this.uploadSlotDefinition.gender.toString().toLowerCase())
            ) {
                // one parameter matches -> warning
                results.push(new EvaluationResultItem(
                    SanityCheckResult.ONE_MATCHES,
                    SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
                    `Gender is inconsistent and one value matches the upload slot definition. ${[...patientSex].join(' / ')} - ${this.uploadSlotDefinition.gender}`,
                    SanityCheckSeverity.WARNING
                ));
                return;
            }
        }

        // nothing matched - seems there is  a conflict
        results.push(new EvaluationResultItem(
            SanityCheckResult.CONFLICT,
            SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
            `Gender does not match the upload slot definition. ${[...patientSex].join(' / ')} - ${this.uploadSlotDefinition.gender}`,
            SanityCheckSeverity.ERROR,
        ));

    }

    evaluatePatientBirthDateMatchesUploadSlot(birthDate, result) {

        if (this.uploadSlotDefinition.dob === null) {
            return;
        }

        if (this.uploadSlotDefinition.dob === "") {
            return;
        }

        const uploadSlotDoB = this.uploadSlotDefinition.dob;
        const uploadSlotDoBDate = convertToDicomDateFormatedString(uploadSlotDoB);

        if (this.sanityCheckConfiguration.replacementDates != undefined) {
            const replacementDates = this.sanityCheckConfiguration.replacementDates;

            if (replacementDates.includes(uploadSlotDoBDate)) {
                // is replacement
                return;
            }
        }

        if (birthDate.size === 1) {
            const singleBirthdate = [...birthDate][0];

            if (birthDate.has("")) {
                return;
            }

            if (this.sanityCheckConfiguration.replacementDates != undefined) {
                const replacementDates = this.sanityCheckConfiguration.replacementDates;

                if (replacementDates.includes(singleBirthdate)) {
                    // is replacement
                    return;
                }
            }

            if (uploadSlotDoBDate === singleBirthdate) {
                // matches
                return;
            }
        } else {
            // two or more birth dates
            if (birthDate.has(uploadSlotDoBDate)) {
                result.push(
                    new EvaluationResultItem(
                        SanityCheckResult.ONE_MATCHES,
                        SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
                        `One of the birth dates matches upload slot definition`,
                        SanityCheckSeverity.WARNING,
                    )
                );
                return;
            }

        }

        result.push(
            new EvaluationResultItem(
                SanityCheckResult.CONFLICT,
                SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
                `Date of birth property does not match the upload slot definition`,
                SanityCheckSeverity.ERROR,
            )
        );

        return;
    }

    getEvaluationResult() {
        return this.seriesEvaluationResults;
    }
}