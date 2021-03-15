// React
import React from 'react'
import ReactDOM from 'react-dom'

// Main application component
import App from './App'

import * as serviceWorker from './serviceWorker'

// TODO: this would be a place where to hook data fetched from RPB server or passed as query string
const config = {
    // Declare default config, we are fine with one patient/ one upload slot per upload
    minNbOfInstances: 30,
    //availableUploadSlots : [],
    availableUploadSlots : [
        {
            "patientCode":"PID", // this should be also not checked but we can use it for display, add also SSID
            "patientFirstname":"C", // this we definitely do not want to check
            "patientLastname":"G", // this we definitely do not want to check
            "patientSex":"M", // Only if patient gender is collected
            "patientDOB":"01-01-1900", // Only if the patient date of birth is collected in a study
            "visitModality":"PT", // It is questionable if we want to do restriction based on modality
            "visitDate":"09-11-2008", // We do not really want to make restrictions base don the date
            "visitType":"PET0", // For display purposes name e.g. ItemLabel
            "visitID": 1 // should be unique identifier (could use the OIDs)
        }
    ],
    rpbEndpoint : '/api/v1/rpb',
    onStudyUploaded : (visitID, successIDsUploaded, numberOfFiles, originalStudyOrthancID) => {console.log(visitID)},
    onStartUsing : () => { console.log('use started') },
    onUploadComplete: () => { console.log('upload finished') },
    isNewStudy : async () => { return true }
}

// Application entry point
// Render the application into the root div
const rootElement = document.getElementById('root')
ReactDOM.render(<App config={config} />, rootElement)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
