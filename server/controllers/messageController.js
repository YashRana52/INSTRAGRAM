import { Conversation } from "../models/conversation.js";
import { Message } from "../models/message.js";
import { User } from "../models/user.js";
import { getRecieverSocketId, io } from "../socket/socket.js";

// sendMessage controller
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const { textMessage: message } = req.body;

    if (!message || !message.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });
    }

    // Check conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      message,
    });

    conversation.messages.push(newMessage._id);
    await Promise.all([conversation.save(), newMessage.save()]);

    // Log socket emit message real time
    const recieverSocketId = getRecieverSocketId(receiverId);

    if (recieverSocketId) {
      io.to(recieverSocketId).emit("newMessage", newMessage);

      //real time notification
      const sender = await User.findById(senderId).select(
        "username profilePicture",
      );

      const notification = {
        type: "message",
        action: "add",
        userId: senderId,
        userDetails: sender,
        message: `${sender.username} sent you a message`,
      };

      io.to(recieverSocketId).emit("notification", notification);
    }

    return res.status(201).json({ success: true, newMessage });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    // Find the conversation
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json({
        success: true,
        messages: [],
      });
    }

    // Send messages from the conversation
    return res.status(200).json({
      success: true,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "An error occurred",
      error: error.message,
    });
  }
};
