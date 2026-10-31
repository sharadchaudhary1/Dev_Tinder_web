

import { useEffect, useRef,useState } from "react";
import { useCall } from "../context/CallContext";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const CallOverlay = () => {
  const { call, localStream, remoteStream, muted, camOff,notice,iceState,
          acceptCall, rejectCall, endCall, toggleMute, toggleCamera,dismissNotice } = useCall();
  const localVid = useRef(null); 
  const remoteVid = useRef(null);
  const [needsTap, setNeedsTap] = useState(false);
  const [seconds, setSeconds] = useState(0);
 
  const isVideo = call.callType === "video";
  const inCall = call.status !== "idle" && call.status !== "ringing";

  useEffect(() => { if (localVid.current) localVid.current.srcObject = localStream; }, [localStream, inCall]);
  useEffect(() => { if (remoteVid.current) remoteVid.current.srcObject = remoteStream; }, [remoteStream, inCall]);


  useEffect(() => {
    if (call.status !== "connected" || !call.connectedAt) { setSeconds(0); return; }
    const tick = () => setSeconds(Math.floor((Date.now() - call.connectedAt) / 1000));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [call.status, call.connectedAt]);
 
  const startPlayback = () => {
    remoteVid.current?.play().then(() => setNeedsTap(false)).catch(() => {});
    localVid.current?.play().catch(() => {});
  };
 
  // Toast for errors / "call ended" (visible even when no call is active)
  const toast = notice && (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] max-w-sm w-[90%] bg-gray-900 text-white text-sm px-4 py-3 rounded-lg shadow-lg flex items-start gap-3">
      <span className="flex-1">{notice}</span>
      <button onClick={dismissNotice} className="opacity-70 hover:opacity-100">✕</button>
    </div>
  );

  if (call.status === "idle") return toast ||null;

  const label = {
    calling: "Calling…",
    connecting: "Connecting…",
    connected: `Connected · ${fmt(seconds)}`,
  }[call.status];

 return (
    <>
      {toast}
      <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center text-white p-4">
        {call.status === "ringing" && (
          <>
            <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center text-4xl mb-6 animate-pulse">
              {isVideo ? "🎥" : "📞"}
            </div>
            <p className="text-xl mb-8">Incoming {call.callType} call…</p>
            <div className="flex gap-6">
              <button onClick={acceptCall} className="btn btn-success">Accept</button>
              <button onClick={rejectCall} className="btn btn-error">Decline</button>
            </div>
          </>
        )}
 
        {inCall && (
          <>
            {/* Clear connection status */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-block w-3 h-3 rounded-full ${
                  call.status === "connected" ? "bg-green-500" : "bg-yellow-400 animate-pulse"
                }`}
              />
              <span className="text-lg">{label}</span>
              {call.status === "connecting" && (
                <span className="loading loading-spinner loading-sm" />
              )}
            </div>
            {call.status !== "connected" && (
              <p className="text-xs text-gray-400 mb-3">network: {iceState}</p>
            )}
 
            {/* Remote video. For audio calls it stays mounted (visually hidden) so sound still plays. */}
            <div
              className={
                isVideo
                  ? "relative w-full max-w-3xl aspect-video bg-gray-900 rounded-xl overflow-hidden"
                  : "absolute w-px h-px overflow-hidden opacity-0 pointer-events-none"
              }
            >
              <video ref={remoteVid} autoPlay playsInline className="w-full h-full object-cover" />
 
              {isVideo && !remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                  {call.status === "connected" ? "Waiting for video…" : "Waiting for the other person…"}
                </div>
              )}
 
              {isVideo && (
                <video
                  ref={localVid}
                  autoPlay
                  playsInline
                  muted
                  className="absolute bottom-3 right-3 w-28 sm:w-40 rounded-lg border border-white/40 bg-black object-cover"
                />
              )}
            </div>
 
            {!isVideo && (
              <div className="w-28 h-28 rounded-full bg-gray-700 flex items-center justify-center text-5xl mb-4">
                📞
              </div>
            )}
 
            {needsTap && (
              <button onClick={startPlayback} className="btn btn-warning mt-4">
                Tap to start video &amp; sound
              </button>
            )}
 
            <div className="flex gap-3 mt-6">
              <button onClick={toggleMute} className="btn">{muted ? "Unmute" : "Mute"}</button>
              {isVideo && (
                <button onClick={toggleCamera} className="btn">{camOff ? "Camera on" : "Camera off"}</button>
              )}
              <button onClick={endCall} className="btn btn-error">End</button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
export default CallOverlay;