import React, { useState, useEffect, useRef, useContext } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { IoIosSend } from "react-icons/io";
import { AuthContext } from '../context/AuthContext';
import { createSocketConnection } from '../utils/socket';
import { BASE_URL } from "../constant";


const Chat = () => {
  const { id } = useParams()
  const [messages, setMessages] = useState([])
  const [chatUser, setChatUser] = useState(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const {user}=useContext(AuthContext)
  const socketRef = useRef(null);
  
  const userId=user?._id
  const senderId=userId

//   if (!userId || !id) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         Loading...
//       </div>
//     );
//   }
  
  

  //create a socket connection
  useEffect(()=>{
    socketRef.current=createSocketConnection()

    return  ()=>{
        socketRef.current.disconnect()
    }
  },[id,userId])


// join a chat
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.emit("joinChat", { userId, targetUserId:id });
   
  }, [id,userId]);
  

  
   
  // Fetch chat user details
  useEffect(() => {
    const fetchChatUser = async () => {
      try {
        setIsLoading(true)
      
        const res = await axios.get(`${BASE_URL}/user/chat/${id}`,{withCredentials:true})
      
        setChatUser(res.data)
        
     
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchChatUser()
    }
  }, [id])



  // Fetch chat messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
       
        const res = await axios.get(`${BASE_URL}/chats/${id}`,{withCredentials:true})

      const messages=res.data?.messages || []

       const chatMessages=messages.map((msg)=>({
           sender:msg.senderId,
           content:msg.text,
           timestamp:msg.createdAt,

        }
       ))

       setMessages(chatMessages)
       
      } catch (error) {
        console.error('Failed to fetch messages:', error.message)
      }
    }

    if (id) {
      fetchMessages()
    }
  }, [id,userId])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])



  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!inputMessage.trim() || !id) return

    const newMessage = {
      id: Date.now().toString(),
      sender: userId,
      content: inputMessage,
      timestamp: new Date(),
     
    }
     
    
    if (!socketRef.current) return;
    socketRef.current.emit("sendMessage",{userId,targetUserId:id,senderId,text:inputMessage})
 
    setInputMessage('')

  }

// recieve message
  useEffect(() => {
    if (!socketRef.current) return;
  
    const handler = ({ userId,senderId, text }) => {
      console.log(userId + ":" + text);
     
      if(userId==senderId) return;

      setMessages((prev) => [
        ...prev,
        {
          content: text,
          sender: senderId,
          timestamp: new Date(),
          
        },
      ]);
    };
  
    socketRef.current.on("messageReceived", handler);
  
    return () => {
      socketRef.current.off("messageReceived", handler);
    };
  }, []);
  

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-lg text-gray-600">Loading chat...</div>
      </div>
    )
  }

  return (
    // <div className="flex flex-col h-screen bg-gray-50">

    <div
  className="flex flex-col h-screen bg-cover bg-center"
  style={{
    backgroundImage:
      "url('https://storage.pixteller.com/designs/designs-images/2019-03-27/05/love-and-passion-background-backgrounds-romantic-1-5c9b9947439b9.png')",
  }}
>

      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
        <div className="flex items-center gap-3 p-4">
          {chatUser?.profilePicture ? (
            <img
              src={chatUser.profilePicture}
              alt={chatUser.firstname}
              className="w-12 h-12 rounded-full object-cover"
            /> 
          )  :  <img
          src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuOzphTLwY88bzD9argr8JGAf1518mgVc7ig&s"}
          alt={chatUser.firstname}
          className="w-12 h-12 rounded-full object-cover"
        /> 
        }
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {chatUser?.firstname + " "+ chatUser?.lastname|| 'Chat'}
            </h2>
            {/* <span
              className={`text-xs font-medium ${
                chatUser?.status === 'online' ? 'text-green-600' : 'text-gray-500'
              }`}
            >
              {chatUser?.status === 'online' ? '● Online' : '● Offline'}
            </span> */}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-base">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
            messages.map((message, index) => {
                const isCurrentUser = message.sender === userId;
              
                return (
                  <div
                    key={index}
                    className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                        isCurrentUser
                          ? 'bg-green-500 text-white rounded-br-none'
                          : 'bg-white text-gray-900 rounded-bl-none border'
                      }`}
                    >
                      <p className="text-sm break-words">{message.content}</p>
              
                      <div className="flex justify-end mt-1">
                        <span className="text-[10px] opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
              
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 bg-[radial-gradient(circle,_#fff7ed,_#ffe4e6,_#fbcfe8)]">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={!chatUser}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || !chatUser}
            className="px-6 py-2 bg-blue-500 text-white rounded-full font-semibold text-sm hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
           <IoIosSend />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Chat;