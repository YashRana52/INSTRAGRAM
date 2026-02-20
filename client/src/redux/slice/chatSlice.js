import { axiosInstance } from "@/lib/axios";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ receiverId, textMessage }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`message/send/${receiverId}`, {
        textMessage,
      });

      return res.data?.newMessage || res.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message",
      );
    }
  },
);

export const getMessages = createAsyncThunk(
  "message/getMessages",
  async (receiverId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/message/all/${receiverId}`);

      return res.data.messages;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch messages",
      );
    }
  },
);

const chatSlice = createSlice({
  name: "chat",

  initialState: {
    onlineUsers: [],
    messages: [],
    loading: false,
  },
  reducers: {
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state) => {
        state.loading = false;
      })

      .addCase(sendMessage.rejected, (state) => {
        state.loading = false;
      })
      .addCase(getMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      //  Success
      .addCase(getMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })

      //  Error
      .addCase(getMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setOnlineUsers, clearMessages, addMessage } = chatSlice.actions;
export default chatSlice.reducer;
