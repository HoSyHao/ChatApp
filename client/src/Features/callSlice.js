// callSlice.js
import { createSlice } from '@reduxjs/toolkit';

const callSlice = createSlice({
  name: 'call',
  initialState: {
    isCalling: false,
    callAccepted: false,
    remoteStream: null,
    callerSignal: null,
    calleeSignal: null,
  },
  reducers: {
    setCalling(state, action) {
      state.isCalling = action.payload;
    },
    setCallAccepted(state, action) {
      state.callAccepted = action.payload;
    },
    setRemoteStream(state, action) {
      state.remoteStream = action.payload;
    },
    setCallerSignal(state, action) {
      state.callerSignal = action.payload;
    },
    setCalleeSignal(state, action) {
      state.calleeSignal = action.payload;
    },
  },
});

export const {
  setCalling,
  setCallAccepted,
  setRemoteStream,
  setCallerSignal,
  setCalleeSignal,
} = callSlice.actions;

export default callSlice.reducer;
