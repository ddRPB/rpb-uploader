import { ADD_SLOT, SET_USED_SLOT, SET_NOT_USED_SLOT } from '../actions/actionTypes'

const initialState = {
    slots: {}
}

export default function SlotsReducer(state = initialState, action) {

    switch (action.type) {

        case ADD_SLOT:
            // Add visit to reducer
            const slotObject = action.payload
            return {
                slots: {
                    ...state.slots,
                    [slotObject.slotID]: { ...slotObject }
                }
            }

        case SET_USED_SLOT:
            const slotID = action.payload.slotID
            // Set used state of given visit
            const studyInstanceUID = action.payload.studyInstanceUID

            return {
                slots: {
                    ...state.slots,
                    [slotID]: {
                        ...state.slots[slotID],
                        studyInstanceUID: studyInstanceUID
                    }
                }
            }

        case SET_NOT_USED_SLOT:
            const slotID2 = action.payload.slotID

            return {
                slots: {
                    ...state.slots,
                    [slotID2]: {
                        ...state.slots[slotID2],
                        studyInstanceUID: undefined
                    }
                }
            }

        default:
            return state
    }
}
