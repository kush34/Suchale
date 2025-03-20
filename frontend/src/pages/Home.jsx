import React from 'react'
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
const Home = () => {
  return (
    <div className='flex h-screen bg-zinc-300'>
        <UserList/>
        <UserChat/>
    </div>
  )
}

export default Home