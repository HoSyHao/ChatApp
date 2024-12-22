/* eslint-disable react/prop-types */
import {
  setSelectedChatData,
  setSelectedChatType,
} from "@/Features/chatSlice";
import { getColor } from "@/lib/utils";
import { HOST } from "@/Utils/constants";
import { Avatar, AvatarImage } from "@/components/ui/avatar";;
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSocket } from "@/context/SocketContext";

const ContactList = ({ contacts, isChannel = false }) => {
  const dispatch = useDispatch();
  const { selectedChatData } = useSelector(
    (state) => state.chat
  );

  const { onlineUsers } = useSocket();

  const handleClick = (contact) => {
    if (isChannel) dispatch(setSelectedChatType("channel"));
    else dispatch(setSelectedChatType("contact"));
    dispatch(setSelectedChatData(contact));
  };


  return (
    <div className="mt-5">
  {contacts.length > 0 ? (
    contacts.map((contact, index) => (
      <div
        key={contact._id || index}
        className={`pl-10 py-2 transition-all duration-300 cursor-pointer ${
          selectedChatData && selectedChatData._id === contact._id
            ? "bg-[#8417ff] hover:bg-[#8417ff]"
            : "hover:bg-[#f1f1f111]"
        }`}
        onClick={() => handleClick(contact)}
      >
        <div className="flex gap-5 items-center justify-start text-neutral-300">
          {!isChannel && (
            <Avatar className="h-10 w-10 rounded-full overflow-hidden">
              {contact.image ? (
                <AvatarImage
                  src={`${HOST}/${contact.image}`}
                  alt="profile"
                  className="object-cover w-full h-full bg-black rounded-full"
                />
              ) : (
                <div
                  className={`uppercase h-10 w-10 text-lg border-[1px] flex items-center justify-center rounded-full ${
                    selectedChatData && selectedChatData._id === contact._id
                      ? "bg-[#ffffff22] border border-white/70"
                      : getColor(contact.color)
                  }`}
                >
                  {contact.firstName
                    ? contact.firstName.split("").shift()
                    : contact?.email?.split("").shift()}
                </div>
              )}
            </Avatar>
          )}

          {isChannel && (
            <div className="bg-[#ffffff22] h-10 w-10 items-center justify-center flex rounded-full">
              #
            </div>
          )}
          <div className="flex items-center gap-2">
            {isChannel ? (
              <span>{contact.name}</span>
            ) : (
              <span>
                {contact.firstName
                  ? `${contact.firstName} ${contact.lastName}`
                  : contact.email}
              </span>
            )}

            
            
          </div>
          {!isChannel &&
              onlineUsers?.some((user) => user.userId === contact._id) && (
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              )}
        </div>
        
      </div>
      
    ))
  ) : (
    <div className="pl-10">No contacts available</div>
  )}
</div>

  );
};

export default ContactList;