import React, { useEffect } from "react";

import Signup from "./components/Signup";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Home from "./components/Home";
import Profile from "./components/Profile";
import { loadUser } from "./redux/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Loader2 } from "lucide-react";
import EditProfile from "./components/EditProfile";
import ChatPage from "./components/ChatPage";

import { setOnlineUsers } from "./redux/slice/chatSlice";
import {
  addMessageNotification,
  setLikeNotification,
} from "./redux/slice/rtnSlice";
import { connectSocket } from "./socket";

function App() {
  const dispatch = useDispatch();
  const { authChecked, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(loadUser());
  }, [dispatch]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = connectSocket(user._id);

    // online users
    socket.on("getOnlineUsers", (onlineUsers) => {
      dispatch(setOnlineUsers(onlineUsers));
    });

    // notifications
    socket.on("notification", (notification) => {
      if (notification.type === "message") {
        dispatch(addMessageNotification(notification));
      } else {
        dispatch(setLikeNotification(notification));
      }
    });

    return () => {
      socket.off("getOnlineUsers");
      socket.off("notification");
      socket.disconnect();
    };
  }, [user]);

  if (!authChecked) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Auth Routes */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Home Page */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/account/edit" element={<EditProfile />} />
          <Route path="/chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
