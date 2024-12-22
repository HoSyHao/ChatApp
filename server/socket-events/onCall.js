import { io } from "../socket.js";

const onCall = async (participants) => {
    if (participants.receiver.socketIds?.length > 0) {
        participants.receiver.socketIds.forEach((socketId) => {
            io.to(socketId).emit("incomingCall", participants);
        });
    }
};

export default onCall;