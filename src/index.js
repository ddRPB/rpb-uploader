// React
import React from 'react'
import ReactDOM from 'react-dom'

// Main application component
import App from './App'

import * as serviceWorker from './serviceWorker'

// The config is used to setup the parameters to interact with the portal
const config = {
    rpbPortalUrl: 'http://10.44.89.9',
    rpbUploadServiceUrl: 'http://10.44.89.9',
    portalUploaderParameterLandingPageRelativeUrl: '/pacs/rpbUploader.faces',
    portalLandingPageRelativeUrl: '/pacs/dicomPatientStudies.faces',
}

// Application entry point
// Render the application into the root div
const rootElement = document.getElementById('root')
ReactDOM.render(<App config={config} />, rootElement)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
