// Manage IDs, selected study, warnings
import { ADD_SERIES } from '../actions/actionTypes'

const initialState = {
    series: {}
}

export default function SeriesReducer (state = initialState, action) {
    switch (action.type) {

        case ADD_SERIES:
            // Add Series to reducer
            const seriesObject = action.payload
            return {
                series: {
                    ...state.series,
                    [seriesObject.seriesInstanceUID]: { ...seriesObject }
                }
            }

        default:
            return state
    }
}
