import DicomUploadPackage from "../../../src/model/DicomUploadPackage";

describe("DicomUploadPackage creates correct StudyCommentTagReplacement ", () => {
  const uploadSlot = {
    siteIdentifier: "dummySiteIdentifier",
    studyEdcCode: "dummyStudyEdcCode",
    subjectId: "dummySubjectId",
    pid: "dummyPid",
  };

  test("returns an empty String if the pseudonymizedStudyInstanceUID is not set", () => {
    const dicomUploadPackage = new DicomUploadPackage(uploadSlot, null, {
      chunkSize: 5,
      deIdentificationProfileOption: [],
    });

    expect(dicomUploadPackage.createMdFiveHashFromPseudonymizedStudyInstanceUID()).toBe("");
  });

  test("returns the correct decimal String represetantion of the MD5 hash if the pseudonymizedStudyInstanceUID is set", () => {
    const dicomUploadPackage = new DicomUploadPackage(uploadSlot, null, {
      chunkSize: 5,
      deIdentificationProfileOption: [],
    });
    dicomUploadPackage.pseudonymizedStudyInstanceUID = "2.25.318368848431104815763508305521064022406";

    expect(dicomUploadPackage.createMdFiveHashFromPseudonymizedStudyInstanceUID()).toBe(
      "234350084054289841268274246836811760053"
    );
  });
});
