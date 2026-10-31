

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { AuthContext } from "./AuthContext";

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user?._id) return;
    const s = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,           // sends the JWT cookie
      transports: ["websocket", "polling"],
    });
    setSocket(s);
    return () => { s.disconnect(); setSocket(null); };
  }, [user?._id]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};