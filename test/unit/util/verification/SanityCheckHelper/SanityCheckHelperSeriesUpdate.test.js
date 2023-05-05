import DicomGenderEnum from "../../../../../src/constants/dicomValueEnums/DicomGenderEnum";
import Modalities from "../../../../../src/constants/Modalities";
import SanityCheckResult from "../../../../../src/constants/sanityCheck/SanityCheckResult";
import SanityCheckSeverity from "../../../../../src/constants/sanityCheck/SanityCheckSeverity";
import SanityCheckTypes from "../../../../../src/constants/sanityCheck/SanityCheckTypes";
import DicomSeries from "../../../../../src/model/DicomSeries";
import DicomStudy from "../../../../../src/model/DicomStudy";
import EvaluationResultItem from "../../../../../src/util/verification/EvaluationResultItem";
import SanityCheckHelper from "../../../../../src/util/verification/SanityCheckHelper";

describe("SanityCheckHelper update sanitity check results, based on series data", () => {
  const sanityCheckConfiguration = {
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
  const studyInstanceUID = "dummyStudyInstanceUID";
  const seriesInstanceUID = "dummySeriesInstanceUID";
  const studyDate = "20020202";
  const seriesDate = "20020202";
  const studyDescription = "dummyStudyDescription";
  const seriesDescription = "dummySeriesDescription";
  const modality = Modalities.CT;
  const patientID = "dummyPatientID";
  const patientSex = "dummyPatientSex";
  const patientName = "dummyPatientName";
  const patientBirthDate = "19000101";

  const seriesDetails = {
    seriesInstanceUID,
    seriesDate,
    seriesDescription,
    modality,
    studyInstanceUID,
  };

  const patientData = {};
  patientData.patientID = patientID;
  patientData.patientBirthDate = patientBirthDate;
  patientData.patientSex = patientSex;
  patientData.patientName = patientName;

  const availableDicomTags = new Map();

  function getBasicParameters() {
    const parameters = new Map();
    parameters.set("BurnedInAnnotation", "BurnedInAnnotation");
    parameters.set("IdentityRemoved", "IdentityRemoved");
    return parameters;
  }

  describe("Gender", () => {
    let dicomStudy;
    let uploadSlot;
    let sanityCheckHelper;

    test("Gender parameter is not defined in upload slot", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test('Gender parameter of the series is "other"', () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        DicomGenderEnum.O
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: DicomGenderEnum.F,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.O);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Gender parameter is not defined in the series", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        null
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: DicomGenderEnum.F,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", "");
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Gender parameter matches the series parameter", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        DicomGenderEnum.O
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: DicomGenderEnum.F,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Series have different gender parameter, one matches the upload slot parameter", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        DicomGenderEnum.O
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: DicomGenderEnum.M,
      };

      const parametersFirstDicomSeries = getBasicParameters();
      parametersFirstDicomSeries.set("patientID", patientID);
      parametersFirstDicomSeries.set("patientBirthDate", "19800101");
      parametersFirstDicomSeries.set("patientSex", DicomGenderEnum.F);
      parametersFirstDicomSeries.set("patientName", patientName);

      const parametersSecondDicomSeries = getBasicParameters();
      parametersSecondDicomSeries.set("patientID", patientID);
      parametersSecondDicomSeries.set("patientBirthDate", "19800101");
      parametersSecondDicomSeries.set("patientSex", DicomGenderEnum.M);
      parametersSecondDicomSeries.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parametersFirstDicomSeries, availableDicomTags);

      const secondDicomSeries = new DicomSeries(seriesDetails, parametersSecondDicomSeries, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis(
        [firstDicomSeries, secondDicomSeries],
        sanityCheckConfiguration
      );

      expect(result.length).toBe(2);
      expect(result[1]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.ONE_MATCHES,
          SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
          `Gender is inconsistent and one value matches the upload slot definition. ${DicomGenderEnum.F} / ${DicomGenderEnum.M} - ${DicomGenderEnum.M}`,
          SanityCheckSeverity.WARNING
        )
      );
    });

    test("Series gender parameter does not match the upload slot parameter", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        DicomGenderEnum.O
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: DicomGenderEnum.M,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.CONFLICT,
          SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
          `Gender does not match the upload slot definition. ${DicomGenderEnum.F} - ${DicomGenderEnum.M}`,
          SanityCheckSeverity.ERROR
        )
      );
    });

    test("Series gender parameter does not match the upload slot parameter, but sanity check configuration parameter is false", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        DicomGenderEnum.O
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: DicomGenderEnum.M,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();

      const sanityCheckConfigurationTwo = { ...sanityCheckConfiguration };
      sanityCheckConfigurationTwo[[SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT]] = false;

      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfigurationTwo);

      expect(result.length).toBe(0);
    });

    test("Series have different gender parameter, no one matches the upload slot parameter", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        DicomGenderEnum.O
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: DicomGenderEnum.M,
      };

      const parametersFirstDicomSeries = getBasicParameters();
      parametersFirstDicomSeries.set("patientID", patientID);
      parametersFirstDicomSeries.set("patientBirthDate", "19800101");
      parametersFirstDicomSeries.set("patientSex", DicomGenderEnum.F);
      parametersFirstDicomSeries.set("patientName", patientName);

      const parametersSecondDicomSeries = getBasicParameters();
      parametersSecondDicomSeries.set("patientID", patientID);
      parametersSecondDicomSeries.set("patientBirthDate", "19800101");
      parametersSecondDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersSecondDicomSeries.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parametersFirstDicomSeries, availableDicomTags);

      const secondDicomSeries = new DicomSeries(seriesDetails, parametersSecondDicomSeries, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis(
        [firstDicomSeries, secondDicomSeries],
        sanityCheckConfiguration
      );

      expect(result.length).toBe(2);
      expect(result[1]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.CONFLICT,
          SanityCheckTypes.PATIENT_GENDER_MATCHES_UPLOADSLOT,
          `Gender does not match the upload slot definition. ${DicomGenderEnum.F} / ${DicomGenderEnum.O} - ${DicomGenderEnum.M}`,
          SanityCheckSeverity.ERROR
        )
      );
    });
  });

  describe("Date of birth", () => {
    let dicomStudy;
    let uploadSlot;
    let sanityCheckHelper;

    test("Upload Slot DOB is null", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Upload Slot DOB is replacement date", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        patientSex
      );

      uploadSlot = {
        dob: "1900-01-01",
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Date of birth is not defined in series", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: "1980-02-02",
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Series date of birth is a replacement", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: "1980-02-02",
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19000101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Series date of birth matches upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: "1980-02-02",
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800202");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("One of the study dates of birth matches upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: "1980-02-02",
        yob: null,
        gender: null,
      };

      const parametersFirstDicomSeries = getBasicParameters();
      parametersFirstDicomSeries.set("patientID", patientID);
      parametersFirstDicomSeries.set("patientBirthDate", "19800202");
      parametersFirstDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersFirstDicomSeries.set("patientName", patientName);

      const parametersSecondDicomSeries = getBasicParameters();
      parametersSecondDicomSeries.set("patientID", patientID);
      parametersSecondDicomSeries.set("patientBirthDate", "19700101");
      parametersSecondDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersSecondDicomSeries.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parametersFirstDicomSeries, availableDicomTags);

      const secondDicomSeries = new DicomSeries(seriesDetails, parametersSecondDicomSeries, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis(
        [firstDicomSeries, secondDicomSeries],
        sanityCheckConfiguration
      );

      expect(result.length).toBe(2);
      expect(result[1]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.ONE_MATCHES,
          SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
          `One of the birth dates matches upload slot definition`,
          SanityCheckSeverity.WARNING
        )
      );
    });

    test("Series date of birth does not match the upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: "1980-02-02",
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19700101");
      parameters.set("patientSex", DicomGenderEnum.O);
      parameters.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.CONFLICT,
          SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
          `Date of birth property does not match the upload slot definition`,
          SanityCheckSeverity.ERROR
        )
      );
    });

    test("No one of the series dates of birth matches upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: "1980-02-02",
        yob: null,
        gender: null,
      };

      const parametersFirstDicomSeries = getBasicParameters();
      parametersFirstDicomSeries.set("patientID", patientID);
      parametersFirstDicomSeries.set("patientBirthDate", "19800101");
      parametersFirstDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersFirstDicomSeries.set("patientName", patientName);

      const parametersSecondDicomSeries = getBasicParameters();
      parametersSecondDicomSeries.set("patientID", patientID);
      parametersSecondDicomSeries.set("patientBirthDate", "19700101");
      parametersSecondDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersSecondDicomSeries.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parametersFirstDicomSeries, availableDicomTags);

      const secondDicomSeries = new DicomSeries(seriesDetails, parametersSecondDicomSeries, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis(
        [firstDicomSeries, secondDicomSeries],
        sanityCheckConfiguration
      );

      expect(result.length).toBe(2);
      expect(result[1]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.CONFLICT,
          SanityCheckTypes.PATIENT_BIRTH_DATE_MATCHES_UPLOADSLOT,
          `Date of birth property does not match the upload slot definition`,
          SanityCheckSeverity.ERROR
        )
      );
    });
  });

  describe("Year of birth", () => {
    let dicomStudy;
    let uploadSlot;
    let sanityCheckHelper;

    test("Upload Slot YoB is null", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: null,
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Upload Slot YoB is replacement date", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        patientBirthDate,
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: "1900",
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Date of birth is not defined in series", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: "1980",
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Series date of birth is a replacement", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: "1980",
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19000101");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("Series date of birth matches upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: "1980",
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19800202");
      parameters.set("patientSex", DicomGenderEnum.F);
      parameters.set("patientName", patientName);

      const dicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([dicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(0);
    });

    test("One of the study dates of birth matches upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: "1980",
        gender: null,
      };

      const parametersFirstDicomSeries = getBasicParameters();
      parametersFirstDicomSeries.set("patientID", patientID);
      parametersFirstDicomSeries.set("patientBirthDate", "19800202");
      parametersFirstDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersFirstDicomSeries.set("patientName", patientName);

      const parametersSecondDicomSeries = getBasicParameters();
      parametersSecondDicomSeries.set("patientID", patientID);
      parametersSecondDicomSeries.set("patientBirthDate", "19700101");
      parametersSecondDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersSecondDicomSeries.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parametersFirstDicomSeries, availableDicomTags);

      const secondDicomSeries = new DicomSeries(seriesDetails, parametersSecondDicomSeries, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis(
        [firstDicomSeries, secondDicomSeries],
        sanityCheckConfiguration
      );

      expect(result.length).toBe(2);
      expect(result[1]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.ONE_MATCHES,
          SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT,
          `One of the birth dates matches upload slot definition`,
          SanityCheckSeverity.WARNING
        )
      );
    });

    test("Series date of birth does not match the upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: "1980",
        gender: null,
      };

      const parameters = getBasicParameters();
      parameters.set("patientID", patientID);
      parameters.set("patientBirthDate", "19700101");
      parameters.set("patientSex", DicomGenderEnum.O);
      parameters.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parameters, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis([firstDicomSeries], sanityCheckConfiguration);

      expect(result.length).toBe(1);
      expect(result[0]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.CONFLICT,
          SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT,
          `Year of birth property does not match the upload slot definition`,
          SanityCheckSeverity.ERROR
        )
      );
    });

    test("No one of the series dates of birth matches upload slot definition", () => {
      dicomStudy = new DicomStudy(
        studyInstanceUID,
        studyDate,
        studyDescription,
        patientID,
        patientName,
        "19700101",
        patientSex
      );

      uploadSlot = {
        dob: null,
        yob: "1985",
        gender: null,
      };

      const parametersFirstDicomSeries = getBasicParameters();
      parametersFirstDicomSeries.set("patientID", patientID);
      parametersFirstDicomSeries.set("patientBirthDate", "19800101");
      parametersFirstDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersFirstDicomSeries.set("patientName", patientName);

      const parametersSecondDicomSeries = getBasicParameters();
      parametersSecondDicomSeries.set("patientID", patientID);
      parametersSecondDicomSeries.set("patientBirthDate", "19700101");
      parametersSecondDicomSeries.set("patientSex", DicomGenderEnum.O);
      parametersSecondDicomSeries.set("patientName", patientName);

      const firstDicomSeries = new DicomSeries(seriesDetails, parametersFirstDicomSeries, availableDicomTags);

      const secondDicomSeries = new DicomSeries(seriesDetails, parametersSecondDicomSeries, availableDicomTags);

      sanityCheckHelper = new SanityCheckHelper(dicomStudy, uploadSlot, sanityCheckConfiguration);
      sanityCheckHelper.getUploadSlotEvaluationResults();
      let result = sanityCheckHelper.updateWithSeriesAnalysis(
        [firstDicomSeries, secondDicomSeries],
        sanityCheckConfiguration
      );

      expect(result.length).toBe(2);
      expect(result[1]).toMatchObject(
        new EvaluationResultItem(
          SanityCheckResult.CONFLICT,
          SanityCheckTypes.PATIENT_BIRTH_YEAR_MATCHES_UPLOADSLOT,
          `Year of birth property does not match the upload slot definition`,
          SanityCheckSeverity.ERROR
        )
      );
    });
  });
});
