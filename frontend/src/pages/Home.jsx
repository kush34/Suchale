import React, { useEffect, useState } from 'react'
import api from '../utils/axiosConfig';
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  const [userChatList,setUserChatList] = useState([]);
  //list of contacts of user
  const getChatList = async ()=>{
    try{
      const response = await api.get('/user/userList');
      // console.log(response.data);
      setUserChatList(response.data.contacts);
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
    <div className='flex h-screen bg-zinc-300'>
        <UserList userChatList= {userChatList}/>
        <UserChat/>
    </div>
  )
}

export default Home