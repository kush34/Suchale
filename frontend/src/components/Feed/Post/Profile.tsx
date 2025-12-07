import React from 'react'
import { useNavigate } from 'react-router-dom'


const Profile = ({ src, username, size = "w-10 h-10" }: { src: string, username: string, size?: string }) => {
    const navigate = useNavigate();
    return (
        <div onClick={() => navigate(`/profile/${username}`)} className='cursor-pointer flex items-center gap-2 text-zinc-500'>
            <img src={src} alt="profile_image" className={`${size}  rounded-full `} />
            <span>
                {username}
            </span>
        </div>
    )
}

export default Profile