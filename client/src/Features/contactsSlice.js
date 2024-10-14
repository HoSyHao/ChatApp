import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api-client.js";
import {
  CREATE_CHANNEL_ROUTE,
  GET_ALL_CONTACTS_ROUTE,
  GET_CONTACTS_FOR_DM_ROUTE,
  GET_USER_CHANNELS_ROUTE,
  SEARCH_CONTACTS_ROUTE,
} from "@/Utils/constants";
import { setDirectMessagesContacts } from "./chatSlice";

const initialState = {
  message: "",
  emojiPickerOpen: false,
  openContactModal: false,
  searchedContacts: [],
  allContacts: [],
  selectedContacts: [],
  channelName: "",
  newChannelModal: false,
  channels: [],
};

export const searchContacts = createAsyncThunk(
  "contacts/searchContacts",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        SEARCH_CONTACTS_ROUTE,
        { searchTerm },
        { withCredentials: true }
      );

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

export const getContactsForDMList = createAsyncThunk(
  "contacts/getContactsForDMList",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(GET_CONTACTS_FOR_DM_ROUTE, {
        withCredentials: true,
      });

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

export const getUserChannel = createAsyncThunk(
  "contacts/getUserChannel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(GET_USER_CHANNELS_ROUTE, {
        withCredentials: true,
      });

      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }

      return response.data.channels;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const getAllContacts = createAsyncThunk(
  "contacts/getAllContacts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(GET_ALL_CONTACTS_ROUTE, {
        withCredentials: true,
      });

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

export const createChannel = createAsyncThunk(
  "contacts/createChannel",
  async (channelName, { rejectWithValue, getState }) => {
    try {
      const state = getState().contacts;
      const response = await apiClient.post(
        CREATE_CHANNEL_ROUTE,
        {
          name: channelName,
          members: state.selectedContacts.map((contact) => contact.value),
        },
        { withCredentials: true }
      );

      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const addContactInDMContact = createAsyncThunk(
  "contacts/addContactInDMContact",
  (message, { getState, dispatch }) => {
    const state = getState();
    const user = state.auth.user;

    if (!user) {
      console.error("User is undefined");
      return;
    }

    const userId = user.id;
    const fromId = message.sender._id === userId ? message.recipient._id : message.sender._id;
    const fromData = message.sender._id === userId ? message.recipient : message.sender;

    // Lấy danh sách liên hệ hiện tại từ chatSlice
    const dmContacts = [...state.chat.directMessagesContacts];

    // Tìm kiếm vị trí liên hệ trong danh sách
    const index = dmContacts.findIndex(contact => contact._id === fromId);

    if (index !== -1 && index !== undefined) {
      // Nếu liên hệ đã tồn tại, di chuyển nó lên đầu danh sách
      const data = dmContacts[index];
      dmContacts.splice(index, 1); // Xóa liên hệ tại vị trí hiện tại
      dmContacts.unshift(data); // Thêm lại vào đầu mảng
    } else {
      // Nếu liên hệ không tồn tại, thêm mới vào đầu mảng
      dmContacts.unshift(fromData);
    }

    // Dispatch một action để cập nhật lại state trong chatSlice
    dispatch(setDirectMessagesContacts(dmContacts));
  }
);


const contactsSlice = createSlice({
  name: "contacts",
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
    setAllContacts: (state, action) => {
      state.allContacts = action.payload;
    },
    setSelectedContacts: (state, action) => {
      state.selectedContacts = action.payload;
    },
    setChannelName: (state, action) => {
      state.channelName = action.payload;
    },
    setNewChannelModal: (state, action) => {
      state.newChannelModal = action.payload;
    },
    setChannels: (state, action) => {
      state.channels = action.payload;
    },
    addChannel: (state, action) => {
      const channel = action.payload;
      state.channels = [channel, ...state.channels]; // Thêm channel mới vào đầu danh sách kênh
    },
    addChannelInChannelList: (state, action) => {
      const message = action.payload;
      const channels = state.channels;
      const data = channels.find(
        (channel) => channel._id === message.channelId
      );
      const index = channels.findIndex(
        (channel) => channel._id === message.channelId
      );
      if (index !== -1 && index !== undefined) {
        channels.splice(index, 1);
        channels.unshift(data);
      }
    },
    
    
    
  },
});

export const {
  setMessage,
  setEmojiPickerOpen,
  setOpenContactModal,
  setSearchedContacts,
  setAllContacts,
  setSelectedContacts,
  setChannelName,
  setNewChannelModal,
  setChannels,
  addChannel,
  addChannelInChannelList,
  
} = contactsSlice.actions;

export default contactsSlice.reducer;
