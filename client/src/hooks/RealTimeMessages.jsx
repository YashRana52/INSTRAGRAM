import { addMessage } from "@/redux/slice/chatSlice";
import { getSocket } from "@/socket";
import { useEffect } from "react";
import { useDispatch } from "react-redux";

export const useGetRTM = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      console.log("📩 newMessage received:", newMessage);
      dispatch(addMessage(newMessage));
    });

    return () => {
      socket.off("newMessage");
    };
  }, [dispatch]);
};
