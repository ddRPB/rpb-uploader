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
// Boostrap CSS
import "bootstrap/dist/css/bootstrap.min.css";
// Primereact styles
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/saga-blue/theme.css";
import React, { Fragment } from "react";
// import React, { Component, Fragment } from 'react';
import { Route, Routes, useSearchParams } from "react-router-dom";
import { ToastContainer } from "react-toastify";
// Toastify CSS
import "react-toastify/dist/ReactToastify.css";
import "regenerator-runtime/runtime";
// Custom RPB Uploader CSS
import "./assets/style/DicomUpload.css";
import LogLevels from "./constants/LogLevels";
// Uploader component
import Uploader from "./uploader/Uploader";
import Logger from "./util/logging/Logger";

/**
 * Function based main stateful application component
 * @param {Object} props configuration properties provided by the backend
 */
function App(props) {
  function UploaderWithParams() {
    const [searchParams] = useSearchParams();

    const log = new Logger(LogLevels.TRACE);

    return (
      <Uploader
        {...props}
        studyIdentifier={searchParams.get("studyidentifier")}
        siteIdentifier={searchParams.get("siteidentifier")}
        studyInstanceItemOid={searchParams.get("studyinstanceitemoid")}
        studyOid={searchParams.get("studyoid")}
        studyEdcCode={searchParams.get("studyedccode")}
        eventOid={searchParams.get("eventoid")}
        eventRepeatKey={searchParams.get("eventrepeatkey")}
        eventStartDate={searchParams.get("eventstartdate")}
        eventEndDate={searchParams.get("eventenddate")}
        eventName={searchParams.get("eventname")}
        eventDescription={searchParams.get("eventdescription")}
        formOid={searchParams.get("formoid")}
        itemGroupOid={searchParams.get("itemgroupoid")}
        itemGroupRepeatKey={searchParams.get("itemgrouprepeatkey")}
        itemLabel={searchParams.get("itemlabel")}
        itemDescription={searchParams.get("itemdescription")}
        subjectId={searchParams.get("studysubjectid")}
        subjectKey={searchParams.get("subjectkey")}
        pid={searchParams.get("pid")}
        dicomPatientIdItemOid={searchParams.get("dicompatientiditemoid")}
        dob={searchParams.get("dob")}
        yob={searchParams.get("yob")}
        gender={searchParams.get("gender")}
        log={log}
      />
    );
  }

  function UploaderWithTestParams() {
    const log = new Logger(LogLevels.FATAL);

    return (
      <Uploader
        {...props}
        studyIdentifier="studyidentifier"
        siteIdentifier="siteidentifier"
        studyInstanceItemOid="studyinstanceitemoid"
        studyOid="studyoid"
        studyEdcCode="studyedccode"
        eventOid="eventoid"
        eventRepeatKey="eventrepeatkey"
        eventStartDate="eventstartdate"
        eventEndDate="eventenddate"
        eventName="eventname"
        eventDescription="eventdescription"
        formOid="formoid"
        itemGroupOid="itemgroupoid"
        itemGroupRepeatKey="itemgrouprepeatkey"
        itemLabel="itemlabel"
        itemDescription="itemdescription"
        subjectId="studysubjectid"
        subjectKey="subjectkey"
        pid="pid"
        dicomPatientIdItemOid="dicompatientiditemoid"
        dob="dob"
        yob="yob"
        gender="gender"
        log={log}
      />
    );
  }

  return (
    <Fragment>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
      />
      {/* <BrowserRouter> */}
      <Routes>
        <Route path="/uploader/" element={<UploaderWithParams {...props} />}></Route>
        <Route path="/uploader/test" element={<UploaderWithTestParams {...props} />}></Route>
        {/* <Route
                        path="*"
                        element={<UploaderWithParams {...props} />}>
                    </Route> */}
      </Routes>
      {/* </BrowserRouter> */}
    </Fragment>
    // </Provider>
  );
}

// ES6 module system allowing to export the App function
export default App;
