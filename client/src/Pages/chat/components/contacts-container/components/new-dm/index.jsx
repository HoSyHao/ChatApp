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

import { animationDefaultOptions } from "@/lib/utils";
import Lottie from "react-lottie";

import { useDispatch, useSelector } from "react-redux";
import {
  setOpenContactModal,
  setSearchedContacts,
  searchContacts,
} from "@/Features/chatSlice";
import { FaPlus } from "react-icons/fa";
import { Input } from "@/Components/ui/input";

const NewDM = () => {
  const dispatch = useDispatch();

  const { openContactModal, searchedContacts } = useSelector(
    (state) => state.chat
  );

  const handleSearchContacts = async (searchTerm) => {
    console.log("Search term:", searchTerm); // Thêm log để kiểm tra từ khóa tìm kiếm   
    try {
      if (searchTerm.length > 0) {
        const response = await dispatch(searchContacts(searchTerm)).unwrap();
        console.log("Searched contacts:", response); // Thêm log để kiểm tra dữ liệu trả về
        
        if (response) {
          dispatch(setSearchedContacts(response));
          console.log("Updated searchedContacts:", searchedContacts);
        }
      } else {
        dispatch(setSearchedContacts([]));
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
        onOpenChange={() => dispatch(setOpenContactModal(false))}
      >
        <DialogContent className="bg-[#181920] border-none text-white w-[400px] h-[400px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Please select a contact.</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <div>
            <Input
              placeholder="Search Contacts"
              onChange={(e) => handleSearchContacts(e.target.value)}
              className="rounded-lg p6 bg-[#2c2e3b] border-none"
            />
          </div>
          {searchedContacts.length < 1 && (
            <div className="flex-1 md:bg-[#1c1d25] md:flex flex-col justify-center items-center mt-5 duration-1000 transition none">
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