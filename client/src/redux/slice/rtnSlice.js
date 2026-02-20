import { createSlice } from "@reduxjs/toolkit";

const rtnSlice = createSlice({
  name: "realTimeNotification",
  initialState: {
    likeNotification: [],
    messageNotifications: [],
  },
  reducers: {
    setLikeNotification: (state, action) => {
      const { type, action: actionType, userId } = action.payload;

      if (actionType === "add") {
        state.likeNotification.unshift(action.payload);
      }

      if (actionType === "remove") {
        state.likeNotification = state.likeNotification.filter(
          (item) => !(item.userId === userId && item.type === type),
        );
      }
    },
    addMessageNotification: (state, action) => {
      state.messageNotifications.unshift(action.payload);
    },
  },
});

export const { setLikeNotification, addMessageNotification } = rtnSlice.actions;
export default rtnSlice.reducer;
