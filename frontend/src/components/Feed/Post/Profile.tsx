import React from 'react'
import { useNavigate } from 'react-router-dom'


const Profile = ({ src, username, w = 10, h = 10 }: { src: string, username: string, w?: number, h?: number }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/profile/${username}`)} className='cursor-pointer flex items-center gap-2 text-zinc-500'>
            <img src={src} alt="profile_image" className={`w-${w} h-${h}  rounded-full `} />
            <span>
                {username}
            </span>
        </div>
    )
}

export default Profile