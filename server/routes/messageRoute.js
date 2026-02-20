import express from "express";
import isAuthenticated from "../middlewares/auth.js";
import { getMessage, sendMessage } from "../controllers/messageController.js";

const messageRouter = express.Router();

// Send a message
messageRouter.post("/send/:id", isAuthenticated, sendMessage);

// Get all messages of a conversation
messageRouter.get("/all/:id", isAuthenticated, getMessage);

export default messageRouter;
