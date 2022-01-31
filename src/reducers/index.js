import { combineReducers } from 'redux'
import Slots from './Slots'


const appReducer = combineReducers({
    Slots
})

const rootReducer = (state, action) => {
    if (action.type === 'RESET_REDUX') {
        state = undefined
    }

    return appReducer(state, action)
}

export default rootReducer
