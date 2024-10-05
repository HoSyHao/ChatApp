import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../Features/authSlice'
import chatReducer from '../Features/chatSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
    },
})

export default store