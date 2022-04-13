// React
import React from 'react'
import ReactDOM from 'react-dom'

// Main application component
import App from './App'

import * as serviceWorker from './serviceWorker'

// TODO: this would be a place where to hook data fetched from RPB server or passed as query string
// Query string passes the temp ApiKey (server stores association between temp ApiKey and slot and real ApiKey)
// uploader uses directly temp ApiKey to retrieve real ApiKey and slot definition
// temp ApiKey is bind to user server site session (that expires after xx minutes), real ApiKey does not expire
// after upload the import to RPB EDC should be triggered
const config = {
    // Declare default config, we are fine with one patient/ one upload slots per upload
    //availableUploadSlots : [],
    availableUploadSlots: [
        {
            "study": "Default Study", // for display purposes (with study site as well)
            "studySubjectID": "SSID", // for display purposes
            "subjectPseudonym": "PID", // this should be also not checked but we can use it for display,
            "subjectSex": "F", // Only if patient gender is collected
            "subjectDOB": "1900-01-30", // Only if the patient date of birth is collected in a study
            "studyEvent": "Baseline", // For display purposes
            "studyEventDate": "09-11-2008", // We do not really want to make restrictions based on the event date
            "slotName": "Treatment Plan", // For display purposes name (label of item from eCRF)
            "slotID": "S_DEFAULTS1/SS_XXB/SE_STIMAGING/1/F_STDCM_V11/IG_STDCM_UNGROUPED/I_STDCM_2STUIDDCM",
            "slotAnnotationType": "DICOM_STUDY_INSTANCE_UID",
            "annotations": [
                {
                    "annotationType": "DICOM_PATIENT_ID",
                    "address": "S_DEFAULTS1/SS_XXB/SE_STIMAGING/1/F_STDCM_V11/IG_STDCM_UNGROUPED/I_STDCM_PATIDDCM",
                    "value": "" // slot can be already used with ability to overwrite it
                },
                {
                    "annotationType": "DICOM_STUDY_INSTANCE_UID",
                    "address": "S_DEFAULTS1/SS_XXB/SE_STIMAGING/1/F_STDCM_V11/IG_STDCM_UNGROUPED/I_STDCM_2STUIDDCM",
                    "value": "" // slot can be already used with ability to overwrite it
                },
                {
                    "annotationType": "DICOM_SR_TEXT",
                    "address": "S_DEFAULTS1/SS_XXB/SE_STIMAGING/1/F_STDCM_V11/IG_STDCM_UNGROUPED/I_STDCM_PETCTHINITSRTEXT",
                    "value": "" // slot can be already used with ability to overwrite it
                }
            ]
        }
    ],
    rpbEndpoint: 'http://localhost:8080/api/v1/',
    onStudyUploaded: (slotID, successIDsUploaded, numberOfFiles) => { console.log(slotID) },
    onStartUsing: () => { console.log('use started') },
    onUploadComplete: () => { console.log('upload finished') },
    isNewStudy: async () => { return true }
}

// Application entry point
// Render the application into the root div
const rootElement = document.getElementById('root')
ReactDOM.render(<App config={config} />, rootElement)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
