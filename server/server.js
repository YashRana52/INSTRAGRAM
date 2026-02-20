import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express, { urlencoded } from "express";
import connectDB from "./utils/db.js";
import userRouter from "./routes/userRoute.js";
import postRouter from "./routes/postRoute.js";
import messageRouter from "./routes/messageRoute.js";
import { app, server } from "./socket/socket.js";

//middleware
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "I am coming from backend",
    success: true,
  });
});

const PORT = process.env.PORT || 4000;

// API Routes
app.use("/api/v1/user", userRouter);
app.use("/api/v1/post", postRouter);
app.use("/api/v1/message", messageRouter);

server.listen(PORT, () => {
  connectDB();
  console.log(`Server listening at http://localhost:${PORT}`);
});
