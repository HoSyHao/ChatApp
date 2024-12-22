  import React from "react";
  import { cn } from "@/lib/utils";
  import { useEffect, useRef } from "react";

  // eslint-disable-next-line react/prop-types
  const VideoContainer = ({stream, isLocalStream, isOnCall}) => {

    console.log("Local Stream:", stream);


      const videoRef = useRef(null);

      useEffect(() =>{
          if(videoRef.current && stream){
              videoRef.current.srcObject = stream
          }else {
            console.log("Không tìm thấy localStream.");
          }
      },[stream])


    return (
      <video ref={videoRef} className={cn('rounded border w-[800px]', isLocalStream && isOnCall && "w-[200px] h-auto absolute border-purple-500 border-2")} autoPlay playsInline muted={isLocalStream}  onLoadedMetadata={() => videoRef.current?.play()}></video>
      
    )
  }

  export default VideoContainer