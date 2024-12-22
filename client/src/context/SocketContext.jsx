/* eslint-disable react/prop-types */
/* eslint-disable react/react-in-jsx-scope */
import { HOST } from "@/Utils/constants";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import Peer from "simple-peer";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { addMessage } from "@/Features/chatSlice";
import {
  addChannelInChannelList,
  addContactInDMContact,
} from "@/Features/contactsSlice";
import store from "@/Store";

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useSelector((state) => state.auth);

  // Video Call State
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(null);
  const [ongoingCall, setOngoingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [peer, setPeer] = useState(null);
  const [isCallEnded, setIsCallEnded] = useState(false);

  const currentSocketUser = onlineUsers?.find(
    (onlineUser) => onlineUser.userId === user?.id
  );

  // Use BroadcastChannel to handle communication between tabs
  const callChannel = new BroadcastChannel("callChannel");

  callChannel.onmessage = async (event) => {
    const { action, data } = event.data;
    console.log("Received message from callChannel:", event.data);

    if (action === "updateStream" && !localStream) {
      const streamData = JSON.parse(localStorage.getItem("callStream"));
      if (!streamData || !streamData.streamTracks) return;

      const { streamTracks } = streamData;
      const newStream = new MediaStream();

      for (const track of streamTracks) {
        const trackStream = await navigator.mediaDevices.getUserMedia({
          [track.kind]: true,
        });
        const singleTrack = trackStream
          .getTracks()
          .find((t) => t.kind === track.kind);
        if (singleTrack) newStream.addTrack(singleTrack);
      }

      setLocalStream(newStream);
      console.log("Stream restored in tab:", newStream);
    }

    if (action === "completePeerConnection") {
      console.log("Completing Peer Connection from other tab...");
      completePeerConnection(data);
    }

    if (action === "peerSignal") {
    console.log("Received peer signal from another tab:", data);
    
    if (peer) {
      // Nếu peer đã tồn tại, xử lý ngay lập tức
      peer.peerConnection?.signal(data.sdp);
    } else {
      // Nếu peer chưa tồn tại, lưu tạm tín hiệu vào localStorage
      let pendingSignals = JSON.parse(localStorage.getItem("peerSignals")) || [];
      pendingSignals.push(data);
      localStorage.setItem("peerSignals", JSON.stringify(pendingSignals));
    }
  }
  };

  const getMediaStream = useCallback(
    async (faceMode) => {
      if (localStream) {
        return localStream;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(
          (device) => device.kind === "videoinput"
        );

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 360, ideal: 720, max: 1080 },
            frameRate: { min: 16, ideal: 30, max: 30 },
            facingMode: videoDevices.length > 0 ? faceMode : undefined,
          },
        });

        setLocalStream(stream);
        return stream;
      } catch (error) {
        console.log("Failed to get the stream:", error);
        setLocalStream(null);
        return null;
      }
    },
    [localStream]
  );

  const handleCall = useCallback(
    async (user) => {
      setIsCallEnded(false);
      if (!currentSocketUser || !socket || ongoingCall) return;

      const stream = localStream || (await getMediaStream());
      if (!stream) {
        alert("Không thể truy cập camera/microphone. Hãy cấp quyền!");
        return;
      }

      const participants = { caller: currentSocketUser, receiver: user };
      setOngoingCall({ participants, isRinging: false });

      // Đảm bảo lưu dữ liệu stream vào localStorage
      const streamData = {
        participants,
        streamId: stream.id,
        streamTracks: stream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
        })),
      };
      localStorage.setItem("callStream", JSON.stringify(streamData));

      // Gửi thông điệp qua BroadcastChannel
      callChannel.postMessage({
        action: "updateStream",
        data: streamData,
      });

      // Mở tab mới cho caller
      const callWindow = window.open(
        `${window.location.origin}/call?streamId=${stream.id}`,
        "_blank",
        "width=800,height=600,toolbar=no,menubar=no,scrollbars=no,resizable=yes"
      );

      if (callWindow) {
        console.log("Opened call window with streamId:", stream.id);
      }

      socket.emit("call", participants);
    },
    [socket, currentSocketUser, localStream, ongoingCall]
  );

  const onIncomingCall = useCallback(
    (participants) => {
      console.log("Incoming call from:", participants.caller);
      setOngoingCall({ participants, isRinging: true });

      // Lưu thông tin cuộc gọi vào localStorage để xử lý trong các tab khác
      const callData = { participants, isRinging: true };
      localStorage.setItem("ongoingCall", JSON.stringify(callData));
    },
    [socket, user, ongoingCall]
  );

  const handleHangup = useCallback(
    (data) => {
      if (socket && user && data?.ongoingCall && data?.isEmitHangup) {
        socket.emit("hangup", {
          ongoingCall: data.ongoingCall,
          userHangingupId: user.id,
        });
      }

      setOngoingCall(null);
      setPeer(null);
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
      }
      setIsCallEnded(true);
      // Remove call data from localStorage and notify other tabs
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
        setLocalStream(null);
        setOngoingCall(null);
        setIsCallEnded(true);
        console.log("Call ended");
      }
      localStorage.removeItem("callStream");
      callChannel.postMessage({
        action: "updateStream",
        data: null,
      });
    },
    [socket, user, localStream]
  );

  const createPeer = useCallback(
    (stream, initiator) => {
      const iceServers = [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun3.l.google.com:19302",
          ],
        },
      ];

      console.log("Initializing Peer with stream:", stream);
      const peer = new Peer({
        stream,
        initiator,
        trickle: true,
        config: { iceServers },
      });

      peer.on("stream", (stream) => {
        console.log("Received remote stream:", stream);
        setPeer((prevPeer) => {
          if (prevPeer) {
            return { ...prevPeer, stream };
          }
          return prevPeer;
        });
      });

      peer.on("error", console.error);
      peer.on("close", () => handleHangup({}));

      const rtcPeerConnection = peer._pc;

      rtcPeerConnection.oniceconnectionstatechange = async () => {
        if (
          rtcPeerConnection.iceConnectionState === "disconnected" ||
          rtcPeerConnection.iceConnectionState === "failed"
        ) {
          handleHangup({});
        }
      };

      return peer;
    },
    [ongoingCall, setPeer]
  );

  const completePeerConnection = useCallback(
    async (connectionData) => {
      console.log("completePeerConnection called with:", connectionData);
      if (!localStream) {
        console.log("Missing localStream, sending to other tabs...");
        callChannel.postMessage({
          action: "completePeerConnection",
          data: connectionData,
        });
        return;
      }

      if (peer) {
        peer.peerConnection?.signal(connectionData.sdp);
        return;
      }

      const newPeer = createPeer(localStream, true);
      setPeer({
        peerConnection: newPeer,
        participantUser: connectionData.ongoingCall.participants.receiver,
        stream: undefined,
      });

      newPeer.on("signal", async (data) => {
        if (socket) {
          socket.emit("webrtcSignal", {
            sdp: data,
            ongoingCall,
            isCaller: true,
          });
        }

        callChannel.postMessage({
          action: "peerSignal",
          data: { sdp: data, ongoingCall },
        });
      });
    },
    [localStream, createPeer, peer, socket, ongoingCall]
  );

  const handleJoinCall = useCallback(
    async (ongoingCall) => {
      setIsCallEnded(false);
      setOngoingCall((prev) => (prev ? { ...prev, isRinging: false } : prev));

      let stream = localStream;

      if (!stream) {
        stream = await getMediaStream();
        if (!stream) {
          console.log("Could not get stream in handleJoinCall");
          handleHangup({
            ongoingCall: ongoingCall ? ongoingCall : undefined,
            isEmitHangup: true,
          });
          return;
        }
      }

      const newPeer = createPeer(stream, true);
      console.log("Stream being passed to Peer:", stream); // Log stream
      if (!newPeer) {
        console.error("Peer creation failed!");
        return;
      }

      setPeer({
        peerConnection: newPeer,
        participantUser: ongoingCall.participants.caller,
        stream: undefined,
      });

      newPeer.on("signal", async (data) => {
        if (socket) {
          console.log("Emitting webrtcSignal for join call");
          socket.emit("webrtcSignal", {
            sdp: data,
            ongoingCall,
            isCaller: false,
          });
        }

        // Gửi tín hiệu SDP qua BroadcastChannel
        callChannel.postMessage({
          action: "peerSignal",
          data: { sdp: data, ongoingCall },
        });
      });

      // Lưu thông tin stream vào localStorage để sử dụng ở các tab khác
      const streamData = {
        participants: ongoingCall.participants,
        streamId: stream.id,
        streamTracks: stream.getTracks().map((track) => ({
          kind: track.kind,
          enabled: track.enabled,
        })),
      };
      localStorage.setItem("callStream", JSON.stringify(streamData));

      // Sử dụng BroadcastChannel để đồng bộ stream
      callChannel.postMessage({
        action: "updateStream",
        data: streamData,
      });

      // Mở tab mới và truyền ID stream (giống handleCall)
      const callWindow = window.open(
        `${window.location.origin}/call?streamId=${stream.id}`,
        "_blank",
        "width=800,height=600,toolbar=no,menubar=no,scrollbars=no,resizable=yes"
      );

      if (callWindow) {
        console.log(
          "Opened call window for receiver with streamId:",
          stream.id
        );
      }

      console.log("Receiver đã tham gia cuộc gọi.");
    },
    [socket, currentSocketUser]
  );

  const handleRecieveMessage = (message) => {
    const { selectedChatData, selectedChatType } = store.getState().chat;

    if (
      selectedChatType !== undefined &&
      (selectedChatData._id === message.sender._id ||
        selectedChatData._id === message.recipient._id)
    ) {
      store.dispatch(addMessage(message));
    }
    store.dispatch(addContactInDMContact(message));
  };

  const handleRecieveChannelMessage = (message) => {
    const { selectedChatData, selectedChatType } = store.getState().chat;
    if (
      selectedChatType !== undefined &&
      selectedChatData._id === message.channelId
    ) {
      store.dispatch(addMessage(message));
    }
    store.dispatch(addChannelInChannelList(message));
  };

  useEffect(() => {
    const storedStream = localStorage.getItem("callStream");

    if (storedStream) {
      const parsedStream = JSON.parse(storedStream);

      if (parsedStream.streamTracks && !localStream) {
        console.log("Restoring stream from localStorage...");
        const { streamTracks } = parsedStream;

        const restoreStream = async () => {
          const newStream = new MediaStream();

          for (const track of streamTracks) {
            const trackStream = await navigator.mediaDevices.getUserMedia({
              [track.kind]: true,
            });
            const singleTrack = trackStream
              .getTracks()
              .find((t) => t.kind === track.kind);
            if (singleTrack) newStream.addTrack(singleTrack);
          }

          setLocalStream(newStream);

          // Gửi thông điệp cập nhật lại chỉ khi cần
          callChannel.postMessage({
            action: "updateStream",
            data: parsedStream,
          });

          console.log("Stream restored and updated to callChannel:", newStream);
        };

        restoreStream();
      }
    }
  }, []);

  // useEffect để xử lý tín hiệu từ localStorage
  useEffect(() => {
    const pendingSignals = JSON.parse(localStorage.getItem("peerSignals")) || [];
    if (pendingSignals.length > 0) {
      console.log("Processing pending signals:", pendingSignals);
  
      pendingSignals.forEach((signal) => {
        if (peer) {
          peer.peerConnection?.signal(signal.sdp);
        }
      });
  
      // Xóa tín hiệu đã xử lý
      localStorage.removeItem("peerSignals");
    }
  }, [peer]);

  useEffect(() => {
    if (user) {
      const newSocket = io(HOST, {
        withCredentials: true,
        query: {
          userId: user.id,
          profile: JSON.stringify({
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            email: user.email,
            color: user.color,
          }),
        },
      });

      newSocket.on("connect", () => {
        console.log("Socket connected:", newSocket.id); // Kiểm tra khi socket kết nối
      });

      const updateOnlineUsers = (users) => {
        console.log("Danh sách người dùng online nhận từ server:", users);
        setOnlineUsers(users || []);
      };

      newSocket.on("getUsers", updateOnlineUsers);

      newSocket.on("receiveMessage", handleRecieveMessage);
      newSocket.on("receive-channel-message", handleRecieveChannelMessage);

      // Cập nhật state socket
      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  useEffect(() => {
    if (socket === null) return;
    if (socket.connected) {
      onConnect();
    }

    const onConnect = () => setIsSocketConnected(true);
    const onDisconnect = () => setIsSocketConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    const updateOnlineUsers = (users) => {
      console.log("Danh sách người dùng online nhận từ server:", users);
      setOnlineUsers(users || []);
    };

    socket.off("getUsers");
    socket.on("getUsers", updateOnlineUsers);

    return () => {
      socket.off("getUsers", updateOnlineUsers);
    };
  }, [socket, isSocketConnected]);

  useEffect(() => {
    if (!socket || !isSocketConnected) return;

    socket.on("incomingCall", (participants) => {
      console.log("Incoming call:", participants); // Kiểm tra log
      onIncomingCall(participants);
    });
    socket.on("webrtcSignal", completePeerConnection);
    socket.on("hangup", handleHangup);

    return () => {
      socket.off("incomingCall", onIncomingCall);
      socket.off("webrtcSignal", completePeerConnection);
      socket.off("hangup", handleHangup);
    };
  }, [
    socket,
    isSocketConnected,
    onIncomingCall,
    completePeerConnection,
    handleHangup,
  ]);

  useEffect(() => {
    let timeout;

    if (isCallEnded) {
      timeout = setTimeout(() => {
        setIsCallEnded(false);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [isCallEnded]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        ongoingCall,
        localStream,
        peer,
        isCallEnded,
        handleCall,
        handleJoinCall,
        handleHangup,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
