

import { useEffect, useRef } from "react";
import { useCall } from "../context/CallContext";

const CallOverlay = () => {
  const { call, localStream, remoteStream, muted, camOff,
          acceptCall, rejectCall, endCall, toggleMute, toggleCamera } = useCall();
  const localVid = useRef(); const remoteVid = useRef();

  useEffect(() => { if (localVid.current) localVid.current.srcObject = localStream; }, [localStream, call.status]);
  useEffect(() => { if (remoteVid.current) remoteVid.current.srcObject = remoteStream; }, [remoteStream, call.status]);

  if (call.status === "idle") return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center text-white">
      {call.status === "ringing" && (
        <>
          <p className="text-xl mb-6">Incoming {call.callType} call…</p>
          <div className="flex gap-6">
            <button onClick={acceptCall} className="btn btn-success">Accept</button>
            <button onClick={rejectCall} className="btn btn-error">Decline</button>
          </div>
        </>
      )}

      {call.status !== "ringing" && (
        <>
          <p className="mb-2 capitalize">{call.status}…</p>
          {/* Always render remote <video> so audio-only calls still play sound */}
          <video ref={remoteVid} autoPlay playsInline
                 className={call.callType === "video" ? "w-full max-w-3xl rounded-xl" : "hidden"} />
          {call.callType === "video" && (
            <video ref={localVid} autoPlay playsInline muted
                   className="absolute bottom-24 right-6 w-40 rounded-lg border" />
          )}
          <div className="absolute bottom-6 flex gap-4">
            <button onClick={toggleMute} className="btn">{muted ? "Unmute" : "Mute"}</button>
            {call.callType === "video" &&
              <button onClick={toggleCamera} className="btn">{camOff ? "Camera on" : "Camera off"}</button>}
            <button onClick={endCall} className="btn btn-error">End</button>
          </div>
        </>
      )}
    </div>
  );
};
export default CallOverlay;