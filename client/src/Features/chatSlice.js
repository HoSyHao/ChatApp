import { apiClient } from "@/lib/api-client";
import {
  GET_ALL_MESSAGES_ROUTE,
  GET_CHANNEL_MESSAGES_ROUTE,
  HOST,
  UPLOAD_FILE_ROUTE,
} from "@/Utils/constants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedChatType: undefined,
  selectedChatData: undefined,
  selectedChatMessages: [],
  directMessagesContacts: [],
  showImage: false,
  imageUrl: null,
  loading: false,
  error: null,
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
};

export const getAllMessages = createAsyncThunk(
  "messages/getAllMessages",
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(GET_ALL_MESSAGES_ROUTE, id, {
        withCredentials: true,
      });

      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }

      return response.data.messages;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const getChannelMessages = createAsyncThunk(
  "messages/getChannelMessages",
  async ({ id }, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(
        `${GET_CHANNEL_MESSAGES_ROUTE}/${id}`,

        { withCredentials: true }
      );

      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }

      return response.data.messages;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const uploadFile = createAsyncThunk(
  "messages/uploadFile",
  async (formData, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.post(UPLOAD_FILE_ROUTE, formData, {
        withCredentials: true,
        onUploadProgress: (data) => {
          dispatch(
            setFileUploadProgress(Math.round((100 * data.loaded) / data.total))
          ); //How much % is uploaded
        },
      });

      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }

      return response.data.filePath;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const downloadAFile = createAsyncThunk(
  "messages/downloadFile",
  async (url, { rejectWithValue, dispatch }) => {
    try {
      const response = await apiClient.get(`${HOST}/${url}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const { loaded, total } = progressEvent;
          const percentageCompleted = Math.round((loaded * 100) / total);
          dispatch(setFileDownloadProgress(percentageCompleted));
        },
      });

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

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSelectedChatType: (state, action) => {
      state.selectedChatType = action.payload;
    },
    setSelectedChatData: (state, action) => {
      state.selectedChatData = action.payload;
    },
    closeChat: (state) => {
      state.selectedChatType = undefined;
      state.selectedChatData = undefined;
      state.selectedChatMessages = [];
    },
    setSelectedChatMessages: (state, action) => {
      state.selectedChatMessages = action.payload;
    },
    setDirectMessagesContacts: (state, action) => {
      state.directMessagesContacts = action.payload;
    },
    setShowImage: (state, action) => {
      state.showImage = action.payload;
    },
    setImageUrl: (state, action) => {
      state.imageUrl = action.payload;
    },
    setIsUploading: (state, action) => {
      state.isUploading = action.payload;
    },
    setIsDownloading: (state, action) => {
      state.isDownloading = action.payload;
    },
    setFileUploadProgress: (state, action) => {
      state.fileUploadProgress = action.payload;
    },
    setFileDownloadProgress: (state, action) => {
      state.fileDownloadProgress = action.payload;
    },
    addDirectMessageContact: (state, action) => {
      state.directMessagesContacts.push(action.payload);
    },
    
    addMessage: (state, action) => {
      const message = action.payload;
      const selectedChatType = state.selectedChatType;

      state.selectedChatMessages.push({
        ...message,
        recipient:
          selectedChatType === "channel"
            ? message.recipient
            : message.recipient._id,
        sender:
          selectedChatType === "channel" ? message.sender : message.sender._id,
      });
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedChatMessages = action.payload;
      })
      .addCase(getAllMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(uploadFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(downloadAFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadAFile.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(downloadAFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const {
  setSelectedChatType,
  setSelectedChatData,
  closeChat,
  setSelectedChatMessages,
  setDirectMessagesContacts,
  setImageUrl,
  setShowImage,
  addMessage,
  setIsUploading,
  setIsDownloading,
  setFileDownloadProgress,
  setFileUploadProgress,
  addDirectMessageContact,
} = chatSlice.actions;
export default chatSlice.reducer;
