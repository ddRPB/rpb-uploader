import { combineReducers } from 'redux'

import Series from './Series'
import Studies from './Studies'
import DisplayTables from './DisplayTables'
import Warnings from './Warnings'
import WarningsStudy from './WarningsStudy'
import Slots from './Slots'

const appReducer =  combineReducers({
    Series,
    Studies,
    DisplayTables,
    Warnings,
    WarningsStudy,
    Slots
})

const rootReducer = (state, action) => {
    if (action.type === 'RESET_REDUX') {
        state = undefined
    }

    return appReducer(state, action)
}

export default rootReducer
