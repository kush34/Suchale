import React, { useContext, useEffect, useState } from 'react'
import api from '../utils/axiosConfig';
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
import { useNavigate } from 'react-router-dom'
import { ChatContextProvider } from '../Store/ChatContext';

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