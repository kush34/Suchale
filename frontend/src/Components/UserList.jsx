import React from 'react'
import { Settings } from 'lucide-react';
import UserCard from './UserCard';
import { Search } from 'lucide-react';

const UserList = () => {
  return (
    <div className='bg-white w-1/4 h-9.5/10 m-5 rounded'>
      <div className="top flex justify-between">
        <div className="text-2xl font-bold px-3 py-2">
          Suchale
        </div>
        <div className="settings flex justify-center items-center m-3">
          <div className='cursor-pointer hover:scale-115 ease-in  duration-120 m-2'>
            <Search />
          </div>
          <div className='cursor-pointer m-2 hover:scale-115 ease-in duration-120'>
            <Settings />
          </div>
        </div>
      </div>
      <div className="userlist flex flex-col gap-2 m-3">
        <UserCard/>
      </div>
    </div>
  )
}

export default UserList