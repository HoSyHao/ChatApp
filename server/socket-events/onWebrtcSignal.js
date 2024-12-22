import { io } from "../socket.js";

const onWebrtcSignal = async (data) => {
    const targetSocketIds = data.isCaller
        ? data.ongoingCall.participants.receiver.socketIds
        : data.ongoingCall.participants.caller.socketIds;

    if (targetSocketIds?.length > 0) {
        targetSocketIds.forEach((socketId) => {
            io.to(socketId).emit("webrtcSignal", data);
        });
    }
};


export default onWebrtcSignal;