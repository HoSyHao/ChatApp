import { useSocket } from "@/context/SocketContext.jsx";
import React from "react";
import { Avatar, AvatarImage } from "@/Components/ui/avatar";
import { MdCall, MdCallEnd } from "react-icons/md";
import { HOST } from "@/Utils/constants";
import { getColor } from "@/lib/utils";

const CallNotification = () => {
  const { ongoingCall, handleJoinCall, handleHangup } = useSocket();


  if (!ongoingCall?.isRinging) return null;

  return (
    <div className="absolute bg-[#303144] bg-opacity-70 w-screen h-screen top-0 left-0 flex items-center justify-center">
      <div className="bg-[#1b1c24] border-2 border-[#8417ff] min-w-[300px] min-h-[100px] flex flex-col items-center justify-center rounded p-4">
        <div className="flex flex-col items-center">
              <Avatar className="h-12 w-12 rounded-full overflow-hidden">
                {ongoingCall.participants.caller.profile.image ? (
                  <AvatarImage
                    src={`${HOST}/${ongoingCall.participants.caller.profile.image}`}
                    alt="profile"
                    className="object-cover w-full h-full bg-black rounded-full"
                  />
                ) : (
                  <div
                    className={`uppercase h-12 w-12 text-lg border-[1px] flex items-center justify-center rounded-full ${getColor(
                      ongoingCall.participants.caller.profile.color
                    )}`}
                  >
                    {ongoingCall.participants.caller.profile.firstName
                      ? ongoingCall.participants.caller.profile.firstName.split("").shift()
                      : ongoingCall.participants.caller.profile?.email?.split("").shift()}
                  </div>
                )}
              </Avatar>
            
          <h3 className="text-white">
            {ongoingCall.participants.caller.profile.firstName?.split(" ")[0] + " " + ongoingCall.participants.caller.profile.lastName?.split(" ")[0]}
          </h3>
        </div>
        <p className="text-sm mb-2 text-gray-400">Incoming Call</p>
        <div className="flex gap-8">
          <button onClick={() => handleJoinCall(ongoingCall)} className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
            <MdCall size={24} />
          </button>

          <button onClick={()=> handleHangup({ongoingCall: ongoingCall ? ongoingCall : undefined, isEmitHangup: true})} className="w-10 h-10 bg-rose-500 rounded-full flex items-center justify-center text-white">
            <MdCallEnd size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallNotification;
