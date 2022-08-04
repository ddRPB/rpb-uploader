/**
 * @jest-environment node
 */

import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'

const config = {
    // Declare default config, we are fine with one patient/ one upload slots per upload
    //availableUploadSlots : [],
    availableUploadSlots: [
        {
            "study": "Default Study", // for display purposes (with study site as well)
            "studySubjectID": "SSID", // for display purposes
            "subjectPseudonym": "PID", // this should be also not checked but we can use it for display,
            "subjectSex": "M", // Only if patient gender is collected
            "subjectDOB": "01-01-1900", // Only if the patient date of birth is collected in a study
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

test.skip('renders DICOM Upload Slot headline', () => {
    const { getByText } = render(
        <MemoryRouter initialEntries={["/uploader/test"]}>
            <App config={config} />
        </MemoryRouter>

    )
    const linkElement = getByText(/DICOM Upload Slot/)
    expect(linkElement).toBeInTheDocument;
})
