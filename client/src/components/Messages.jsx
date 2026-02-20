import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";

import { MessageCircle, User } from "lucide-react";

import { formatDateReadable } from "./date/date";
import { getMessages } from "@/redux/slice/chatSlice";

function Messages({ selectedUser }) {
  const { user } = useSelector((state) => state.auth);
  const { messages } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      dispatch(getMessages(selectedUser._id));
    }
  }, [selectedUser, dispatch]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gradient-to-b from-gray-50/50 to-white">
        <MessageCircle className="w-16 h-16 mb-4 opacity-40 stroke-[1.5]" />
        <p className="text-lg font-medium text-gray-600">
          Select a conversation
        </p>
        <p className="text-sm mt-2">Start chatting with your friends</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50/40 overflow-hidden">
      {/* Messages area*/}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 bg-gradient-to-b from-gray-50/30 to-transparent">
        {messages.map((msg) => {
          const isMe = msg.senderId === user._id;
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
            >
              {/* Avatar & message */}
              {!isMe && (
                <Avatar className="h-8 w-8 mt-1.5 mr-2.5 flex-shrink-0 opacity-90">
                  <AvatarImage src={selectedUser.profilePicture} />
                  <AvatarFallback className="text-xs bg-muted">
                    {selectedUser.username?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`
              max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm
              transition-all duration-150
              ${
                isMe
                  ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-none"
                  : "bg-white border border-gray-200 rounded-bl-none"
              }
            `}
              >
                <p className="text-[15px] leading-relaxed break-words">
                  {msg.message}
                </p>
                <span
                  className={`text-xs mt-1.5 block opacity-70 ${isMe ? "text-indigo-100" : "text-gray-500"}`}
                >
                  {formatDateReadable(msg.createdAt)}
                </span>
              </div>

              {isMe && (
                <Avatar className="h-8 w-8 mt-1.5 ml-2.5 flex-shrink-0 opacity-90">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="text-xs">
                    {user.username?.slice(0, 2).toUpperCase() || "ME"}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

export default Messages;
