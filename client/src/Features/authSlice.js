import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { apiClient } from "@/lib/api-client.js";
import {
  SIGNUP_ROUTE,
  SIGNIN_ROUTE,
  FORGET_ROUTE,
  VERIFY_ROUTE,
  RESETP_ROUTE,
  LOGOUT_ROUTE,
  UPDATE_PROFILE_ROUTE,
  UPLOAD_IMAGE_ROUTE,
  DELETE_IMAGE_ROUTE,
} from "@/Utils/constants.js";

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  status: "idle",
  error: null,
  formType: "login",
  initialValues: { email: "", password: "" },
  submitButtonText: "Login",
  alertDialogOpen: false,
  hovered: false,
  image: null,
  firstName: "",
  lastName: "",
  selectedColor: null,
  tempImage: null,
  isImageDeleted: false,
};

export const signin = createAsyncThunk(
  "auth/signin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        SIGNIN_ROUTE,
        { email, password },
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

export const signup = createAsyncThunk(
  "auth/signup",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        { email, password },
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

export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async ({ email }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(FORGET_ROUTE, { email }, { withCredentials: true });
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

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(RESETP_ROUTE + `${token}`, {
        password,
      }, { withCredentials: true });
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

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(LOGOUT_ROUTE, { withCredentials: true });
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

export const verify = createAsyncThunk(
  "auth/verify",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get("token", { withCredentials: true });
      const response = await apiClient.get(VERIFY_ROUTE, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.status === false) {
        return rejectWithValue(response.data.message);
      }
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Something went wrong"
      );
    }
  }
);

export const updateProfile = createAsyncThunk(
  "auth/updateProfile",
  async (
    { firstName, lastName, color: selectedColor },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post(
        UPDATE_PROFILE_ROUTE,
        { firstName, lastName, color: selectedColor },
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

export const uploadImage = createAsyncThunk(
  "auth/uploadImage",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await apiClient.post(UPLOAD_IMAGE_ROUTE, formData, {
        withCredentials: true,
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

export const deleteImage = createAsyncThunk(
  "auth/deleteImage",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.delete(DELETE_IMAGE_ROUTE, {
        withCredentials: true,
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


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUserInfo: (state, action) => {
      state.user = action.payload;
    },
    openAlertDialog: (state) => {
      state.alertDialogOpen = true;
    },
    closeAlertDialog: (state) => {
      state.alertDialogOpen = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearStatus: (state) => {
      state.status = null;
    },
    setLoginForm: (state) => {
      state.formType = "login";
      state.initialValues = { email: "", password: "" };
      state.submitButtonText = "Login";
    },
    setRegisterForm: (state) => {
      state.formType = "register";
      state.initialValues = { email: "", password: "", confirmPassword: "" };
      state.submitButtonText = "Register";
    },
    setForgotPasswordForm: (state) => {
      state.formType = "forgotPassword";
      state.initialValues = { email: "" };
      state.submitButtonText = "Send Reset Link";
    },
    setResetPasswordForm: (state) => {
      state.formType = "resetPassword";
      state.initialValues = { password: "" };
      state.submitButtonText = "Reset";
    },
    setHovered: (state, action) => {
      state.hovered = action.payload;
    },
    setImage: (state, action) => {
      state.image = action.payload;
    },
    setFirstName: (state, action) => {
      state.firstName = action.payload;
    },
    setLastName: (state, action) => {
      state.lastName = action.payload;
    },
    setSelectedColor: (state, action) => {
      state.selectedColor = action.payload;
    },
    setTempImage: (state, action) => {
      state.tempImage = action.payload;
    },
    setIsImageDeleted: (state, action) => {
      state.isImageDeleted = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      // Signin
      .addCase(signin.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Access Denied! Invalid Credentials";
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.status = "loading";
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Sign Up Failed";
      })
      // Forgot Password
      .addCase(forgotPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.alertDialogOpen = true;
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to send reset email";
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.status = "loading";
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.status = "succeeded";
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to reset password";
      })
      // Logout
      .addCase(logout.pending, (state) => {
        state.status = "loading";
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = "succeeded";
        state.user = null;
        localStorage.removeItem("user");
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to logout";
      })
      // Verify
      .addCase(verify.pending, (state) => {
        state.status = "loading";
      })
      .addCase(verify.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        localStorage.setItem("user", JSON.stringify(action.payload));
        state.error = null;
      })
      .addCase(verify.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to verify";
      })
      //Profile Update
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to update profile";
      })
      // Upload Image
      .addCase(uploadImage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadImage.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.image = action.payload.image;
        state.error = null;
      })
      .addCase(uploadImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to upload image";
      })
      // Delete Image
      .addCase(deleteImage.pending, (state) => {
        state.status = "loading";
      })
      .addCase(deleteImage.fulfilled, (state) => {
        state.status = "succeeded";
        state.image = null;
        state.error = null;
      })
      .addCase(deleteImage.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to delete image";
      });
  },
});

export const {
  closeAlertDialog,
  openAlertDialog,
  clearError,
  clearStatus,
  setLoginForm,
  setRegisterForm,
  setForgotPasswordForm,
  setResetPasswordForm,
  setHovered,
  setImage,
  setFirstName,
  setLastName,
  setSelectedColor,
  setUserInfo,
  setTempImage,
  setIsImageDeleted,
} = authSlice.actions;
export default authSlice.reducer;
