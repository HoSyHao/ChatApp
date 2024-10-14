import React, { useEffect } from "react";
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

import { useDispatch, useSelector } from "react-redux";
import {
  getAllContacts,
  setAllContacts,
  setNewChannelModal,
  setChannelName,
  setSelectedContacts,
  addChannel,
  createChannel,
  setChannels,
  getUserChannel,
} from "@/Features/contactsSlice";

import { FaPlus } from "react-icons/fa";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import MultipleSelector from "@/Components/ui/multipleselect";

const CreateChannel = () => {
  const dispatch = useDispatch();

  const { channelName, newChannelModal, allContacts, selectedContacts } =
    useSelector((state) => state.contacts);

  useEffect(() => {
    const getData = async () => {
      const response = await dispatch(getAllContacts()).unwrap();
      dispatch(setAllContacts(response));
    };
    getData();
  }, []);

  const handleCreateChannel = async () => {
    try {
      if (channelName.length > 0 && selectedContacts.length > 0) {
        const response = await dispatch(createChannel(channelName)).unwrap();
        dispatch(setChannelName(""));
        dispatch(setSelectedContacts([]));
        dispatch(setNewChannelModal(false));
        dispatch(addChannel(response));

        // Gọi lại getUserChannel để cập nhật danh sách kênh
        const channelsResponse = await dispatch(getUserChannel()).unwrap();
        dispatch(setChannels(channelsResponse));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <FaPlus
              className="text-neutral-400 font-light text-opacity-90 text-start hover:text-neutral-100 cusor-pointer transition-all duration-300"
              onClick={() => dispatch(setNewChannelModal(true))}
            />
          </TooltipTrigger>
          <TooltipContent className="bg-[#1c1b1e] border-none mb-2 p-3 text-white">
            <p>Create New Channel</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={newChannelModal}
        onOpenChange={() => dispatch(setNewChannelModal(false))}
      >
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Please fill up the details for new channel.
            </DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Channel Name"
              onChange={(e) => dispatch(setChannelName(e.target.value))}
              value={channelName}
              className="rounded-lg p6 bg-[#2c2e3b] border-none"
            />
          </div>
          <div>
            <MultipleSelector
              className="rounded-lg bg-[#2c2e3b] border-none py-2 text-white"
              defaultOptions={allContacts}
              placeholder="Search Contacts"
              value={selectedContacts}
              onChange={(selected) => dispatch(setSelectedContacts(selected))}
              emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600">
                  No results found
                </p>
              }
            />
          </div>
          <div>
            <Button
              onClick={handleCreateChannel}
              className="w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
            >
              Create Channel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreateChannel;
