// Import required modules
import { Server } from "socket.io"; // Socket.IO server create karne ke liye
import express from "express";
import { createServer } from "node:http"; // HTTP server create karne ke liye

// Express app create ki
const app = express();

// Express app ko wrap karke HTTP server banaya
// Socket.IO ko direct express pe nahi, HTTP server pe attach karte hain
const server = createServer(app);

// Socket.IO server create kiya
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",

    methods: ["GET", "POST"],
  },
});

// This object will store:
// userId ---> socketId
// Example:
// {
//   "123": "skjdfhsd897",
//   "456": "kjsdhf987sdf"
// }

const userSocketMap = {};

export const getRecieverSocketId = (receiverId) => userSocketMap[receiverId];

// Jab bhi koi new user socket se connect karega
io.on("connection", (socket) => {
  // Frontend se bheja gaya userId handshake query se le rahe hain
  // (frontend me connect karte waqt query me userId bhejna hoga)
  const userId = socket.handshake.query.userId;

  // Agar userId mila to usko map me store kar do
  if (userId) {
    userSocketMap[userId] = socket.id;

    console.log(`User connected: UserId=${userId}, SocketId=${socket.id}`);
  }

  // Sab clients ko updated online users list bhej do
  // Object.keys() se saare userIds mil jayenge
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // DISCONNECT EVENT

  socket.on("disconnect", () => {
    // Agar userId exist karta hai to usko remove kar do
    if (userId) {
      delete userSocketMap[userId];

      console.log(`User disconnected: UserId=${userId}, SocketId=${socket.id}`);
    }

    // Phir se sabko updated online users bhej do
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { app, server, io };
