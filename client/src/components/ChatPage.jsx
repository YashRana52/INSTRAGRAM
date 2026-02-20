import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  clearSelectedUser,
  getSuggestedUsers,
  setSelectedUser,
} from "@/redux/slice/authSlice";
import { MessageCircle, Send, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import Messages from "./Messages";
import EmojiPicker from "emoji-picker-react";
import {
  clearMessages,
  getMessages,
  sendMessage,
} from "@/redux/slice/chatSlice";
import { useGetRTM } from "@/hooks/RealTimeMessages";
import { Link } from "react-router-dom";

function ChatPage() {
  const [textMessage, setTextMessage] = useState("");
  const { user, suggestedUsers, selectedUser, loading, fetched } = useSelector(
    (state) => state.auth,
  );
  useGetRTM();

  const { onlineUsers } = useSelector((state) => state.chat);
  const dispatch = useDispatch();
  const [showEmoji, setShowEmoji] = useState(false);
  const emojiRef = useRef(null);

  const onEmojiClick = (emojiObject) => {
    setTextMessage((prev) => prev + emojiObject.emoji);
  };

  const sendMessageHandler = async (receiverId) => {
    if (!textMessage.trim()) return;
    console.log("Sending message to:", receiverId, textMessage);

    await dispatch(sendMessage({ receiverId, textMessage }));

    await dispatch(getMessages(receiverId));

    setTextMessage("");
  };
  const isOnline = selectedUser?._id
    ? onlineUsers.includes(selectedUser._id)
    : false;

  useEffect(() => {
    return () => {
      dispatch(clearMessages());
      dispatch(clearSelectedUser());
    };
  }, [dispatch]);

  // User change pe messages load
  useEffect(() => {
    if (!selectedUser?._id) return;

    dispatch(clearMessages());
    dispatch(getMessages(selectedUser._id));
  }, [selectedUser, dispatch]);

  useEffect(() => {
    if (!fetched && !loading) {
      dispatch(getSuggestedUsers());
    }
  }, [fetched, loading]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        setShowEmoji(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex ml-[16%] h-screen bg-gray-50/40">
      <section
        className="w-full md:w-80 lg:w-72 xl:w-80 
  bg-white border-r border-gray-100 
  shadow-sm flex flex-col h-screen"
      >
        {/* Header */}
        <div className="px-5 py-6 border-b border-gray-100">
          <h1 className="font-bold text-xl tracking-tight text-gray-900">
            {user?.username || "Messages"}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5 font-medium">
            Recent conversations
          </p>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          {suggestedUsers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="p-5 rounded-full bg-gray-50 mb-4">
                <MessageCircle className="w-10 h-10 opacity-40" />
              </div>
              <p className="text-sm font-medium">No conversations yet</p>
              <p className="text-xs mt-1.5 text-gray-400">
                Start a new message to begin chatting
              </p>
            </div>
          ) : (
            suggestedUsers.map((u) => {
              const isSelected = selectedUser?._id === u._id;
              const online = onlineUsers.includes(u._id);

              return (
                <div
                  key={u._id}
                  onClick={() => dispatch(setSelectedUser(u))}
                  className={`
              group relative flex items-center gap-3.5 
              px-4 py-3.5 rounded-xl cursor-pointer
              transition-all duration-200 ease-out
              ${
                isSelected
                  ? "bg-indigo-50/80 border border-indigo-100 shadow-sm"
                  : "hover:bg-gray-50 active:bg-gray-100"
              }
            `}
                >
                  {/* Avatar + status */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 border border-gray-200/70 shadow-sm">
                      <AvatarImage src={u.profilePicture} alt={u.username} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-semibold text-lg">
                        {u.username?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>

                    {online && (
                      <span
                        className="absolute bottom-0.5 right-0.5 
                  h-3.5 w-3.5 rounded-full bg-green-500 
                  ring-2 ring-white ring-offset-1 
                  shadow-sm"
                      />
                    )}
                  </div>

                  {/* Name + status text */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between">
                      <span
                        className={`
                  font-medium text-gray-900 truncate
                  ${isSelected ? "font-semibold" : "group-hover:font-medium"}
                `}
                      >
                        {u.username}
                      </span>
                    </div>

                    <p
                      className={`
                text-xs mt-0.5 font-medium tracking-wider
                ${online ? "text-green-600" : "text-red-500"}
              `}
                    >
                      {online ? "Online" : "Offline"}
                    </p>
                  </div>

                  {/* Optional subtle indicator for selected */}
                  {isSelected && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Right chat area */}
      {selectedUser ? (
        <section className="flex-1 border-l border-l-gray-200 flex flex-col h-full bg-white">
          <div className="flex-shrink-0 border-b bg-white/80 backdrop-blur-sm px-5 py-3.5 flex items-center gap-3.5 shadow-sm">
            <div className="relative">
              <Avatar className="h-11 w-11 border border-gray-200/70 shadow-sm">
                <AvatarImage
                  src={selectedUser.profilePicture}
                  alt={selectedUser.username}
                />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white font-semibold">
                  {selectedUser.username?.slice(0, 2).toUpperCase() || "US"}
                </AvatarFallback>
              </Avatar>
              {isOnline && (
                <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-white ring-offset-1 shadow" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {selectedUser.username}
              </h3>
              <p className="text-xs text-gray-500 font-medium">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>

            <Link to={`/profile/${selectedUser._id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-gray-700 hover:text-gray-900"
              >
                <User className="h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30">
            <Messages selectedUser={selectedUser} />
          </div>

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={textMessage}
                  onChange={(e) => setTextMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="
        w-full bg-gray-100/70
        border border-gray-200
        rounded-full px-5 py-3 pr-12 text-base
        focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20
        transition-all duration-200
      "
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (textMessage.trim()) {
                        sendMessageHandler(selectedUser?._id);
                      }
                    }
                  }}
                />

                {/* Emoji Button */}
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xl"
                  onClick={() => setShowEmoji(!showEmoji)}
                >
                  😀
                </button>

                {/* Emoji Picker */}
                {showEmoji && (
                  <div
                    ref={emojiRef}
                    className="absolute bottom-full right-0 mb-2 z-50"
                  >
                    <EmojiPicker
                      onEmojiClick={onEmojiClick}
                      height={350}
                      width={300}
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  if (textMessage.trim()) {
                    sendMessageHandler(selectedUser?._id);
                  }
                }}
                size="icon"
                className="h-11 w-11 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-md"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-gradient-to-b from-gray-50 to-white">
          <MessageCircle className="w-24 h-24 mb-6 text-gray-300 stroke-1" />
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">
            Your messages
          </h1>
          <p className="text-gray-500 max-w-md">
            Send a message to start a chat or tap on someone from your list on
            the left.
          </p>
        </div>
      )}
    </div>
  );
}

export default ChatPage;
