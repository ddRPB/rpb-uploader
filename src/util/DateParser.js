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
        throw `Can not read \'${dateString}\' as date. Expect \'yyyyMMdd\' format.`
    }

    const convertDate = dateString =>
        dateString.replace(dicomFormattedDateRegex, "$<year>-$<month>-$<day>");

    return new Date(convertDate(dateString));

}

export { parseOcFormattedDates, parseRpbFormattedDates, parseDicomFormattedDates };

