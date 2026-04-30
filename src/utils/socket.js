import { io } from "socket.io-client"
import { BASE_URL } from "../constant";

export const createSocketConnection =()=>{

    return io(`${import.meta.env.VITE_API_URL}`)
}