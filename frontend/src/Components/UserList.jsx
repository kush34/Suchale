import React, { useContext } from 'react'
import { Settings } from 'lucide-react';
import UserCard from './UserCard';
import { Search } from 'lucide-react';
import { Plus } from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const UserList = ({userChatList}) => {
  const navigate = useNavigate();
  
  
  return (
    <div className='p-4 shadow-2xl bg-white'>
      <div className="top flex justify-between">
        <div className="text-lg md:text-xl xl:text-2xl font-bold xl:px-3 xl:py-2">
          Suchale
        </div>
        <div className="settings flex justify-center items-center xl:m-3">
          <div className='cursor-pointer hover:scale-115 ease-in  duration-120 m-1'>
            <Search />
          </div>
          <div onClick={()=>navigate('/settings')} className='cursor-pointer m-1 hover:scale-115 ease-in duration-120'>
            <Settings />
          </div>
          <div onClick={()=>navigate('/addContacts')} className='cursor-pointer m-1 hover:scale-115 ease-in duration-120'>
            <Plus />
          </div>
        </div>
      </div>
      <div className="userlist flex flex-col gap-2 m-3">
        {
          userChatList.length > 0 ? 
          <div>
            {userChatList?.map((user)=>{
              return (
                <UserCard user={user}/>
              )
            })}
          </div>
          :
          <div className='text-center'>
            No Chats Found
          </div>
        }
      </div>
    </div>
  )
}

export default UserList