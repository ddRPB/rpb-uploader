import { SELECT_STUDY, ADD_SERIES_READY, REMOVE_SERIES_READY, SELECT_SERIES, ADD_STUDIES_READY, REMOVE_STUDIES_READY } from './actionTypes'

/**
 * Update Redux state of current selectedStudy
 * @param {String} studyInstanceUID
 */
export function selectStudy(studyInstanceUID) {
    return {
        type: SELECT_STUDY,
        payload: studyInstanceUID
    }
}

/**
 * Update Redux state of current selectedSeries
 * @param {String} seriesInstanceUID
 */
export function selectSeries(seriesInstanceUID) {
    return {
        type: SELECT_SERIES,
        payload: seriesInstanceUID
    }
}

/**
 * Update Redux state of selected series which are ready to be uploaded
 * @param {String} seriesInstanceUID
 */
export function addSeriesReady(seriesInstanceUID) {
    return {
        type: ADD_SERIES_READY,
        payload: { seriesInstanceUID: seriesInstanceUID}
    }
}

export function removeSeriesReady(seriesInstanceUID) {
    return {
        type: REMOVE_SERIES_READY,
        payload: { seriesInstanceUID: seriesInstanceUID}
    }
}

/**
 * Update Redux state of selected studies which are ready to be uploaded
 * @param {String} studyInstanceUID
 */
export function addStudyReady(studyInstanceUID) {
    return {
        type: ADD_STUDIES_READY,
        payload: { studyInstanceUID: studyInstanceUID }
    }
}

export function removeStudyReady(studyInstanceUID){
    return {
        type: REMOVE_STUDIES_READY,
        payload: { studyInstanceUID: studyInstanceUID }
    }
}
