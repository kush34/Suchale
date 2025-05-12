import React, { useContext, useEffect, useState } from 'react'
import api from '../utils/axiosConfig';
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
import { useNavigate } from 'react-router-dom'
import socket from '../utils/socketService';
import { ChatContext } from '../Store/ChatContext';
import Loader1 from "../loaders/Loader1.jsx"
const Home = () => {
  const navigate = useNavigate();
  const [userChatList,setUserChatList] = useState([]);
  const [loading,setLoading] = useState(false);
  const {chat} = useContext(ChatContext);
  //list of contacts of user
  
  const getChatList = async ()=>{
    try{
	setLoading(true);	
      const response = await api.get('/user/userList');
      // console.log(response.data);
        setUserChatList(response.data.response);
     setLoading(false);
    }
    catch(err){
      console.log(err.message);
    }
  }
  
  useEffect(()=>{
    getChatList();
  },[])
  useEffect(() => {
    function friendOffline(username) {
      setUserChatList(prevList => 
        prevList.map(user => 
          user.username === username 
            ? { ...user, status: 'Offline' } 
            : user
        )
      );
    }
    function friendOnline(username) {
      setUserChatList(prevList => 
        prevList.map(user => 
          user.username === username 
            ? { ...user, status: 'Online' } 
            : user
        )
      );
    }
    socket.on("friendOffline", friendOffline);
    socket.on("friendOnline", friendOnline);
  
    return () => {
      socket.off("friendOffline", friendOffline);
      socket.off("friendOffline", friendOnline);
    };
  }, []);
  if(loading){
	return ( <Loader1/>);
  }
  return (
    // <div className='flex h-screen bg-zinc-300'>
    <div className={`md:flex h-screen bg-zinc-300 overflow-none`}> 
    <div className={`md:w-1/4 h-screen md:h-9/10 md:m-5 ${chat ? "hidden" : "block"} md:block`}>
        <UserList userChatList= {userChatList}/>
    </div>
    {
      chat &&
      <div className='w-full md:w-3/4 h-screen md:h-9/10 md:m-3 md:mt-5 overflow-none'>
      <UserChat/>
      </div>
    }
    </div>
  )
}

export default Home
