import { ADD_SLOT, SET_USED_SLOT, SET_NOT_USED_SLOT } from '../actions/actionTypes'

const initialState = {
    visits: {}
}

export default function SlotsReducer(state = initialState, action) {

    switch (action.type) {

        case ADD_SLOT:
            // Add visit to reducer
            const visitObject = action.payload
            return {
                visits: {
                    ...state.visits,
                    [visitObject.slotID]: { ...visitObject }
                }
            }

        case SET_USED_SLOT:
            const slotID = action.payload.slotID
            // Set used state of given visit
            const studyInstanceUID = action.payload.studyInstanceUID

            return {
                visits: {
                    ...state.visits,
                    [slotID]: {
                        ...state.visits[slotID],
                        studyInstanceUID: studyInstanceUID
                    }
                }
            }

        case SET_NOT_USED_SLOT:
            const slotID2 = action.payload.slotID

            return {
                visits: {
                    ...state.visits,
                    [slotID2]: {
                        ...state.visits[slotID2],
                        studyInstanceUID: undefined
                    }
                }
            }

        default:
            return state
    }
}
