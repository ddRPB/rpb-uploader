import { ADD_STUDY, SET_SLOT_ID, SET_USED_SLOT, SET_NOT_USED_SLOT, UNSET_SLOT_ID, REMOVE_WARNING_STUDY, ADD_WARNING_STUDY } from './actionTypes'
import { NULL_SLOT_ID } from '../model/Warning'

/**
 * Add study to Redux studies Object
 * @param {Object} studyObject
 */
export function addStudy(studyInstanceUID, patientFirstName, patientLastName, patientSex, patientID, acquisitionDate, accessionNumber, patientBirthDate, studyDescription, orthancStudyID, seriesModalitiesArray) {

    return {
        type: ADD_STUDY,
        payload: {
            visitID : null,
            patientFirstName : patientFirstName,
            patientLastName : patientLastName,
            patientName : patientFirstName+' '+patientLastName,
            patientSex : patientSex,
            patientID : patientID,
            studyDescription : studyDescription,
            acquisitionDate : acquisitionDate,
            patientBirthDate : patientBirthDate,
            accessionNumber : accessionNumber,
            studyInstanceUID : studyInstanceUID,
            orthancStudyID : orthancStudyID,
            seriesModalitiesArray : seriesModalitiesArray
        }
    }
}

/**
 * Set slotID to the passed study awaiting check
 * @param {String} studyInstanceUID
 * @param {Integer} slotID
 */
export function setSlotID(studyInstanceUID, slotID) {

    return function (dispatch) {

        // Make id slot used
        dispatch(
            {
                type: SET_USED_SLOT,
                payload: {
                    slotID: slotID,
                    studyInstanceUID : studyInstanceUID
                }
            }
        )

        // Attach study to a slot
        dispatch(
            {
                type: SET_SLOT_ID,
                payload: {
                    studyInstanceUID: studyInstanceUID,
                    slotID: slotID
                }
            }
        )

        // Remove NULLSlotID Warning
        dispatch(
            {
                type: REMOVE_WARNING_STUDY,
                payload: {
                    studyInstanceUID: studyInstanceUID,
                    warningKey: 'NULL_SLOT_ID'
                }
            }
        )
    }
}

export function unsetSlotID(studyInstanceUID, slotID) {

    return function (dispatch) {

        // Mark slot not used in the slot redux
        dispatch(
            {
                type: SET_NOT_USED_SLOT,
                payload: { slotID: slotID}
            }
        )

        dispatch(
            {
                type : UNSET_SLOT_ID,
                payload: {
                    studyInstanceUID: studyInstanceUID
                }
            }
        )

        dispatch(
            {
                type: ADD_WARNING_STUDY,
                payload: {
                    studyInstanceUID: studyInstanceUID,
                    warning: NULL_SLOT_ID
                }
            }
        )
    }
}
