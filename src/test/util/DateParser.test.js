import { parseOcFormattedDates, parseRpbFormattedDates, parseDicomFormattedDates, convertToDicomDateFormatedString } from "../../util/DateParser";

describe("DateParser tests", () => {

    describe("parseOcFormattedDates", () => {

        test("empty String throws", () => {
            const stringToParse = "";
            expect(() => {
                parseOcFormattedDates(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("null throws", () => {
            const stringToParse = "";
            expect(() => {
                parseOcFormattedDates(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("valid date String will be parsed to a date", () => {
            const stringToParse = "2002-01-30";

            const parsedDate = parseOcFormattedDates(stringToParse);
            expect(parsedDate).toStrictEqual(new Date('2002-01-30'));


        });
    })

    describe("parseRpbFormattedDates", () => {

        test("empty String throws", () => {
            const stringToParse = "";
            expect(() => {
                parseRpbFormattedDates(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("null throws", () => {
            const stringToParse = "";
            expect(() => {
                parseRpbFormattedDates(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("valid date String will be parsed to a date", () => {
            const stringToParse = "30.01.2002";
            const parsedDate = parseRpbFormattedDates(stringToParse);

            expect(parsedDate).toStrictEqual(new Date('2002-01-30'));


        });
    })

    describe("parseDicomFormattedDates", () => {

        test("empty String throws", () => {
            const stringToParse = "";
            expect(() => {
                parseDicomFormattedDates(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("null throws", () => {
            const stringToParse = "";
            expect(() => {
                parseDicomFormattedDates(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("valid date String will be parsed to a date", () => {
            const stringToParse = "20020130";
            const parsedDate = parseDicomFormattedDates(stringToParse);

            expect(parsedDate).toStrictEqual(new Date('2002-01-30'));

        });
    })

    describe("convertToDicomDateFormatedString", () => {

        test("empty String throws", () => {
            const stringToParse = "";
            expect(() => {
                convertToDicomDateFormatedString(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("null throws", () => {
            const stringToParse = "";
            expect(() => {
                convertToDicomDateFormatedString(stringToParse);
            }).toThrow(`Can not read \'${stringToParse}\' as date.`);

        });

        test("DICOM date String will be returned", () => {
            const stringToParse = "20020130";
            const convertedDateString = convertToDicomDateFormatedString(stringToParse);

            expect(convertedDateString).toEqual(stringToParse);

        });

        test("ISO date String will be returned in DICOM date String format", () => {
            const expectedString = "20020130";
            const stringToParse = "2002-01-30";
            const convertedDateString = convertToDicomDateFormatedString(stringToParse);

            expect(convertedDateString).toEqual(expectedString);

        });

        test("RPB date String will be returned in DICOM date String format", () => {
            const expectedString = "20020130";
            const stringToParse = "30.01.2002";
            const convertedDateString = convertToDicomDateFormatedString(stringToParse);

            expect(convertedDateString).toEqual(expectedString);

        });
    })

})