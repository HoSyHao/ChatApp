import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client.js";
import { SEARCH_CONTACTS_ROUTE } from "@/Utils/constants";

const initialState ={
    message: "",
    emojiPickerOpen: false,
    openContactModal: false,
    searchedContacts: [],
}

export const searchContacts = createAsyncThunk(
  "chat/searchContacts",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        SEARCH_CONTACTS_ROUTE,
        { searchTerm },
        { withCredentials: true }
      );

      console.log("API response:", response.data);

      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }

      return response.data.contacts;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
      setMessage: (state, action) => {
        state.message = action.payload;
      },
      setEmojiPickerOpen: (state, action) => {
        state.emojiPickerOpen = action.payload;
      },
      setOpenContactModal: (state, action) => {
        state.openContactModal = action.payload;
      },
      setSearchedContacts: (state, action) => {
        state.searchedContacts = action.payload;
      },
    }
});

export const {
    setMessage,
    setEmojiPickerOpen,
    setOpenContactModal,
    setSearchedContacts,
} = chatSlice.actions;

export default chatSlice.reducer;