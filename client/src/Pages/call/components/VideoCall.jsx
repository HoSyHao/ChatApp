import React from "react";
import { useSocket } from "@/context/SocketContext";
import VideoContainer from "./VideoContainer";
import { useCallback, useEffect, useState } from "react";
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from "react-icons/md";

const VideoCall = () => {
  const { localStream, peer, ongoingCall, handleHangup, isCallEnded } =
    useSocket();
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVidOn, setIsVidOn] = useState(true);

  console.log("localStream:", localStream);
  console.log("peer:", peer);
  console.log("ongoingCall:", ongoingCall);
  console.log("Dữ liệu trong localStorage:", localStorage.getItem("callStream"));

  useEffect(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      setIsVidOn(videoTrack.enabled);
      const audioTrack = localStream.getAudioTracks()[0];
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      videoTrack.enabled = !videoTrack.enabled;
      setIsVidOn(videoTrack.enabled);
    }
  }, [localStream]);

  const toggleMic = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  }, [localStream]);

  const isOnCall = localStream && peer && ongoingCall ? true : false;

  if (isCallEnded) {
    return <div className="text-center mt-5 text-rose-500">Call Ended</div>;
  }

  if (!localStream && !peer) {
    return (
      <div className="text-center mt-5 text-gray-500">
        Waiting for local or remote stream...
      </div>
    );
  }

  return (
    <div>
      <div className="mt-4 relative max-w-[800px] mx-auto">
        {localStream && (
          <VideoContainer
            stream={localStream}
            isLocalStream={true}
            isOnCall={isOnCall}
          />
        )}
        {peer?.stream ? (
          <VideoContainer
            stream={peer.stream}
            isLocalStream={false}
            isOnCall={isOnCall}
          />
        ) : (
          <div className="text-center mt-5 text-gray-500">
            Waiting for remote stream...
          </div>
        )}
      </div>
      <div className="mt-8 flex items-center justify-center">
        <button onClick={toggleMic}>
          {isMicOn && <MdMicOff size={28} />}
          {!isMicOn && <MdMic size={28} />}
        </button>
        <button
          onClick={() =>
            handleHangup({
              ongoingCall: ongoingCall ? ongoingCall : undefined,
              isEmitHangup: true,
            })
          }
          className="px-4 py-2 bg-rose-500 text-white rounded mx-4"
        >
          End Call
        </button>
        <button onClick={toggleCamera}>
          {isVidOn && <MdVideocamOff size={28} />}
          {!isVidOn && <MdVideocam size={28} />}
        </button>
      </div>
    </div>
  );
};

export default VideoCall;
