import React, { useEffect } from 'react'
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
import { useNavigate } from 'react-router-dom'

const Home = () => {
  const navigate = useNavigate();
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if(!token) navigate("/login")
  },[])
  return (
    <div className='flex h-screen bg-zinc-300'>
        <UserList/>
        <UserChat/>
    </div>
  )
}

export default Home