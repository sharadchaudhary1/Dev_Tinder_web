import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "./SocketContext";

export const CallContext = createContext(null);

const turnUrls = (import.meta.env.VITE_TURN_URLS || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

  export const HAS_TURN = turnUrls.length > 0;

const ICE_SERVERS = [{ urls: "stun:stun.relay.metered.ca:80" }];

if (HAS_TURN) {
  ICE_SERVERS.push({
    urls: turnUrls,                      
    username: import.meta.env.VITE_TURN_USER,
    credential: import.meta.env.VITE_TURN_PASS,
  });
}


// Open the browser console on your deployed site: this tells you immediately
// whether the TURN variables were baked into the build.
console.info(
  `[call] ICE servers: ${HAS_TURN ? `STUN + TURN (${turnUrls.length} urls)` : "STUN ONLY - TURN env vars missing in this build!"}`
);
 
const RING_TIMEOUT_MS = 45000;     // caller waits this long for an answer
const CONNECT_TIMEOUT_MS = 25000;  // after accept, media must connect within this
 
const mediaErrorMessage = (err) => {
  if (!navigator.mediaDevices?.getUserMedia)
    return "Calls need a secure (https) connection and a supported browser.";
  switch (err?.name) {
    case "NotAllowedError":
      return "Camera/microphone permission was denied. Allow it in your browser settings and try again.";
    case "NotFoundError":
      return "No camera or microphone was found on this device.";
    case "NotReadableError":
      return "Your camera or microphone is being used by another app.";
    default:
      return "Could not access your camera/microphone.";
  }
};
 

export const CallProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  // status: idle | calling | ringing | connecting | connected
  const [call, setCall] = useState({ status: "idle", peerId: null, callType: null ,connectedAt:null});
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);
  const [notice, setNotice] = useState(null); // message shown to the user (errors / "call ended")
  const [iceState, setIceState] = useState("new"); 

  const pcRef = useRef(null);
  const localRef = useRef(null);
  const peerRef = useRef(null);
  const pendingIce = useRef([]);
  const candidateTypes = useRef(new Set()); // host / srflx / relay that WE gathered
  const noticeTimer = useRef(null);


  const showNotice = useCallback((msg) => {
    setNotice(msg);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 7000);
  }, []);

  const cleanup = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.onicecandidate = null;
      pcRef.current.ontrack = null;
      pcRef.current.onconnectionstatechange = null;
      pcRef.current.oniceconnectionstatechange = null;
      pcRef.current.close();
      pcRef.current = null;
    }
    localRef.current?.getTracks().forEach((t) => t.stop());
    localRef.current = null;
    pendingIce.current = [];
    candidateTypes.current = new Set();
    peerRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setMuted(false);
    setCamOff(false);
    setIceState("new");
    setCall({ status: "idle", peerId: null, callType: null, connectedAt: null });
  }, []);

  const endCall = useCallback(
    (message) => {
      if (peerRef.current) socket?.emit("call:end", { to: peerRef.current });
      cleanup();
      if (typeof message === "string") showNotice(message);
    },
    [socket, cleanup, showNotice]
  );

  const getMedia = async (callType) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, video: callType === "video" ? { facingMode: "user" } : false,
    });
    localRef.current = stream;
     setLocalStream(stream);
    return stream;
  };

  const markConnected = () =>
    setCall((c) => (c.status === "connected" ? c : { ...c, status: "connected", connectedAt: Date.now() }));

  const createPeer = (stream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));

    pc.onicecandidate = (e) =>
      e.candidate && socket.emit("webrtc:ice", { to: peerRef.current, candidate: e.candidate });

    pc.ontrack = (e) => {
      console.info("[call] remote track received:", e.track.kind);
      // Use the stream the browser gives us; fall back to building one
      setRemoteStream((prev) => {
        if (e.streams[0]) return e.streams[0];
        const s = prev || new MediaStream();
        s.addTrack(e.track);
        return new MediaStream(s.getTracks());
      });
    };
 
    pc.oniceconnectionstatechange = () => {
      console.info("[call] iceConnectionState:", pc.iceConnectionState);
      setIceState(pc.iceConnectionState);
      if (["connected", "completed"].includes(pc.iceConnectionState)) markConnected();
    };

     pc.onconnectionstatechange = () => {
      console.info("[call] connectionState:", pc.connectionState);
      if (pc.connectionState === "connected") markConnected();
      if (pc.connectionState === "failed") {
        const types = [...candidateTypes.current].join(", ") || "none";
        console.warn("[call] failed. Local candidate types gathered:", types);
        const hint = candidateTypes.current.has("relay")
          ? ""
          : " (no TURN relay available - check the TURN settings)";
        endCall(`The connection failed${hint}.`);
      }
    };

    pcRef.current = pc;
    return pc;
  };

  // ---- Caller ----
  const startCall = async (peerId, callType) => {
    if (call.status !== "idle" || !socket) return;
    try {
      await getMedia(callType);
    } catch (err) {
      showNotice(mediaErrorMessage(err));
      return;
    }

    peerRef.current = peerId;
    setCall({ status: "calling", peerId, callType,connectedAt:null });
    socket.emit("call:invite", { to: peerId, callType }, (res) => {
      if (res?.error) {
        const reasons = {
          offline: "That user is offline.",
          busy: "That user is busy on another call.",
          not_connected: "You can only call your connections.",
        };
        peerRef.current = null; // nothing to tell the server
        cleanup();
        showNotice(reasons[res.error] || "Could not start the call.");
      }
    });
  };

  // ---- Callee ----
  const acceptCall = async () => {
    try {
      const stream = await getMedia(call.callType);
      createPeer(stream);
      setCall((c) => ({ ...c, status: "connecting" }));
      socket.emit("call:accept", { to: call.peerId });
    } catch (err){ 
      showNotice(mediaErrorMessage(err));
      rejectCall();
     }
  };

  const rejectCall = () => {
    socket.emit("call:reject", { to: call.peerId });
    cleanup();
  };

 

  const toggleMute = () => {
    localRef.current?.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted(!muted);
  };
  const toggleCamera = () => {
    localRef.current?.getVideoTracks().forEach((t) => (t.enabled = camOff));
    setCamOff(!camOff);
  };

  
  //    timeouts

  useEffect(() => {
    if (call.status === "calling") {
      const t = setTimeout(() => endCall("No answer."), RING_TIMEOUT_MS);
      return () => clearTimeout(t);
    }
    if (call.status === "connecting") {
      const t = setTimeout(() => {
        const hint = HAS_TURN ? "" : " (TURN server is not configured in this build)";
        console.warn("[call] timed out. Local candidate types:", [...candidateTypes.current].join(", ") || "none");
        endCall(`Could not connect the call${hint}. Please try again.`);
      }, CONNECT_TIMEOUT_MS);
      return () => clearTimeout(t);
    }
  }, [call.status, endCall]);

  // ---- Signaling listeners ----
  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ from, callType }) => {
      peerRef.current = from;
      setCall({ status: "ringing", peerId: from, callType,connectedAt:null });
    };

    const onAccepted = async () => {
      try{
        if (!localRef.current) return;
        setCall((c) => ({ ...c, status: "connecting" }));
        const pc = createPeer(localRef.current);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", { to: peerRef.current, sdp: offer });
      }
      catch(err){
        console.error("[call] failed to create offer:", err);
        endCall("Could not start the call.");
      }
    };


    const onOffer = async ({ sdp }) => {
      try{

        const pc = pcRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(sdp);
        pendingIce.current.forEach((c) => pc.addIceCandidate(c));
        pendingIce.current = [];
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { to: peerRef.current, sdp: answer });
      }
      catch(err){
        console.error("[call] failed to handle offer:", err);
        endCall("Could not start the call.");
      }
    };

    const onAnswer = async ({ sdp }) => {
      try{

        const pc = pcRef.current;
        if(!pc) return;
        await pc.setRemoteDescription(sdp);
        pendingIce.current.forEach((c) => pc.addIceCandidate(c));
        pendingIce.current = [];
      }
      catch(err){
        console.error("[call] failed to handle answer:", err);
        endCall("Could not start the call.");
      }
    };

    const onIce = async ({ candidate }) => {
      const pc = pcRef.current;
      try{

        if (pc?.remoteDescription) await pc.addIceCandidate(candidate);
        else pendingIce.current.push(candidate); // arrived before the offer/answer
      }
      catch(err){
        console.warn("[call] addIceCandidate failed:", err);
      }
    };

    const onRejected = () => {
      cleanup();
      showNotice("Call declined.");
    };
    const onEnded = (data) => {
      const wasActive = peerRef.current !== null;
      cleanup();
      if (wasActive) showNotice(data?.reason === "disconnected" ? "The other person lost connection." : "Call ended.");
    };
 

    socket.on("call:incoming", onIncoming);
    socket.on("call:accept", onAccepted);
    socket.on("call:reject", onRejected);
    socket.on("call:end", onEnded);
    socket.on("webrtc:offer", onOffer);
    socket.on("webrtc:answer", onAnswer);
    socket.on("webrtc:ice", onIce);
    return () => {
      ["call:incoming","call:accept","call:reject","call:end",
       "webrtc:offer","webrtc:answer","webrtc:ice"].forEach((e) => socket.off(e));
    };
  }, [socket, cleanup,endCall,showNotice]);

  useEffect(() => () => cleanup(), [cleanup]);

  return (
    <CallContext.Provider
      value={{
        call, localStream, remoteStream, muted, camOff, notice, iceState,
        startCall, acceptCall, rejectCall, endCall: () => endCall(), toggleMute, toggleCamera,
        dismissNotice: () => setNotice(null),
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);