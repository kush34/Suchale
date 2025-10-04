import React, { useContext } from 'react';
import { ChatContext } from '../Store/ChatContext';
import { ThemeContext } from '../Store/ThemeContext';

const GroupCard = ({ group }) => {
  const { chat, setChat, setGroupFlag } = useContext(ChatContext);
  const { theme } = useContext(ThemeContext);

  const handleClick = () => {
    if (chat?._id !== group?._id) {
      setChat(group);
      setGroupFlag(true);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${theme ? "bg-white text-black" : "text-white"} 
        flex gap-3 items-center pb-3 hover:scale-105 hover:bg-zinc-600 
        ease-in duration-150 rounded cursor-pointer hover:shadow-xl`}
    >
      <div className="ml-2 userimg mt-2 flex items-end">
        <img className="w-12 h-12 rounded-full" src={group?.profilePic} alt="" />
      </div>

      <div className="mx-2">
        <div className="userName text-xl font-medium">{group?.name}</div>
        <div className="lastmsg font-light text-sm">call you later</div>
      </div>
    </div>
  );
};

export default GroupCard;
