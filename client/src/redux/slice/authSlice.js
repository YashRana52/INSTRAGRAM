import { axiosInstance } from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "sonner";

//user signup
export const signupUser = createAsyncThunk(
  "auth/signup",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/register", data);
      toast.success(res.data.message || res.data || "user login");
      return res.data.user;
    } catch (err) {
      toast.error(err.response.data.message || "Signup failed");
      return rejectWithValue(err.response?.data?.message || "Signup failed");
    }
  },
);
//user login
export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/user/login", data);
      toast.success(res.data.message || res.data || "user login");
      return res.data.user;
    } catch (err) {
      toast.error(err.response.data.message);
      return rejectWithValue(err.response?.data?.message || "Login failed");
    }
  },
);
//user logout
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/user/logout");
      toast.success(res.data.message || res.data || "user logout");
      return res.data.message;
    } catch (err) {
      toast.error(err.response.data.message);
      return rejectWithValue(err.response?.data?.message || "Logout failed");
    }
  },
);

//autheticate user
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/user/me");
      return res.data.user;
    } catch {
      return rejectWithValue(null);
    }
  },
);

//bookmark
export const bookMark = createAsyncThunk(
  "post/bookMark",
  async ({ postId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/post/${postId}/bookmark`);
      toast.success(res.data.message || "Bookmark updated");
      return { postId, type: res.data.type };
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to bookmark");
      return rejectWithValue(
        err.response?.data?.message || "Failed to bookmark",
      );
    }
  },
);
export const getSuggestedUsers = createAsyncThunk(
  "user/suggestedUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/user/suggested`);

      return res.data.users;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to get suggested users",
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to get suggested users",
      );
    }
  },
);
export const getProfile = createAsyncThunk(
  "user/getProfile",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/user/${userId}/profile`);

      return res.data.user;
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to get suggested users",
      );
      return rejectWithValue(
        err.response?.data?.message || "Failed to get suggested users",
      );
    }
  },
);

export const editProfileThunk = createAsyncThunk(
  "user/editProfile",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("user/profile/edit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(response.data.message || "Profile updated");
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed",
      );
    }
  },
);

export const followOrUnfollowUser = createAsyncThunk(
  "user/followOrUnfollow",
  async (targetUserId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        `/user/followorunfollow/${targetUserId}`,
      );
      toast.success(response.data.message || response.data);
      return {
        targetUserId,
        message: response.data.message,
        success: response.data.success,
      };
    } catch (error) {
      toast.error(
        error.response.data.message || "failed to follow or unfollow",
      );
      return rejectWithValue(
        error.response?.data?.message || "Failed to follow/unfollow user",
      );
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    authChecked: false,
    bookmarks: [],
    suggestedUsers: [],
    userProfile: null,
    selectedUser: null,
    fetched: false,
    followLoading: false,
  },
  reducers: {
    clearSuggestedUsers: (state) => {
      state.suggestedUsers = [];
    },
    clearBookmarks: (state) => {
      state.bookmarks = [];
    },
    resetAuthCheck: (state) => {
      state.authChecked = false;
    },
    clearProfileState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.authChecked = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authChecked = true;
      })

      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // auto-login after signup
        state.authChecked = true;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.authChecked = true;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.authChecked = true;
        state.bookmarks = action.payload?.bookmarks || [];
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.authChecked = true;
      })
      //bookmark
      .addCase(bookMark.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookMark.fulfilled, (state, action) => {
        state.loading = false;
        const { postId, type } = action.payload;

        if (type === "saved") {
          // add postId if not already in bookmarks
          if (!state.bookmarks.includes(postId)) state.bookmarks.push(postId);
        } else if (type === "unsaved") {
          // remove postId from bookmarks
          state.bookmarks = state.bookmarks.filter((id) => id !== postId);
        }
      })
      .addCase(bookMark.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to bookmark";
      })
      //suggested users
      .addCase(getSuggestedUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(getSuggestedUsers.fulfilled, (state, action) => {
        state.suggestedUsers = action.payload;
        state.loading = false;
        state.fetched = true;
      })

      //
      .addCase(getSuggestedUsers.rejected, (state, action) => {
        state.loading = false;
        state.fetched = true;
        state.error = action.payload;
      })
      //user profile by id
      .addCase(getProfile.fulfilled, (state, action) => {
        state.userProfile = action.payload;
      })
      //edit profile
      .addCase(editProfileThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })

      //  Fulfilled
      .addCase(editProfileThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.success = true;
      })

      //  Rejected
      .addCase(editProfileThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      .addCase(followOrUnfollowUser.fulfilled, (state, action) => {
        state.followLoading = false;

        const { targetUserId } = action.payload;

        const isAlreadyFollowing = state.user.following.includes(targetUserId);

        // Update logged in user's following
        if (isAlreadyFollowing) {
          state.user.following = state.user.following.filter(
            (id) => id !== targetUserId,
          );
        } else {
          state.user.following.push(targetUserId);
        }

        // Update profile followers count instantly
        if (state.userProfile?._id === targetUserId) {
          if (isAlreadyFollowing) {
            state.userProfile.followers = state.userProfile.followers.filter(
              (id) => id !== state.user._id,
            );
          } else {
            state.userProfile.followers.push(state.user._id);
          }
        }
      });
  },
});

export const {
  clearSuggestedUsers,
  setSelectedUser,
  clearBookmarks,
  clearSelectedUser,
} = authSlice.actions;

export default authSlice.reducer;
