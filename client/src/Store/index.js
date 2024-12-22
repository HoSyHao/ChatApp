import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../Features/authSlice'
import contactsReducer from '../Features/contactsSlice'
import chatReducer from '../Features/chatSlice'
import callReducer from '../Features/callSlice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        contacts: contactsReducer,
        chat: chatReducer,
        call: callReducer,
    },
   
})

export default store