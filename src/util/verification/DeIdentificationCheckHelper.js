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

import DeIdentificationCheckMessages from "../../constants/deIdentificationConfigurationCheck/DeIdentificationCheckMessages";
import DeIdentificationCheckTypes from "../../constants/deIdentificationConfigurationCheck/DeIdentificationCheckTypes";
import DeIdentificationConfigurationCheckResults from "../../constants/deIdentificationConfigurationCheck/DeIdentificationConfigurationCheckResults";
import DeIdentificationProfiles from "../../constants/DeIdentificationProfiles";
import LogLevels from "../../constants/LogLevels";
import SanityCheckSeverity from "../../constants/sanityCheck/SanityCheckSeverity";
import Logger from "../logging/Logger";
import EvaluationResultItem from "./EvaluationResultItem";

/**
 * The De-Identification is a step within the upload process that changes data.
 * Sometimes, the capabilities of the uploader are limited and it is not garanteed that all identifying data is removed from the data set.
 * Another aspect is that some tags will be cleaned up automatically, especially encrypted data that come with the data set.
 * This component helps to detect and classify such cases in order that the user will be notified and agrees with the procedure or risk.
 */
export default class DeIdentificationCheckHelper {
  constructor(config = { deIdentificationProfileOption: [] }, log = new Logger(LogLevels.FATAL)) {
    this.config = config;
    this.log = log;
  }

  /**
   * Evaluates an object with series regarding possible problems or risks of the de-identification process.
   * @param series {object} one or more DicomSeries that will be checked
   * @param deIdentificationCheckConfiguration {object} current configuration what needs to be evaluated
   */
  evaluateSeries(series, deIdentificationCheckConfiguration) {
    const results = [];

    // collecting parameter in sets - because all selected DicomSeries will be handled togehter
    let burnedInAnnotation = new Set();
    let identityRemoved = new Set();
    let hasEncryptedAttributes = false;

    for (let key of Object.keys(series)) {
      const seriesObject = series[key];
      const seriesBurnedInAnnotation = seriesObject.burnedInAnnotation;
      const seriesIdentityRemoved = seriesObject.identityRemoved;
      burnedInAnnotation = new Set([...burnedInAnnotation, ...seriesBurnedInAnnotation]);
      identityRemoved = new Set([...identityRemoved, ...seriesIdentityRemoved]);

      const availableDicomTags = seriesObject.availableDicomTags;
      // true is dominant
      hasEncryptedAttributes = hasEncryptedAttributes || availableDicomTags.get("EncryptedAttributesSequence");
    }

    // start evaluating if configuration parameter is true
    if (deIdentificationCheckConfiguration[DeIdentificationCheckTypes.BURNED_IN_ANNOTATION_IS_YES] === true) {
      this.verifyBurnedInAnnotation(burnedInAnnotation, results);
    }

    if (
      deIdentificationCheckConfiguration[
        DeIdentificationCheckTypes.ENCRYPTED_DATA_CHECK_IF_PATIENT_IDENTITY_REMOVED_IS_YES
      ] === true
    ) {
      this.verifyEncryptedDateInPropertiesIfPatientIdentityWillBeRemoved(
        identityRemoved,
        hasEncryptedAttributes,
        results
      );
    }

    return results;
  }

  verifyBurnedInAnnotation(burnedInAnnotation, results) {
    if (burnedInAnnotation.has("YES")) {
      results.push(
        new EvaluationResultItem(
          DeIdentificationCheckMessages.BURNED_IN_ANNOTATION_IS_YES,
          DeIdentificationConfigurationCheckResults.BURNED_IN_ANNOTATION_IS_YES,
          `Burned In Annotation tag is "YES" -> image contains burned in annotation - the uploader canot clean that`,
          SanityCheckSeverity.WARNING
        )
      );
    }
  }

  verifyEncryptedDateInPropertiesIfPatientIdentityWillBeRemoved(identityRemoved, hasEncryptedAttributes, results) {
    // Currenty, we simply just always removing the identity and within the RPB Profile the encrypted sequence will be removed

    if (
      hasEncryptedAttributes === true &&
      this.config.deIdentificationProfileOption.includes(DeIdentificationProfiles.RPB_PROFILE)
    ) {
      results.push(
        new EvaluationResultItem(
          DeIdentificationCheckMessages.ENCRYPTED_DATA_CHECK_IF_PATIENT_IDENTITY_REMOVED_IS_YES,
          DeIdentificationConfigurationCheckResults.ENCRYPTED_DATA_CHECK_IF_PATIENT_IDENTITY_REMOVED_IS_YES,
          `Encrypted Attributes will be removed, because there is no need to store it in the RPB infrastructure.`,
          SanityCheckSeverity.WARNING
        )
      );
    }

    return;
  }
}
