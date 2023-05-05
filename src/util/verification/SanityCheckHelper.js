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
  uploadSlotEvaluationResults;

  constructor(studyObject, uploadSlotDefinition, sanityCheckConfiguration, log = new Logger(LogLevels.FATAL)) {
    this.studyObject = studyObject;
    this.uploadSlotDefinition = uploadSlotDefinition;
    this.sanityCheckConfiguration = {
      ...this.createDefaultSanityCheckConfiguration(),
      ...sanityCheckConfiguration,
    };
    this.log = log;

    this.studyEvaluationResults = [];
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

  /**
   * Creates a sanity check configuration to ensure that all necessary properties constist a value:
   *      */
  createDefaultSanityCheckConfiguration() {
    return {
      replacementDates: ["19000101"],
      replacementGenderValues: [DicomGenderEnum.O],
      [SanityCheckTypes.STUDY_DATE_IS_CONSISTENT]: true,
      [SanityCheckTypes.STUDY_DESCRIPTION_IS_CONSISTENT]: true,
      [SanityCheckTypes.PATIENT_ID_IS_CONSISTENT]: true,
      [SanityCheckTypes.PATIENT_BIRTH_DATE_IS_CONSISTENT]: true,
      [SanityCheckTypes.PATIENT_GENDER_IS_CONSISTENT]: true,
      [SanityCheckTypes.PATIENT_NAME_IS_CONSISTENT]: true,
      [SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT]: true,
      [SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT]: true,
      [SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT]: true,
    };
  }

  /**
   * Returns the evaluation results for the study properties
   */
  getStudyEvaluationResults() {
    return this.studyEvaluationResults;
  }

  /**
   * Returns the evaluation results for the study properties in relation to the upload slot parameter
   */
  getUploadSlotEvaluationResults() {
    return this.uploadSlotEvaluationResults;
  }

  /**
   * Returns the combined evaluation of the study properties and upload slot parameters
   */
  getStudyAndUploadSlotEvaluationResults() {
    const result = [];
    result.push(...this.studyEvaluationResults);
    result.push(...this.uploadSlotEvaluationResults);
    return result;
  }

  /***
   * Verifies if specific study properties are consistent in all files
   */
  evaluateStudyFilePropertiesAreConsistent() {
    if (
      this.studyObject.studyDate.size > 1 &&
      this.sanityCheckConfiguration[[SanityCheckTypes.STUDY_DATE_IS_CONSISTENT]] === true
    ) {
      this.studyEvaluationResults.push(
        new EvaluationResultItem(
          "DicomStudy file properties inconsistent",
          SanityCheckTypes.STUDY_DATE_IS_CONSISTENT,
          `The files of that study have inconsistent study dates - ${[...this.studyObject.studyDate].join(" / ")}`,
          SanityCheckSeverity.WARNING
        )
      );
    }

    if (
      this.studyObject.studyDescription.size > 1 &&
      this.sanityCheckConfiguration[[SanityCheckTypes.STUDY_DESCRIPTION_IS_CONSISTENT]] === true
    ) {
      this.studyEvaluationResults.push(
        new EvaluationResultItem(
          "DicomStudy file properties inconsistent",
          SanityCheckTypes.STUDY_DESCRIPTION_IS_CONSISTENT,
          `The files of that study have inconsistent study description - ${[...this.studyObject.studyDescription].join(
            " / "
          )}`,
          SanityCheckSeverity.WARNING
        )
      );
    }

    this.evaluatePatientIdConsistency(this.studyObject.patientID, this.studyEvaluationResults);
    this.evaluatePatientBirthDateConsistency(this.studyObject.patientBirthDate, this.studyEvaluationResults);
    this.evaluatePatientGenderConsistency(this.studyObject.patientSex, this.studyEvaluationResults);
    this.evaluatePatientNameConsistency(this.studyObject.patientName, this.studyEvaluationResults);
  }

  /**
   * The upload slot definition describes specific requirements, for instance: the gender of the patient.
   * This function evaluates the study properties, based on that criteria.
   */
  evaluateUploadSlotdefinition() {
    if (this.uploadSlotDefinition.gender === null) {
      this.log.info(
        `Gender is not defined in upload slot`,
        {},
        {
          studyInstanceUID: this.studyObject.studyInstanceUID,
          category: SanityCheckTypes.PATIENT_GENDER_IS_CONSISTENT,
          result: SanityCheckResult.NOT_DEFINED_IN_UPLOADSLOT,
        }
      );
    } else {
      this.evaluatePatientGenderMatchesUploadSlot(this.studyObject.patientSex, this.uploadSlotEvaluationResults);
    }

    if (this.uploadSlotDefinition.dob === null) {
      this.log.info(
        `Date of Birth is not defined in upload slot`,
        {},
        {
          studyInstanceUID: this.studyObject.studyInstanceUID,
          category: SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
          result: SanityCheckResult.NOT_DEFINED_IN_UPLOADSLOT,
        }
      );
    } else {
      const studySubjectDobSet = this.studyObject.patientBirthDate;
      this.evaluatePatientBirthDateMatchesUploadSlot(studySubjectDobSet, this.uploadSlotEvaluationResults);
    }

    if (this.uploadSlotDefinition.yob === null) {
      this.log.info(
        `Year of Birth is not defined in upload slot`,
        {},
        {
          studyInstanceUID: this.studyObject.studyInstanceUID,
          category: SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT,
          result: SanityCheckResult.NOT_DEFINED_IN_UPLOADSLOT,
        }
      );
    } else {
      const studySubjectDobSet = this.studyObject.patientBirthDate;
      this.evaluatePatientBirthYearMatchesUploadSlot(studySubjectDobSet, this.uploadSlotEvaluationResults);
    }
  }

  /**
   * The first analysis after creating the instance is based on the selected DICOM study.
   * This function allows to update the results, based on the selected series and the current sanity check configuration.
   */
  updateWithSeriesAnalysis(series, sanityCheckConfiguration) {
    this.sanityCheckConfiguration = {
      ...this.createDefaultSanityCheckConfiguration(),
      ...sanityCheckConfiguration,
    };

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
    this.evaluatePatientBirthYearMatchesUploadSlot(patientBirthDate, results);

    return results;
  }

  evaluatePatientNameConsistency(patientName, results) {
    if (this.sanityCheckConfiguration[[SanityCheckTypes.PATIENT_NAME_IS_CONSISTENT]] != true) {
      return;
    }

    if (patientName.size > 1) {
      results.push(
        new EvaluationResultItem(
          SanityCheckResult.INCONSISTENT,
          SanityCheckTypes.PATIENT_NAME_IS_CONSISTENT,
          `Patient name is inconsistent: ${[...patientName].join(" / ")}`,
          SanityCheckSeverity.WARNING
        )
      );
    }
  }

  evaluatePatientGenderConsistency(patientSex, results) {
    if (this.sanityCheckConfiguration[[SanityCheckTypes.PATIENT_GENDER_IS_CONSISTENT]] != true) {
      return;
    }

    if (patientSex.size > 1 && this.sanityCheckConfiguration["PATIENT_GENDER_IS_CONSISTENT"] === true) {
      results.push(
        new EvaluationResultItem(
          SanityCheckResult.INCONSISTENT,
          SanityCheckTypes.PATIENT_GENDER_IS_CONSISTENT,
          `Patient gender is inconsistent: ${[...patientSex].join(" / ")}`,
          SanityCheckSeverity.WARNING
        )
      );
    }
  }

  evaluatePatientBirthDateConsistency(patientBirthDate, results) {
    if (this.sanityCheckConfiguration[[SanityCheckTypes.PATIENT_BIRTH_DATE_IS_CONSISTENT]] != true) {
      return;
    }

    if (patientBirthDate.size > 1) {
      results.push(
        new EvaluationResultItem(
          SanityCheckResult.INCONSISTENT,
          SanityCheckTypes.PATIENT_BIRTH_DATE_IS_CONSISTENT,
          `Patient birth date is inconsistent: ${[...patientBirthDate].join(" / ")}`,
          SanityCheckSeverity.WARNING
        )
      );
    }
  }

  evaluatePatientIdConsistency(patientId, results) {
    if (this.sanityCheckConfiguration[[SanityCheckTypes.PATIENT_ID_IS_CONSISTENT]] != true) {
      return;
    }

    if (patientId.size > 1) {
      results.push(
        new EvaluationResultItem(
          SanityCheckResult.INCONSISTENT,
          SanityCheckTypes.PATIENT_ID_IS_CONSISTENT,
          `PatientId is inconsistent: ${[...patientId].join(" / ")}`,
          SanityCheckSeverity.WARNING
        )
      );
    }
  }

  evaluatePatientGenderMatchesUploadSlot(patientSex, results) {
    if (this.sanityCheckConfiguration["PATIENT_GENDER_MATCHES_UPLOADSLOT"] != true) {
      return;
    }

    if (this.uploadSlotDefinition.gender === null) {
      return;
    }

    if (this.uploadSlotDefinition.gender.toString().toUpperCase === DicomGenderEnum.O) {
      // replacement value
      return;
    }

    if (patientSex.size === 1) {
      // consistent parameter

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

      if (
        patientSex.has(this.uploadSlotDefinition.gender.toString().toUpperCase()) ||
        patientSex.has(this.uploadSlotDefinition.gender.toString().toLowerCase())
      ) {
        // matches -> return
        return;
      }
    } else {
      // gender is inconsitent -> verify if one parameter matches the criteria
      if (
        patientSex.has(this.uploadSlotDefinition.gender.toString().toUpperCase()) ||
        patientSex.has(this.uploadSlotDefinition.gender.toString().toLowerCase())
      ) {
        // one parameter matches -> warning
        results.push(
          new EvaluationResultItem(
            SanityCheckResult.ONE_MATCHES,
            SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
            `Gender is inconsistent and one value matches the upload slot definition. ${[...patientSex].join(
              " / "
            )} - ${this.uploadSlotDefinition.gender}`,
            SanityCheckSeverity.WARNING
          )
        );
        return;
      }
    }

    // nothing matched - seems there is a conflict
    results.push(
      new EvaluationResultItem(
        SanityCheckResult.CONFLICT,
        SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
        `Gender does not match the upload slot definition. ${[...patientSex].join(" / ")} - ${
          this.uploadSlotDefinition.gender
        }`,
        SanityCheckSeverity.ERROR
      )
    );
  }

  evaluatePatientBirthDateMatchesUploadSlot(birthDate, result) {
    if (this.sanityCheckConfiguration[[SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT]] != true) {
      return;
    }

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
      // consistent parameter
      const singleBirthdate = [...birthDate][0];

      if (birthDate.has("")) {
        // not defined -> return
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
            SanityCheckSeverity.WARNING
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
        SanityCheckSeverity.ERROR
      )
    );

    return;
  }

  evaluatePatientBirthYearMatchesUploadSlot(birthDate, result) {
    const uploadSlotYoB = this.uploadSlotDefinition.yob;
    const studySubjectDoBArray = [...birthDate];

    const studySubjectYobArray = studySubjectDoBArray.map((item) => {
      if (item != "") {
        return convertDicomDateStringToYear(item);
      } else {
        return "";
      }
    });

    const replacementDatesArray = [];
    if (this.sanityCheckConfiguration.replacementDates != undefined) {
      replacementDatesArray.push(...this.sanityCheckConfiguration.replacementDates);
    }

    const replacementYears = replacementDatesArray.map((item) => {
      if (item != "") {
        return convertDicomDateStringToYear(item);
      }
    });

    if (this.sanityCheckConfiguration[[SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT]] != true) {
      return;
    }

    if (this.uploadSlotDefinition.yob === null) {
      return;
    }

    if (this.uploadSlotDefinition.yob === "") {
      return;
    }

    if (replacementYears.includes(uploadSlotYoB)) {
      // is replacement
      return;
    }

    if (studySubjectYobArray.length === 1) {
      const singleBirthYear = [...studySubjectYobArray][0];

      if (replacementYears.includes(singleBirthYear)) {
        // is replacement
        return;
      }

      if (uploadSlotYoB === singleBirthYear) {
        // matches
        return;
      }

      if (singleBirthYear === "") {
        return;
      }
    } else {
      // two or more birth dates
      if (studySubjectYobArray.includes(uploadSlotYoB)) {
        result.push(
          new EvaluationResultItem(
            SanityCheckResult.ONE_MATCHES,
            SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT,
            `One of the birth dates matches upload slot definition`,
            SanityCheckSeverity.WARNING
          )
        );
        return;
      }
    }

    result.push(
      new EvaluationResultItem(
        SanityCheckResult.CONFLICT,
        SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT,
        `Year of birth property does not match the upload slot definition`,
        SanityCheckSeverity.ERROR
      )
    );

    return;
  }
}
