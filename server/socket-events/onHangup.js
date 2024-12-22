import { io } from "../socket.js";

const onHangup = async (data) => {
  const receiverSocketIds =
      data.ongoingCall.participants.caller.userId === data.userHangingupId
          ? data.ongoingCall.participants.receiver.socketIds
          : data.ongoingCall.participants.caller.socketIds;

  if (receiverSocketIds?.length > 0) {
      receiverSocketIds.forEach((socketId) => {
          io.to(socketId).emit("hangup");
      });
  }
};
  
  export default onHangup;