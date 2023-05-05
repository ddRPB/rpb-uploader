import {
  convertDicomDateStringToLocaleString,
  convertDicomDateStringToYear,
  convertOCDateStringToLocaleString,
  convertRPBDateStringToLocaleString,
  convertToDicomDateFormatedString,
  parseDicomFormattedDates,
  parseOcFormattedDates,
  parseRpbFormattedDates,
} from "../../../src/util/DateParser";

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
      expect(parsedDate).toStrictEqual(new Date("2002-01-30"));
    });
  });

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

      expect(parsedDate).toStrictEqual(new Date("2002-01-30"));
    });
  });

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

      expect(parsedDate).toStrictEqual(new Date("2002-01-30"));
    });
  });

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
  });

  describe("convertDicomDateStringToYear", () => {
    test("Empty String throws", () => {
      const stringToParse = "";
      expect(() => {
        convertDicomDateStringToYear(stringToParse);
      }).toThrow(`Can not read \'${stringToParse}\' as DICOM date.`);
    });

    test("Wrong formated String throws", () => {
      const stringToParse = "";
      expect(() => {
        convertDicomDateStringToYear(stringToParse);
      }).toThrow(`Can not read \'${stringToParse}\' as DICOM date.`);
    });

    test("Null throws", () => {
      const stringToParse = null;
      expect(() => {
        convertDicomDateStringToYear(stringToParse);
      }).toThrow(`Can not read \'${stringToParse}\' as DICOM date.`);
    });

    test("DICOM date String will be returned", () => {
      const stringToParse = "20020130";
      const convertedDateString = convertDicomDateStringToYear(stringToParse);

      expect(convertedDateString).toEqual("2002");
    });
  });

  describe("convertDicomDateStringToLocaleString", () => {
    test("keeps the String if locale is not defined", () => {
      const dicomDateString = "20141201";
      expect(convertDicomDateStringToLocaleString(dicomDateString)).toBe("20141201");
    });

    test("keeps the String if date canot be parsed", () => {
      const dicomDateString = "20ab141201";
      expect(convertDicomDateStringToLocaleString(dicomDateString)).toBe("20ab141201");
    });

    test("converts Dicom date String to german date String", () => {
      const dicomDateString = "20141201";
      expect(convertDicomDateStringToLocaleString(dicomDateString, "de")).toMatch("1.12.2014");
    });

    test("converts Dicom date String to english date String", () => {
      const dicomDateString = "20141201";
      expect(convertDicomDateStringToLocaleString(dicomDateString, "en")).toMatch("12/1/2014");
    });

    test("converts Dicom date String to en-Us date String", () => {
      const dicomDateString = "20141201";
      expect(convertDicomDateStringToLocaleString(dicomDateString, "en-Us")).toMatch("12/1/2014");
    });
  });

  describe("convertRPBDateStringToLocaleString", () => {
    test("keeps the String if locale is not defined", () => {
      const dicomDateString = "01.12.2014";
      expect(convertRPBDateStringToLocaleString(dicomDateString)).toBe("01.12.2014");
    });

    test("keeps the String if date canot be parsed", () => {
      const dicomDateString = "20ab141201";
      expect(convertRPBDateStringToLocaleString(dicomDateString)).toBe("20ab141201");
    });

    test("converts Dicom date String to german date String", () => {
      const dicomDateString = "01.12.2014";
      expect(convertRPBDateStringToLocaleString(dicomDateString, "de")).toMatch("1.12.2014");
    });

    test("converts Dicom date String to english date String", () => {
      const dicomDateString = "01.12.2014";
      expect(convertRPBDateStringToLocaleString(dicomDateString, "en")).toMatch("12/1/2014");
    });

    test("converts Dicom date String to en-Us date String", () => {
      const dicomDateString = "01.12.2014";
      expect(convertRPBDateStringToLocaleString(dicomDateString, "en-Us")).toMatch("12/1/2014");
    });
  });

  describe("convertOCDateStringToLocaleString", () => {
    test("keeps the String if locale is not defined", () => {
      const dicomDateString = "2014-12-01";
      expect(convertOCDateStringToLocaleString(dicomDateString)).toBe("2014-12-01");
    });

    test("keeps the String if date canot be parsed", () => {
      const dicomDateString = "20ab141201";
      expect(convertOCDateStringToLocaleString(dicomDateString)).toBe("20ab141201");
    });

    test("converts Dicom date String to german date String", () => {
      const dicomDateString = "2014-12-01";
      expect(convertOCDateStringToLocaleString(dicomDateString, "de")).toMatch("1.12.2014");
    });

    test("converts Dicom date String to english date String", () => {
      const dicomDateString = "2014-12-01";
      expect(convertOCDateStringToLocaleString(dicomDateString, "en")).toMatch("12/1/2014");
    });

    test("converts Dicom date String to en-Us date String", () => {
      const dicomDateString = "2014-12-01";
      expect(convertOCDateStringToLocaleString(dicomDateString, "en-Us")).toMatch("12/1/2014");
    });
  });
});
