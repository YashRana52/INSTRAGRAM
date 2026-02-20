import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (userId) => {
  if (!socket) {
    socket = io("http://localhost:3000", {
      query: { userId },
    });
  }
  return socket;
};

export const getSocket = () => socket;
