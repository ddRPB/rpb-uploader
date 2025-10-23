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
 */

// React
import React, { StrictMode } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Routes, useSearchParams } from "react-router-dom";

// Main application component
import App from "./App";

import * as serviceWorker from "./serviceWorker";

import DeIdentificationProfiles from "./constants/DeIdentificationProfiles";

/**
 * The config is used to setup the parameters to interact with the portal.
 *
 * rpbPortalUrl: basic URL of the portal (with WebUI) (e.g.: https://localhost:7654)
 * rpbUploadServiceUrl: basic URL of the webservices of the portal (e.g.: https://localhost:7654)
 * portalUploaderParameterLandingPageRelativeUrl: relative URL path of the portal where the Uploader can get additional upload parameters (e.g.: /pacs/rpbUploader.faces)
 * portalLandingPageRelativeUrl: relative URL path of the Portal landing page where user will be redirected to (e.g.: /pacs/dicomPatientStudies.faces)
 * chunkSize: defines how many files will be uploaded in a chuck (the max. size of a chunk is often limited by proxy infrastructure - this parameter allows to control it indirectly)
 * deIdentificationProfile: default de-identification profile
 */
const config = {
  rpbPortalUrl: "http://localhost:8080",
  rpbUploadServiceUrl: "http://localhost:8080",
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
  language: navigator.language,
  userAgent: navigator.userAgent,
  uploaderVersion: "v0.0.4",
  mailServiceEnabled: true,
  skipUploadVerification: [
    "1.2.246.352.70.1.70", // halcyonRTPlanSOPClassUid
  ],
};

// Application entry point
// Render the application into the root div
const rootElement = document.getElementById("root");

ReactDOM.render(
  // https://react.dev/reference/react/StrictMode
  <StrictMode>
    <BrowserRouter>
      <App config={config} />
    </BrowserRouter>
  </StrictMode>,
  rootElement
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
