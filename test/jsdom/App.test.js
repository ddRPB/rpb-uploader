/**
 * @jest-environment jsdom
 */

import { render } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import App from "../../src/App";
import DeIdentificationProfiles from "../../src/constants/DeIdentificationProfiles";

require("jest-fetch-mock").enableMocks();

const config = {
  rpbPortalUrl: "http://localhost",
  rpbUploadServiceUrl: "http://localhost",
  portalUploaderParameterLandingPageRelativeUrl: "/pacs/rpbUploader.faces",
  portalLandingPageRelativeUrl: "/pacs/dicomPatientStudies.faces",
  chunkSize: 5,
  deIdentificationProfileOption: [
    DeIdentificationProfiles.RETAIN_LONG_FULL_DATES,
    DeIdentificationProfiles.RETAIN_PATIENT_CHARACTERISTICS,
    DeIdentificationProfiles.RETAIN_DEVICE_IDENTITY,
    DeIdentificationProfiles.RETAIN_SAFE_PRIVATE_OPTION,
    DeIdentificationProfiles.RPB_PROFILE,
  ],
};

test("renders DICOM Upload Slot headline", () => {
  fetch.resetMocks();
  fetch.mockResponse(JSON.stringify({ apiKey: "aabb" }));

  const { getByText } = render(
    <MemoryRouter initialEntries={["/uploader/test"]}>
      <App config={config} />
    </MemoryRouter>
  );
  const linkElement = getByText(/Back to Portal/);

  fetch.disableMocks();

  expect(linkElement).toBeInTheDocument;
});
