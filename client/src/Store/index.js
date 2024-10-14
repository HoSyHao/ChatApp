import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../Features/authSlice'
import contactsReducer from '../Features/contactsSlice'
import chatReducer from '../Features/chatSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        contacts: contactsReducer,
        chat: chatReducer,
    },
   
})

export default store