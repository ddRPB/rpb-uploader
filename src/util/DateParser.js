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
 * Parses String to a date if the format fits to the yyyy-MM-dd (ISO Date) pattern otherwise an error message is thrown.
 * 
 * @param {String} dateString The String to be parsed. 
 * @return {Date} The date parsed from the String.
 * @throws {String} If the String does not fit the expected format.
 */
function parseOcFormattedDates(dateString) {
    const ocFormattedDateRegex = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/

    if (dateString.match(ocFormattedDateRegex) === null) {
        throw `Can not read \'${dateString}\' as date. Expect \'yyyy-MM-dd\' format.`
    }

    return new Date(dateString);

}

/**
 * Parses String to a date if the format fits to the dd.MM.yyyy (DIN 5008) pattern otherwise an error message is thrown.
 * 
 * @param {String} dateString The String to be parsed.
 * @return {Date} The date parsed from the String.
 * @throws {String} If the String does not fit the expected format.
 * 
 */
function parseRpbFormattedDates(dateString) {
    const rpbFormattedDateRegex = /(?<day>[0-9]{2}).(?<month>[0-9]{2}).(?<year>[0-9]{4})/

    if (dateString.match(rpbFormattedDateRegex) === null) {
        throw `Can not read \'${dateString}\' as date. Expect \'dd.MM.yyyy\' format.`
    }

    // using capture groups ECMAScript 2018
    const convertDate = dateString =>
        dateString.replace(rpbFormattedDateRegex, "$<year>-$<month>-$<day>");

    return new Date(convertDate(dateString));

}

/**
 * Parses String to a date if the format fits to the yyyyMMdd (DICOM) pattern otherwise an error message is thrown.
 *
 * @param {String} dateString The String to be parsed.
 * @return {Date} The date parsed from the String.
 * @throws {String} If the String does not fit the expected format. 
*/
function parseDicomFormattedDates(dateString) {
    const dicomFormattedDateRegex = /(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})/

    if (dateString.match(dicomFormattedDateRegex) === null) {
        throw `Can not read \'${dateString}\' as date. Expect \'yyyyMMdd\' format.`;
    }

    const convertDate = dateString =>
        dateString.replace(dicomFormattedDateRegex, "$<year>-$<month>-$<day>");

    return new Date(convertDate(dateString));

}

function convertToDicomDateFormatedString(dateString) {
    if (dateString === undefined) {
        throw `Can not read \'${dateString}\' as date.`;
    }

    if (dateString === '') {
        throw `Can not read \'${dateString}\' as date.`;
    }

    const dicomFormattedDateRegex = /(?<year>[0-9]{4})(?<month>[0-9]{2})(?<day>[0-9]{2})/;
    if (dateString.match(dicomFormattedDateRegex) != null) {
        return dateString;
    }

    const ocFormattedDateRegex = /(?<year>[0-9]{4})-(?<month>[0-9]{2})-(?<day>[0-9]{2})/
    if (dateString.match(ocFormattedDateRegex) != null) {
        const convertedDateString = dateString =>
            dateString.replace(ocFormattedDateRegex, "$<year>$<month>$<day>");

        return convertedDateString;
    }

    const rpbFormattedDateRegex = /(?<day>[0-9]{2}).(?<month>[0-9]{2}).(?<year>[0-9]{4})/
    if (dateString.match(rpbFormattedDateRegex) != null) {
        const convertedDateString = dateString =>
            dateString.replace(rpbFormattedDateRegex, "$<year>$<month>$<day>");

        return convertedDateString;
    }
}

export { parseOcFormattedDates, parseRpbFormattedDates, parseDicomFormattedDates, convertToDicomDateFormatedString };

