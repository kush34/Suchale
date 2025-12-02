import { useContext, useEffect, useState } from 'react'
import { Settings, UserRoundPlus, X } from 'lucide-react';
import UserCard from './UserCard';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeContext } from '../Store/ThemeContext';
import GroupCard from './GroupCard';
import CreateGroupDialog from './CreateGroupDialog';
import { Chat } from '@/types';

const UserList = ({ userChatList }: { userChatList: Chat[] }) => {
  const [dispChat, setDispChat] = useState<Chat[]>(userChatList);
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchBar, setSearchBar] = useState<string>('');
  useEffect(() => {
    const q = searchBar.trim().toLowerCase();

    if (!q) {
      setDispChat(userChatList);
      return;
    }

    const filtered = userChatList.filter((item) => {
      const uname = item.username?.toLowerCase() || "";  // user
      const gname = item.name?.toLowerCase() || "";      // group

      return uname.includes(q) || gname.includes(q);
    });

    setDispChat(filtered);
  }, [searchBar, userChatList]);
  return (
    <div className={`bg-card p-4 md:p-0  shadow-2xl h-full border-r-2 `}>
      <div className="top flex justify-end 1/6">

        <div className="settings flex justify-center items-center xl:m-3">
          <button onClick={() => setIsSearchOpen((prev) => !prev)} className='cursor-pointer hover:scale-115 ease-in  duration-120 m-1'>
            <Search />
          </button>
          <div onClick={() => navigate('/settings')} className='cursor-pointer m-1 hover:scale-115 ease-in duration-120'>
            <Settings />
          </div>
          <div onClick={() => navigate('/addContacts')} className='cursor-pointer m-1 hover:scale-115 ease-in duration-120'>
            <UserRoundPlus />
          </div>
          <div className=''>
            <CreateGroupDialog />
          </div>
        </div>
      </div>
      <div className="searchbar px-4">
        {
          isSearchOpen &&
          <div className={`bg-accent flex items-center rounded`}>
            <input onChange={(e) => setSearchBar(e.target.value as string)} value={searchBar} className={` rounded outline-none w-full text-center py-1`} placeholder='Search' type="text" name="" id="" />
            {searchBar.length > 0 && <button onClick={() => setSearchBar('')} className='px-2'><X /></button>}
          </div>
        }
      </div>
      <div className="userlist flex flex-col gap-2 m-3 h-5/6">
        {
          dispChat.length > 0 ?
            <div className='overflow-y-scroll no-scrollbar h-full'>
              {dispChat?.map((user, index) => {
                return (
                  <div key={index}>
                    {
                      user.isGroup
                        ?

                        <GroupCard group={user} />
                        :
                        <UserCard user={user} />
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