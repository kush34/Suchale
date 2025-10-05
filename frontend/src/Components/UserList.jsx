import React, { useContext, useEffect, useState } from 'react'
import { Settings, UserRoundPlus } from 'lucide-react';
import UserCard from './UserCard';
import { Search } from 'lucide-react';
import { Plus } from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import { ThemeContext } from '../Store/ThemeContext';
import GroupCard from './GroupCard';
import CreateGroupDialog from './CreateGroupDialog';

const UserList = ({userChatList}) => {
  const navigate = useNavigate();
  const [isSearchOpen,setIsSearchOpen] = useState(false);
  const [searchBar ,setSearchBar] = useState();
  const {theme} = useContext(ThemeContext)
  useEffect(()=>{

  },[searchBar])
  return (
    <div className={`${theme ? "bg-white text-black":"bg-zinc-900 text-white"} p-4 md:p-0  shadow-2xl h-full md:rounded-2xl`}>
      <div className="top flex justify-between 1/6">
        <div className="text-lg md:text-xl xl:text-2xl font-bold xl:px-3 xl:py-2 tracking-wide text-blue-400">
          Suchale
        </div>
        <div className="settings flex justify-center items-center xl:m-3">
          {/* <button onClick={()=>setIsSearchOpen((prev)=>!prev)} className='cursor-pointer hover:scale-115 ease-in  duration-120 m-1'>
            <Search />
          </button> */}
          <div onClick={()=>navigate('/settings')} className='cursor-pointer m-1 hover:scale-115 ease-in duration-120'>
            <Settings />
          </div>
          <div onClick={()=>navigate('/addContacts')} className='cursor-pointer m-1 hover:scale-115 ease-in duration-120'>
            <UserRoundPlus />
          </div>
          <div className=''>
            <CreateGroupDialog/>
          </div>
        </div>
      </div>
      <div className="searchbar px-4">
        {
          isSearchOpen &&
          <div>
            <input onChange={(e)=>setIsSearchOpen(e.target.value)} value={searchBar} className={`${theme ? "bg-zinc-200":"bg-zinc-8 00"} rounded outline-none w-full text-center py-1`} placeholder='Search' type="text" name="" id="" />
          </div>
        }
      </div>
      <div className="userlist flex flex-col gap-2 m-3 h-5/6">
        {
          userChatList.length > 0 ? 
          <div className='overflow-y-scroll no-scrollbar h-full'>
            {userChatList?.map((user,index)=>{
              return (
                <div key = {index}>
                  {
                    user.isGroup 
                    ?
                    
                    <GroupCard group={user}/>
                    :
                    <UserCard user={user}/>
                  }
                </div>
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