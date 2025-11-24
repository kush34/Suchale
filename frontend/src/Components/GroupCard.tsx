import { useContext } from 'react';
import { ChatContext } from '../Store/ChatContext';
import { ThemeContext } from '../Store/ThemeContext';
import { Chat, Group } from '@/types';
import { Infinity } from 'lucide-react';


export function formatChatTime(dateString: string) {
  if (!dateString) {
    return '';
  }

  const messageDate = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = Number(now) - Number(messageDate);
  const diffInHours = diffInMilliseconds / (1000 * 60 * 60);

  const format12Hour = (date: Date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;
    const minuteString = minutes < 10 ? '0' + minutes : minutes;

    return `${hours}:${minuteString} ${ampm}`;
  };

  if (diffInHours < 24) {
    return format12Hour(messageDate);
  }

  const isYesterday = (date: Date) => {
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    return date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();
  };

  if (diffInHours >= 24 && diffInHours < (24 * 7)) {
    if (isYesterday(messageDate)) {
      return 'Yesterday';
    }

    return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
  }

  return messageDate.toLocaleDateString('en-US');
}

type GroupCardProps = {
  group: Chat;
}

const GroupCard = ({ group }: GroupCardProps) => {
  const userCtx = useContext(ChatContext)
  if (!userCtx) return null;
  const { chat, setChat, setGroupFlag } = userCtx;
  const themeCtx = useContext(ThemeContext);
  const theme = themeCtx?.theme;
  const dateString = group?.lastMessage?.createdAt;
  const formattedTime = formatChatTime(dateString);
  const handleClick = () => {
    if (chat?._id !== group?._id) {
      setChat(group);
      setGroupFlag(true);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`${theme ? "bg-white text-black border-zinc-100" : "text-white border-zinc-800"} 
        flex gap-3 items-center pb-3 hover:bg-zinc-400 
        ease-in duration-150 rounded cursor-pointer justify-between hover:shadow-xl border-b`}
    >
      <div className='flex gap-3'>
        <div className="ml-2 userimg mt-2 flex items-end">
          <img className="w-12 h-12 rounded-full" src={group?.profilePic} alt="" />
        </div>

        <div className="mx-2">
          <div className="userName text-xl font-medium">{group?.name}</div>
          <div className="lastmsg font-light text-sm text-zinc-500">{group?.lastMessage?.content || " "}</div>
        </div>
      </div>
      <div className='flex items-start text-zinc-500 text-sm'>
        {group?.lastMessage?.createdAt ?
          <span >
            {formattedTime}
          </span>
          :
          <span>
            <Infinity size={16} strokeWidth={1} />
          </span>
        }
      </div>
    </div>
  );
};

export default GroupCard;
