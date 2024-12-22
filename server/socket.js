import { Server as SocketIOServer } from "socket.io";
import Messages from "./models/Messages.js";
import Channel from "./models/Channel.js";
import onCall from "./socket-events/onCall.js";
import onWebrtcSignal from "./socket-events/onWebrtcSignal.js";
import onHangup from "./socket-events/onHangup.js";

export let io;
export let userSocketMap;

const setupSocket = (server) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  userSocketMap = new Map();

  const addUserSocket = (userId, socketId, profile) => {
    if (!userId || !socketId) return;
  
    if (!userSocketMap.has(userId)) {
      userSocketMap.set(userId, {
        profile,
        socketIds: new Set([socketId]),
      });
    } else {
      const userData = userSocketMap.get(userId);
      userData.socketIds.add(socketId);
      userSocketMap.set(userId, userData);
    }
  
    // Phát danh sách người dùng online
    emitOnlineUsers();
  };
  
  const removeUserSocket = (userId, socketId) => {
    if (!userId || !userSocketMap.has(userId)) return;

    const userData = userSocketMap.get(userId);
    userData.socketIds.delete(socketId);

    // Nếu không còn socket nào, đợi 3 giây trước khi xóa user
    if (userData.socketIds.size === 0) {
        setTimeout(() => {
            if (userSocketMap.get(userId)?.socketIds.size === 0) {
                userSocketMap.delete(userId);
                console.log(`User ${userId} is now offline.`);
                emitOnlineUsers();
            }
        }, 3000); // Đợi reconnect
    } else {
        userSocketMap.set(userId, userData);
        emitOnlineUsers();
    }
};

  

  // Phát danh sách người dùng online tới tất cả client
  let previousUsers = [];

const emitOnlineUsers = () => {
  const currentUsers = Array.from(userSocketMap.entries()).map(([userId, data]) => ({
    userId,
    profile: data.profile,
    socketIds: Array.from(data.socketIds),
  }));
  
  if (JSON.stringify(previousUsers) !== JSON.stringify(currentUsers)) {
    previousUsers = currentUsers;
    io.emit("getUsers", currentUsers);
  }
};


  // Xử lý khi socket disconnect
  const handleDisconnect = (socket) => {
    userSocketMap.forEach((userData, userId) => {
      if (userData.socketIds.has(socket.id)) {
        console.log(`Removing socket ID: ${socket.id} for user: ${userId}`);
        removeUserSocket(userId, socket.id);
  
        // Log trạng thái user sau khi xử lý
        if (userSocketMap.get(userId)?.socketIds.size === 0) {
          console.log(`User ${userId} is now offline.`);
        }
      }
    });
  
    // Phát danh sách người dùng online
    emitOnlineUsers();
  };
  
  

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    const profile = socket.handshake.query.profile
      ? JSON.parse(socket.handshake.query.profile)
      : null;

    if (userId && profile) {
      addUserSocket(userId, socket.id, profile);
      console.log(`User connected: ${userId}, Socket ID: ${socket.id}`);
    } else {
      console.log("Invalid connection: Missing userId or profile.");
    }

    socket.on("disconnect", () => handleDisconnect(socket));

    socket.on("sendMessage", async (message) => {
      // Xử lý gửi tin nhắn
      await handleSendMessage(message);
    });

    socket.on("send-channel-message", async (message) => {
      // Xử lý gửi tin nhắn kênh
      await handleSendChannelMessage(message);
    });

    // Các sự kiện gọi video
    socket.on("call", onCall);
    socket.on("webrtcSignal", onWebrtcSignal);
    socket.on("hangup", onHangup);
  });

  const handleSendMessage = async (message) => {
    const recipientSocketIds = userSocketMap.get(message.recipient)?.socketIds || [];
    const senderSocketIds = userSocketMap.get(message.sender)?.socketIds || [];

    const createdMessage = await Messages.create(message);
    const messageData = await Messages.findById(createdMessage._id)
      .populate("sender", "id firstName lastName image email color")
      .populate("recipient", "id firstName lastName image email color");

    [...recipientSocketIds, ...senderSocketIds].forEach((socketId) => {
      io.to(socketId).emit("receiveMessage", messageData);
    });
  };

  const handleSendChannelMessage = async (message) => {
    const { channelId, sender, content, messageType, fileUrl } = message;

    const createdMessage = await Messages.create({
      sender,
      recipient: null,
      content,
      messageType,
      timestamp: new Date(),
      fileUrl,
    });

    const messageData = await Messages.findById(createdMessage._id)
      .populate("sender", "id firstName lastName image email color")
      .exec();

    await Channel.findByIdAndUpdate(channelId, {
      $push: { messages: createdMessage._id },
    });

    const channel = await Channel.findById(channelId).populate("members");
    const finalData = { ...messageData._doc, channelId: channel._id };

    if (channel?.members) {
      channel.members.forEach((member) => {
        const memberSocketIds = userSocketMap.get(member._id.toString())?.socketIds || [];
        memberSocketIds.forEach((socketId) => {
          io.to(socketId).emit("receive-channel-message", finalData);
        });
      });
    }
  };
};

export default setupSocket;
