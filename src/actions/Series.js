import { ADD_SERIES } from './actionTypes'

/**
 * Add series to Redux series Object
 * @param {Object} series
 */
export function addSeries(instances, seriesInstanceUID, seriesDate, seriesDescription, modality, studyInstanceUID) {

    let seriesObject = {
        instances : instances,
        seriesInstanceUID : seriesInstanceUID,
        seriesDate : seriesDate,
        seriesDescription : seriesDescription,
        modality : modality,
        studyInstanceUID : studyInstanceUID,
        numberOfInstances : Object.keys(instances).length
    }

    return {
        type: ADD_SERIES,
        payload: seriesObject
    }
}
