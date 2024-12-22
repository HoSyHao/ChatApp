import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { animationDefaultOptions, getColor } from "@/lib/utils";
import Lottie from "react-lottie";

import { useDispatch, useSelector } from "react-redux";
import {
  setOpenContactModal,
  setSearchedContacts,
  searchContacts,
} from "@/Features/contactsSlice";
import { setSelectedChatData, setSelectedChatType } from "@/Features/chatSlice";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/Components/ui/input";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { HOST } from "@/Utils/constants";

const NewDM = () => {
  const dispatch = useDispatch();

  const { openContactModal, searchedContacts } = useSelector(
    (state) => state.contacts
  );

  const handleSearchContacts = async (searchTerm) => {
    try {
      if (searchTerm.length > 0) {
        const response = await dispatch(searchContacts(searchTerm)).unwrap();

        if (response) {
          dispatch(setSearchedContacts(response));
        } else {
          dispatch(setSearchedContacts([]));
        }
      } else {
        dispatch(setSearchedContacts([]));
      }
    } catch (error) {
      console.log(error);
      dispatch(setSearchedContacts([]));
    }
  };

  const selectNewContact = (contact) => {
    console.log("Contact selected:", contact);
    dispatch(setSearchedContacts([]));
    dispatch(setSelectedChatType("contact"));
    dispatch(setSelectedChatData(contact));
    dispatch(setOpenContactModal(false));
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cursor-pointer transition-all duration-300"
              onClick={() => dispatch(setOpenContactModal(true))}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            <p>Select New Contact</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={openContactModal}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            dispatch(setSearchedContacts([]));
          }
          dispatch(setOpenContactModal(isOpen));
        }}
      >
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please select a contact.</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              onChange={(e) => {
                handleSearchContacts(e.target.value);
                e.target.blur(); // Xóa trạng thái focus
              }}
              className="rounded-lg p6 bg-[#2c2e3b] border-none"
            />
          </div>
          {searchedContacts.length > 0 && (
            <ScrollArea className="h-[250px]">
              <div className="flex flex-col gap-5">
                {searchedContacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex gap-3 items-center cursor-pointer"
                    onClick={() => selectNewContact(contact)}
                  >
                    <div className="w-12 h-12 relative">
                      <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                        {contact.image ? (
                          <AvatarImage
                            src={`${HOST}/${contact.image}`}
                            alt="profile"
                            className="object-cover w-full h-full bg-black rounded-full"
                          />
                        ) : (
                          <div
                            className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                              contact.color
                            )}`}
                          >
                            {contact.firstName
                              ? contact.firstName.split("").shift()
                              : contact?.email?.split("").shift()}
                          </div>
                        )}
                      </Avatar>
                    </div>
                    <div className="flex flex-col">
                      <span>
                        {contact.firstName && contact.lastName
                          ? `${contact.firstName} ${contact.lastName}`
                          : contact.email}
                      </span>
                      <span className="text-xs">{contact.email}</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {searchedContacts.length <= 0 && (
            <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center mt-5 md:mt-0 duration-1000 transition none">
              <Lottie
                isClickToPauseDisabled={true}
                height={100}
                width={100}
                options={animationDefaultOptions}
              />
              <div className="text-opacity-80 text-white flex flex-col gap-5 items-center mt-5 lg:text-2xl text-xl transition-all duration-300 text-center">
                <h3 className="poppins-medium">
                  Hi<span className="text-purple-500">!</span> Search new
                  <span className="text-purple-500"> Contacts.</span>
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewDM;