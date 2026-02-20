import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slice/authSlice";
import postSlice from "./slice/postSlice";

import chatSlice from "./slice/chatSlice";
import rtnSlice from "./slice/rtnSlice";

const store = configureStore({
  reducer: {
    auth: authSlice,
    post: postSlice,

    chat: chatSlice,
    realTimeNotification: rtnSlice,
  },
});

export default store;
