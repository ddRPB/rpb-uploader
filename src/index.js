// React
import React from 'react'
import ReactDOM from 'react-dom'

// Main application component
import App from './App'

import * as serviceWorker from './serviceWorker'

import DeIdentificationProfiles from './constants/DeIdentificationProfiles'

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
    rpbPortalUrl: 'http://localhost:8080',
    rpbUploadServiceUrl: 'http://localhost:8080',
    portalUploaderParameterLandingPageRelativeUrl: '/pacs/rpbUploader.faces',
    portalLandingPageRelativeUrl: '/pacs/dicomPatientStudies.faces',
    chunkSize: 5,
    deIdentificationProfile: DeIdentificationProfiles.BASIC,
}

// Application entry point
// Render the application into the root div
const rootElement = document.getElementById('root')
ReactDOM.render(<App config={config} />, rootElement)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
