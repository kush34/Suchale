import React, { useContext, useEffect, useState } from 'react'
import api from '../utils/axiosConfig';
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
import { useNavigate } from 'react-router-dom'
import socket from '../utils/socketService';
const Home = () => {
  const navigate = useNavigate();
  const [userChatList,setUserChatList] = useState([]);
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
  
  return (
    <div className='flex h-screen bg-zinc-300'>
        <UserList userChatList= {userChatList}/>
        <UserChat/>
    </div>
  )
}

export default Home