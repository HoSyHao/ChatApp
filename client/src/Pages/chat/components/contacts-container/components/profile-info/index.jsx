import { getColor } from "@/lib/utils";
import { HOST } from "@/Utils/constants";
import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FiEdit2 } from "react-icons/fi";
import { IoPowerSharp} from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { logout } from "@/Features/authSlice";
import { useSocket } from "@/context/SocketContext";

const ProfileInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { onlineUsers } = useSocket();

  const isOnline = onlineUsers?.some((onlineUser) => onlineUser.userId === user.id);

  const handleLogout = () => {
    dispatch(logout())
      .then((action) => {
        if (action.meta.requestStatus === "fulfilled") {
          navigate("/login");
        }
        console.log(action);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  return (
    <div className="absolute bottom-0 h-16 flex items-center justify-between px-5 w-full bg-[#2a2b33]">
      <div className="flex gap-3 items-center justify-start">
        <div className="w-12 h-12 relative">
          <Avatar className="h-12 w-12 rounded-full overflow-hidden">
            {user.image ? (
              <AvatarImage
                src={`${HOST}/${user.image}`}
                alt="profile"
                className="object-cover w-full h-full bg-black rounded-full"
              />
            ) : (
              <div
                className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                  user.color
                )}`}
              >
                {user.firstName
                  ? user.firstName.split("").shift()
                  : user?.email?.split("").shift()}
              </div>
            )}
            
          </Avatar>
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2a2b33]"></div>
          )}
        </div>
        
        <div>
          {user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : ""}
        </div>
      </div>
      <div className="flex gap-5 ml-auto">
  
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <FiEdit2 className="text-purple-500 text-xl font-medium" onClick={()=>navigate("/profile")}/>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Edit Profile</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <IoPowerSharp className="text-red-500 text-xl font-medium" onClick={handleLogout}/>
            </TooltipTrigger>
            <TooltipContent className="bg-[#1c1b1e] border-none text-white">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};

export default ProfileInfo;
