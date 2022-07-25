// Boostrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Primereact styles
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import 'primereact/resources/primereact.min.css'
import 'primereact/resources/themes/saga-blue/theme.css'
import React, { Fragment } from 'react'
import { Provider } from 'react-redux'
// import React, { Component, Fragment } from 'react';
import { BrowserRouter, Route, Routes, useParams, useSearchParams } from "react-router-dom"
import { ToastContainer } from 'react-toastify'
// Toastify CSS
import 'react-toastify/dist/ReactToastify.css'
import { applyMiddleware, createStore } from 'redux'
import thunk from 'redux-thunk'
import 'regenerator-runtime/runtime'
// Custom RPB Uploader CSS
import './assets/style/DicomUpload.css'
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
    // const createStoreWithMiddleware = applyMiddleware(thunk)(createStore);

    function UploaderWithParams() {
        let { studyIdentifier, siteIdentifier, studySubjectIdentifier } = useParams();
        const [searchParams, setSearchParams] = useSearchParams();

        return <Uploader
            {...props}
            studyIdentifier={searchParams.get('studyidentifier')}
            siteIdentifier={searchParams.get('siteidentifier')}
            studyInstanceItemOid={searchParams.get('studyinstanceitemoid')}
            studyOid={searchParams.get('studyoid')}
            studyEdcCode={searchParams.get('studyedccode')}

            event={searchParams.get('event')}
            eventRepeatKey={searchParams.get('eventrepeatkey')}
            eventStartDate={searchParams.get('eventstartdate')}
            eventEndDate={searchParams.get('eventenddate')}
            eventName={searchParams.get('eventname')}
            eventDescription={searchParams.get('eventdescription')}

            form={searchParams.get('form')}
            itemGroup={searchParams.get('itemgroup')}
            itemGroupRepeatKey={searchParams.get('itemgrouprepeatkey')}
            item={searchParams.get('item')}
            itemLabel={searchParams.get('itemlabel')}
            itemDescription={searchParams.get('itemdescription')}

            subjectId={searchParams.get('subjectid')}
            subjectKey={searchParams.get('subjectkey')}
            pid={searchParams.get('pid')}
            dicomPatientIdItemOid={searchParams.get('dicompatientiditemoid')}

            dob={searchParams.get('dob')}
            yob={searchParams.get('yob')}
            gender={searchParams.get('gender')}
        />;
    }

    function UploaderWithTestParams() {
        let { studyIdentifier, siteIdentifier, studySubjectIdentifier } = useParams();
        const [searchParams, setSearchParams] = useSearchParams();

        return <Uploader
            {...props}
            studyIdentifier="Default Study"
            siteIdentifier="DD-Default Study"
            event="eventId"
            eventRepeatKey="2"
            eventStartDate="2000-01-01"
            eventEndDate="2001-01-01"
            form="formId"
            itemGroup="itemGroupId"
            itemGroupRepeatKey="4"
            item="itemId"
            itemLabel="label"

            subjectId="subject123"
            pid="DD-1234abc"
            dob="1900-01-30"
            yob="1900"
            gender="m"
        />;
    }

    // Provider with allowed Redux DevTools
    return (
        // <Provider store={createStoreWithMiddleware(reducers, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__())}>
        // <Provider store={createStoreWithMiddleware(reducers)}>
        <Fragment>
            <ToastContainer
                position='top-right'
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnHover
            />
            <BrowserRouter>
                <Routes>
                    <Route
                        path="/uploader/"
                        element={<UploaderWithParams {...props} />}>
                    </Route>
                    <Route
                        path="/uploader/test"
                        element={<UploaderWithTestParams {...props} />}>
                    </Route>
                    {/* <Route
                        path="*"
                        element={<UploaderWithParams {...props} />}>
                    </Route> */}

                </Routes>
            </BrowserRouter>
        </Fragment>
        // </Provider>
    )
}

// ES6 module system allowing to export the App function
export default App
