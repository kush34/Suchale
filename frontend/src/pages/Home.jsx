import React, { useContext, useEffect, useState } from 'react'
import api from '../utils/axiosConfig';
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
import { useNavigate } from 'react-router-dom'
import { ChatContextProvider } from '../Store/ChatContext';
import {io} from "socket.io-client";
const Home = () => {
  const navigate = useNavigate();
  const [userChatList,setUserChatList] = useState([]);
  // const {chat} = useContext(ChatContext);
  //list of contacts of user
  
  const getChatList = async ()=>{
    try{
      const response = await api.get('/user/userList');
      // console.log(response.data);
      setUserChatList(response.data.response);
    }
    catch(err){
      console.log(err.message);
    }
  }
  
  useEffect(()=>{
    getChatList();
  },[])
  
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(!token) navigate("/login")
  },[])
  // useEffect(() => {
  //   const socket = io("http://localhost:3000");
  
  //   socket.on("connect", () => {
  //     console.log("✅ Socket connected", socket.id);
  //   });
  
  //   socket.on("disconnect", () => {
  //     console.log("❌ Socket disconnected");
  //   });
  
  //   return () => socket.disconnect();
  // }, []);
  return (
    <ChatContextProvider>
      <div className='flex h-screen bg-zinc-300'>
          <UserList userChatList= {userChatList}/>
          <UserChat/>
      </div>
    </ChatContextProvider>
  )
}

export default Home