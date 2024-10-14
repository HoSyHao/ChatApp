/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { HOST } from "@/Utils/constants";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";

import { createContext, useContext, useEffect, useRef } from "react";
import { addMessage } from "@/Features/chatSlice";
import { addChannelInChannelList, addContactInDMContact } from "@/Features/contactsSlice";
import store from "@/Store";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const socket = useRef();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      socket.current = io(HOST, {
        withCredentials: true,
        query: {
          userId: user.id,
        },
      });

      socket.current.on("connect", () => {
        console.log("Socket connected:", socket.current.id); // Kiểm tra khi socket kết nối
      });

      const handleRecieveMessage = (message) => {
        const { selectedChatData, selectedChatType } = store.getState().chat;

        if (
          selectedChatType !== undefined &&
          (selectedChatData._id === message.sender._id ||
            selectedChatData._id === message.recipient._id)
        ) {
          store.dispatch(addMessage(message));
        }
        store.dispatch(addContactInDMContact(message));
      };

      const handleRecieveChannelMessage = (message) => {
        const { selectedChatData, selectedChatType } =
          store.getState().chat;
        if (
          selectedChatType !== undefined &&
          selectedChatData._id === message.channelId
        ) {
          store.dispatch(addMessage(message));
        }
        store.dispatch(addChannelInChannelList(message));
      };

      socket.current.on("receiveMessage", handleRecieveMessage);
      socket.current.on("receive-channel-message", handleRecieveChannelMessage);

      return () => {
        socket.current.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
