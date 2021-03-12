// React
import React from 'react'
import ReactDOM from 'react-dom'

// Main application component
import App from './App'

import * as serviceWorker from './serviceWorker'

// TODO: this would be a place where to hook data fetched from RPB server
const config = {
    // Declare default config
    minNbOfInstances: 30,
    availableUploadSlots : [
        {
            "patientCode":"PID",
            "patientFirstname":"C",
            "patientLastname":"G",
            "patientSex":"M",
            "patientDOB":"01-15-1973",
            "visitModality":"PT",
            "visitDate":"09-11-2008",
            "visitType":"PET0",
            "visitID": 1
        }
    ],
    tusEndpoint : '/api/tus',
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
