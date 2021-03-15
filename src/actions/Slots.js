import { ADD_SLOT, RESET_REDUX } from './actionTypes'

/**
 * Add upload slot to Redux slots object
 * @param {Object} uploadSlotObject
 */
export function addSlot(uploadSlotObject) {
    return {
        type: ADD_SLOT,
        payload: uploadSlotObject
    }
}

export function resetRedux(){
    return {
        type: RESET_REDUX
    }
}
