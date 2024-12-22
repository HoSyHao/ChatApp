/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import Logo from "@/components/Logo.jsx";
import ProfileInfo from "./components/profile-info";
import NewDM from "./components/new-dm";
import { useDispatch, useSelector } from "react-redux";
import {
  getContactsForDMList,
  getUserChannel,
  setChannels,
} from "@/Features/contactsSlice";
import { setDirectMessagesContacts } from "@/Features/chatSlice";
import ContactList from "@/components/ui/contact-list";
import CreateChannel from "./components/create-channel";
import { ScrollArea } from "@/components/ui/scroll-area";

function ContactsContainer() {
  const dispatch = useDispatch();

  const { directMessagesContacts } = useSelector((state) => state.chat);
  const { channels } = useSelector((state) => state.contacts);

  

  useEffect(() => {
    const getContacts = async () => {
      const response = await dispatch(getContactsForDMList());
      if (response && Array.isArray(response.payload)) {
        // kiểm tra nếu payload là mảng
        dispatch(setDirectMessagesContacts(response.payload)); // Lưu response.payload trực tiếp
      }
    };

    const getChannels = async () => {
      const response = await dispatch(getUserChannel());
      if (response && Array.isArray(response.payload)) {
        // kiểm tra nếu payload là mảng
        dispatch(setChannels(response.payload)); // Lưu response.payload trực tiếp
      }
    };

    getContacts();
    getChannels();
  }, [dispatch]);

  return (
    <div className="relative md:w-[35vw] lg:w-[30vw] xl:w-[25vw] bg-[#1b1c24] border-r-2 border-[#2f303b] w-full">
      <div className="pt-3">
        <Logo />
      </div>
      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Direct Messages" />
          <NewDM />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
          <ScrollArea className="h-[220px]">
            <ContactList contacts={directMessagesContacts}></ContactList>
          </ScrollArea>
        </div>
      </div>

      <div className="my-5">
        <div className="flex items-center justify-between pr-10">
          <Title text="Channels" />
          <CreateChannel />
        </div>
        <div className="max-h-[38vh] overflow-y-auto scrollbar-hidden">
        <ScrollArea className="h-[260px]">
          <ContactList contacts={channels} isChannel={true}></ContactList>
          </ScrollArea>
        </div>
      </div>
      <ProfileInfo />
    </div>
  );
}

export default ContactsContainer;

const Title = ({ text }) => {
  return (
    <h6 className="uppercase tracking-widest text-neutral-400 pl-10 font-light text-opacity-90 text-sm">
      {text}
    </h6>
  );
};
