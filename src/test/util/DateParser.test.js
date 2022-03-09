import { parseOcFormattedDates, parseRpbFormattedDates, parseDicomFormattedDates } from "../../util/DateParser";

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

})