import { setEmojiPickerOpen, setMessage } from "@/Features/contactsSlice";
import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GrAttachment } from "react-icons/gr";
import { RiEmojiStickerLine } from "react-icons/ri";
import { IoSend } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react";
import { useSocket } from "@/context/SocketContext.jsx";
import { uploadFile, setIsUploading, addDirectMessageContact} from "@/Features/chatSlice";


const MessageBar = () => {
  const dispatch = useDispatch();
  const {socket} = useSocket();
  const fileInputRef = useRef();
  const {
    selectedChatType,
    selectedChatData,
  } = useSelector((state) => state.chat);
  const { message, emojiPickerOpen } = useSelector((state) => state.contacts);
  const { user } = useSelector((state) => state.auth);
  const { directMessagesContacts } = useSelector((state) => state.chat);
  const emojiRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiRef.current && !emojiRef.current.contains(event.target)) {
        dispatch(setEmojiPickerOpen(false));
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [emojiRef]);

  const handleAddEmoji = (emoji) => {
    dispatch(setMessage(message + emoji.emoji));
  };

  const handleMessageChange = (e) => {
    dispatch(setMessage(e.target.value));
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      // Không gửi tin nhắn nếu nội dung rỗng
      return;
    }
    
    if (selectedChatType === "contact") {
      socket.emit("sendMessage", {
        sender: user.id,
        content: message,
        recipient: selectedChatData._id,
        messageType: "text",
        fileUrl: undefined,
      });

      // Thêm liên hệ mới vào danh sách "Direct Messages" nếu chưa có
      const isExistingContact = directMessagesContacts.some(contact => contact._id === selectedChatData._id);
      if (!isExistingContact) {
        dispatch(addDirectMessageContact(selectedChatData));
      }
    }else if(selectedChatType === "channel"){
      socket.emit("send-channel-message", {
        sender: user.id,
        content: message,
        messageType: "text",
        fileUrl: undefined,
        channelId: selectedChatData._id,
      });
    }
    dispatch(setMessage(""));
  };

  const handleAttachmentClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAttachmentChange = async (event) => {
    try {
      const file = event.target.files[0]; 
      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        dispatch(setIsUploading(true))

        const response = await dispatch(uploadFile(formData)).unwrap();
        console.log(response);

        
        dispatch(setIsUploading(false))

        if (selectedChatType === "contact") {
          socket.emit("sendMessage", {
            sender: user.id,
            content: undefined,
            recipient: selectedChatData._id,
            messageType: "file",
            fileUrl: response,
          });
        } else if(selectedChatType === "channel"){
          socket.emit("send-channel-message", {
            sender: user.id,
            content: undefined,
            messageType: "file",
            fileUrl: response,
            channelId: selectedChatData._id,
          });
        }
      

      }
      console.log({ file });
    } catch (error) {
      
      dispatch(setIsUploading(false))
      console.log({ error });
    }
  };

  const handleKeyDown = (e) => {
    if(e.key === 'Enter'){
      handleSendMessage();
    }
  }
  return (
    <div className="h-[10vh] bg-[#1c1d25] flex justify-center items-center px-8 mb-6 gap-6">
      <div className="flex-1 flex bg-[#2a2b33] rounded-md items-center gap-5 pr-5">
        <input
          type="text"
          className="flex-1 p-5 bg-transparent rounded-md focus:border-none focus:outline-none"
          placeholder="Enter Message"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={handleAttachmentClick}
          className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
        >
          <GrAttachment className="text-2xl" />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAttachmentChange}
        />
        <div className="relative">
          <button
            onClick={() => dispatch(setEmojiPickerOpen(true))}
            className="text-neutral-500 focus:border-none focus:outline-none focus:text-white duration-300 transition-all"
          >
            <RiEmojiStickerLine className="text-2xl" />
          </button>
          <div className="absolute bottom-16 right-0" ref={emojiRef}>
            <EmojiPicker
              theme="dark"
              open={emojiPickerOpen}
              onEmojiClick={handleAddEmoji}
              autoFocusSearch={false}
            />
          </div>
        </div>
      </div>
      <button
        className="bg-[#8417ff] rounded-md flex items-center justify-center p-5 focus:border-none hover:bg-[#741bda] focus:bg-[#741bda] focus:outline-none focus:text-white duration-300 transition-all"
        onClick={handleSendMessage}
      >
        <IoSend className="text-2xl" />
      </button>
    </div>
  );
};

export default MessageBar;
