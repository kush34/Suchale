import { useContext, useEffect, useState } from 'react'
import api from '../utils/axiosConfig';
import UserChat from '../Components/UserChat'
import UserList from '../Components/UserList'
import { useNavigate } from 'react-router-dom'
import socket from '../utils/socketService';
import { ChatContext } from '../Store/ChatContext';
import Loader1 from "../loaders/Loader1"
import { ThemeContext } from '../Store/ThemeContext';
import { Chat } from '@/types';
const Home = () => {
  const navigate = useNavigate();
  const [userChatList, setUserChatList] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const chatCtx = useContext(ChatContext)
  if (!chatCtx) return null;
  const chat = chatCtx?.chat;
  const themeCtx = useContext(ThemeContext);
  if (!themeCtx) return null;
  const theme = themeCtx?.theme;

  //list of contacts of user

  const getChatList = async () => {
    try {
      setLoading(true);
      const response = await api.get('/user/userList');
      // console.log(response.data);
      setUserChatList(response.data.response);
      setLoading(false);
    }
    catch (err: any) {
      console.log(err.message);
    }
  }

  useEffect(() => {
    getChatList();
  }, [])
  useEffect(() => {
    function friendOffline(username: string) {
      setUserChatList(prevList =>
        prevList.map(user =>
          user.username === username
            ? { ...user, status: 'offline' }
            : user
        )
      );
    }
    function friendOnline(username: string) {
      setUserChatList(prevList =>
        prevList.map(user =>
          user.username === username
            ? { ...user, status: 'online' }
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
  if (loading) {
    return (<Loader1 theme={theme} />);
  }
  return (
    <div className={`md:flex h-screen ${!theme ? "bg-zinc-100" : "bg-zinc-950"} overflow-none`}>
      <div className={`md:w-1/4 h-screen ${chat ? "hidden" : "block"} md:block`}>
        <UserList userChatList={userChatList} />
      </div>
      {
        chat ?
          <div className={` w-full md:w-3/4 h-screen overflow-none`}>
            <UserChat />
          </div>
          :
          <div className={`${theme ? "bg-zinc-100" : "bg-zinc-950"} hidden xl:flex items-center justify-center w-full md:w-3/4 h-screen text-zinc-500`}>
            <span className='w-1/2 flex justify-center flex-col items-center gap-5'>
              <img src="./icon.png" className='w-15 h-15' alt="logo img" />
              Please select a chat to view messages
            </span>
            <span>
            </span>
          </div>
      }
    </div>
  )
}

export default Home
