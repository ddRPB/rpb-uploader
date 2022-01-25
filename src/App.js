// Boostrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Primereact styles
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import React, { useState } from 'react'
import { Provider } from 'react-redux'
import { ToastContainer } from 'react-toastify'
// Toastify CSS
import 'react-toastify/dist/ReactToastify.css'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import 'regenerator-runtime/runtime'
// Custom RPB Uploader CSS
import './assets/style/DicomUpload.css'
import seriesWarningMiddleware from './middleware/SeriesWarningMiddleware'
// All reducers
import reducers from './reducers'
// Uploader component
import Uploader from './uploader/Uploader'


/**
 * Function based main stateful application component
 * @param {Object} props configuration properties provided by the backend
 */
function App(props) {

    // Immutable global state with middleware for action creators
    const createStoreWithMiddleware = applyMiddleware(thunk, seriesWarningMiddleware)(createStore)

    const [count, setCount] = useState(0);

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
