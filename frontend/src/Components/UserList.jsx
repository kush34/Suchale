import React from 'react'
import { Settings } from 'lucide-react';
import UserCard from './UserCard';

const UserList = () => {
  return (
    <div className='bg-white w-1/4 h-9.5/10 m-5 rounded'>
      <div className="top flex justify-between">
        <div className="text-2xl font-bold px-3 py-2">
          Suchale
        </div>
        <div className="settings flex justify-center items-center m-3">
          <Settings />
        </div>
      </div>
      <div className="userlist flex flex-col gap-2 m-3">
        <UserCard/>
      </div>
    </div>
  )
}

export default UserList