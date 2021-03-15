import 'regenerator-runtime/runtime'

import React from 'react'
import { Provider } from 'react-redux'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'

import { ToastContainer } from 'react-toastify'

// Primereact styles
import 'primeflex/primeflex.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import 'primereact/resources/primereact.min.css'
import 'primeicons/primeicons.css'

// Boostrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'

// Toastify CSS
import 'react-toastify/dist/ReactToastify.css'

// Custom RPB Uploader CSS
import './assets/style/DicomUpload.css'

// Uploader component
import Uploader from './uploader/Uploader'

// All reducers
import reducers from './reducers'

import seriesWarningMiddleware from './middleware/SeriesWarningMiddleware'

/**
 * Function based main stateful application component
 * @param {Object} props configuration properties provided by the backend
 */
function App(props) {

    // Immutable global state with middleware for action creators
    const createStoreWithMiddleware =  applyMiddleware(thunk, seriesWarningMiddleware)(createStore)

    // Provider with allowed Redux DevTools
    return (
        <Provider store={createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())}>
            <ToastContainer
                position='top-right'
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnHover
            />
        <Uploader {...props} />
        </Provider>
    )
}

// ES6 module system allowing to export the App function
export default App
