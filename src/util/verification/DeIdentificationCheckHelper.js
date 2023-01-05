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

import DeIdentificationCheckTypes from "../../constants/deIdentificationConfigurationCheck/DeIdentificationCheckTypes";
import DeIdentificationConfigurationCheckResults from "../../constants/deIdentificationConfigurationCheck/DeIdentificationConfigurationCheckResults";
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

    constructor(uploadSlotDefinition, log = new Logger(LogLevels.FATAL)) {
        this.uploadSlotDefinition = uploadSlotDefinition;
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

        for (let key of Object.keys(series)) {
            const seriesObject = series[key];
            const seriesBurnedInAnnotation = seriesObject.burnedInAnnotation;
            burnedInAnnotation = new Set([...burnedInAnnotation, ...seriesBurnedInAnnotation]);

        }

        // start evaluating if configuration parameter is true
        if (deIdentificationCheckConfiguration[DeIdentificationCheckTypes.BURNED_IN_ANNOTATION_IS_YES] === true) {
            this.verifyBurnedInAnnotation(burnedInAnnotation, results);
        }

        return results;

    }

    verifyBurnedInAnnotation(burnedInAnnotation, results) {
        if (burnedInAnnotation.has('YES')) {
            results.push(new EvaluationResultItem(
                DeIdentificationCheckTypes.BURNED_IN_ANNOTATION_IS_YES,
                DeIdentificationConfigurationCheckResults.BURNED_IN_ANNOTATION_IS_YES,
                `Burned In Annotation tag is "YES" -> image contains burned in annotation - the uploader canot clean that`,
                SanityCheckSeverity.WARNING
            ));
        }
    }
}