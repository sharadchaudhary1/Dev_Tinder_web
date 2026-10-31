import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { SocketContext } from "./SocketContext";

export const CallContext = createContext(null);

const turnUrls = (import.meta.env.VITE_TURN_URLS || "")
  .split(",")
  .map((u) => u.trim())
  .filter(Boolean);

const ICE_SERVERS = [{ urls: "stun:stun.relay.metered.ca:80" }];

if (turnUrls.length) {
  ICE_SERVERS.push({
    urls: turnUrls,                      
    username: import.meta.env.VITE_TURN_USER,
    credential: import.meta.env.VITE_TURN_PASS,
  });
}

export const CallProvider = ({ children }) => {
  const socket = useContext(SocketContext);
  // status: idle | calling | ringing | connecting | connected
  const [call, setCall] = useState({ status: "idle", peerId: null, callType: null });
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [muted, setMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const pcRef = useRef(null);
  const localRef = useRef(null);
  const peerRef = useRef(null);
  const pendingIce = useRef([]);

  const cleanup = useCallback(() => {
    pcRef.current?.close(); pcRef.current = null;
    localRef.current?.getTracks().forEach((t) => t.stop()); localRef.current = null;
    pendingIce.current = []; peerRef.current = null;
    setLocalStream(null); setRemoteStream(null);
    setMuted(false); setCamOff(false);
    setCall({ status: "idle", peerId: null, callType: null });
  }, []);

  const getMedia = async (callType) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true, video: callType === "video",
    });
    localRef.current = stream; setLocalStream(stream);
    return stream;
  };

  const createPeer = (stream) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pc.onicecandidate = (e) =>
      e.candidate && socket.emit("webrtc:ice", { to: peerRef.current, candidate: e.candidate });
    pc.ontrack = (e) => setRemoteStream(e.streams[0]);
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") setCall((c) => ({ ...c, status: "connected" }));
      if (["failed", "closed"].includes(pc.connectionState)) endCall();
    };
    pcRef.current = pc;
    return pc;
  };

  // ---- Caller ----
  const startCall = async (peerId, callType) => {
    if (call.status !== "idle") return;
    try {
      await getMedia(callType);
    } catch { alert("Camera/microphone permission denied"); return; }
    peerRef.current = peerId;
    setCall({ status: "calling", peerId, callType });
    socket.emit("call:invite", { to: peerId, callType }, (res) => {
      if (res?.error) { alert(`Cannot call: ${res.error}`); cleanup(); }
    });
  };

  // ---- Callee ----
  const acceptCall = async () => {
    try {
      const stream = await getMedia(call.callType);
      createPeer(stream);
      setCall((c) => ({ ...c, status: "connecting" }));
      socket.emit("call:accept", { to: call.peerId });
    } catch { rejectCall(); }
  };

  const rejectCall = () => {
    socket.emit("call:reject", { to: call.peerId });
    cleanup();
  };

  const endCall = useCallback(() => {
    if (peerRef.current) socket?.emit("call:end", { to: peerRef.current });
    cleanup();
  }, [socket, cleanup]);

  const toggleMute = () => {
    localRef.current?.getAudioTracks().forEach((t) => (t.enabled = muted));
    setMuted(!muted);
  };
  const toggleCamera = () => {
    localRef.current?.getVideoTracks().forEach((t) => (t.enabled = camOff));
    setCamOff(!camOff);
  };

  // ---- Signaling listeners ----
  useEffect(() => {
    if (!socket) return;

    const onIncoming = ({ from, callType }) => {
      peerRef.current = from;
      setCall({ status: "ringing", peerId: from, callType });
    };
    const onAccepted = async () => {
      setCall((c) => ({ ...c, status: "connecting" }));
      const pc = createPeer(localRef.current);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("webrtc:offer", { to: peerRef.current, sdp: offer });
    };
    const onOffer = async ({ sdp }) => {
      const pc = pcRef.current;
      await pc.setRemoteDescription(sdp);
      pendingIce.current.forEach((c) => pc.addIceCandidate(c));
      pendingIce.current = [];
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("webrtc:answer", { to: peerRef.current, sdp: answer });
    };
    const onAnswer = async ({ sdp }) => {
      const pc = pcRef.current;
      await pc.setRemoteDescription(sdp);
      pendingIce.current.forEach((c) => pc.addIceCandidate(c));
      pendingIce.current = [];
    };
    const onIce = async ({ candidate }) => {
      const pc = pcRef.current;
      if (pc?.remoteDescription) await pc.addIceCandidate(candidate);
      else pendingIce.current.push(candidate); // arrived before the offer/answer
    };

    socket.on("call:incoming", onIncoming);
    socket.on("call:accept", onAccepted);
    socket.on("call:reject", cleanup);
    socket.on("call:end", cleanup);
    socket.on("webrtc:offer", onOffer);
    socket.on("webrtc:answer", onAnswer);
    socket.on("webrtc:ice", onIce);
    return () => {
      ["call:incoming","call:accept","call:reject","call:end",
       "webrtc:offer","webrtc:answer","webrtc:ice"].forEach((e) => socket.off(e));
    };
  }, [socket, cleanup]);

  return (
    <CallContext.Provider value={{
      call, localStream, remoteStream, muted, camOff,
      startCall, acceptCall, rejectCall, endCall, toggleMute, toggleCamera,
    }}>
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext);