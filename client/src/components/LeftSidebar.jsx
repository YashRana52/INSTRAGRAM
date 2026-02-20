import {
  Heart,
  Home,
  LogOut,
  MessageCircle,
  PlusSquare,
  Search,
  TrendingUp,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  clearBookmarks,
  clearSuggestedUsers,
  logoutUser,
} from "@/redux/slice/authSlice";
import CreatePost from "./CreatePost";
import { clearPosts } from "@/redux/slice/postSlice";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";

function LeftSidebar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const { likeNotification, messageNotifications } = useSelector(
    (state) => state.realTimeNotification,
  );

  //logout handle
  const logoutHandler = async () => {
    dispatch(logoutUser());
    dispatch(clearPosts());
    dispatch(clearSuggestedUsers());
    dispatch(clearBookmarks());
  };

  //sidebar handler
  const sidebarHandler = (textType) => {
    if (textType === "Log Out") {
      logoutHandler();
    } else if (textType === "Home") {
      navigate("/");
    } else if (textType === "Create") {
      setOpen(true);
    } else if (textType === "Profile") {
      navigate(`profile/${user._id}`);
    } else if (textType === "Messages") {
      navigate(`chat`);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const sidebarItems = [
    { id: 1, icon: <Home size={28} />, text: "Home" },
    { id: 2, icon: <Search size={28} />, text: "Search" },
    { id: 3, icon: <TrendingUp size={28} />, text: "Explore" },
    { id: 4, icon: <MessageCircle size={28} />, text: "Messages" },
    { id: 5, icon: <Heart size={28} />, text: "Notifications" },
    { id: 6, icon: <PlusSquare size={28} />, text: "Create" },
    {
      id: 7,
      icon: (
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={user?.profilePicture || "https://github.com/shadcn.png"}
            alt="User Avatar"
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      ),
      text: "Profile",
    },
    { id: 8, icon: <LogOut size={28} />, text: "Log Out" },
  ];

  return (
    <div className="fixed top-0 left-0 z-30 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center text-white font-bold text-lg shadow">
            D
          </div>

          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Dash<span className="text-pink-600">X</span>
          </h1>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => (
          <div
            onClick={() => sidebarHandler(item.text)}
            key={item.id}
            className={`relative flex items-center gap-4 px-4 py-3 rounded-xl text-[15px] font-medium cursor-pointer transition-all duration-200
          ${
            item.active
              ? "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700"
              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          }
        `}
          >
            {/* Active Indicator */}
            {item.active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-pink-500 to-purple-500" />
            )}

            {/* Icon */}
            <div
              className={`w-5 h-5 flex items-center justify-center transition-colors
            ${item.active ? "text-pink-600" : "text-gray-400"}
          `}
            >
              {item.icon}
            </div>

            <span>{item.text}</span>
            {item.text === "Notifications" && likeNotification.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="rounded-full h-5 w-5 absolute bottom-6 left-6 bg-red-600 hover:bg-red-700"
                    size="icon"
                  >
                    {likeNotification.length}
                  </Button>
                </PopoverTrigger>

                <PopoverContent>
                  <div>
                    {likeNotification.length === 0 ? (
                      <p>No new notification</p>
                    ) : (
                      likeNotification.map((notification) => (
                        <div
                          key={notification.userId}
                          className="flex items-center gap-2 mb-2"
                        >
                          <Avatar>
                            <AvatarImage
                              src={notification.userDetails?.profilePicture}
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>
                          <p className="text-sm">
                            <span className="font-bold">
                              {notification.userDetails?.username}
                            </span>{" "}
                            {notification.type === "like" && "liked your post"}
                            {notification.type === "follow" &&
                              "started following you"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}

            {item.text === "Messages" && messageNotifications?.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className="rounded-full h-5 w-5 absolute bottom-6 left-6 bg-red-600 hover:bg-red-700"
                    size="icon"
                  >
                    {messageNotifications.length}
                  </Button>
                </PopoverTrigger>

                <PopoverContent>
                  <div>
                    {messageNotifications?.length === 0 ? (
                      <p>No new messages</p>
                    ) : (
                      messageNotifications.map((notification, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 mb-2"
                        >
                          <Avatar>
                            <AvatarImage
                              src={notification.userDetails?.profilePicture}
                            />
                            <AvatarFallback>CN</AvatarFallback>
                          </Avatar>

                          <p className="text-sm">
                            <span className="font-bold">
                              {notification.userDetails?.username}
                            </span>{" "}
                            sent you a message
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        ))}
      </div>
      <CreatePost open={open} setOpen={setOpen} />
    </div>
  );
}

export default LeftSidebar;
