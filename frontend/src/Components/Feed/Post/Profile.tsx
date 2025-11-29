import React from 'react'


const Profile = ({ src, username }: { src: string, username: string }) => {
    return (
        <div className='flex items-center gap-2 text-zinc-500'>
            <img src={src} alt="profile_image" className='w-10 h-10  rounded-full ' />
            <span>
                {username}
            </span>
        </div>
    )
}

export default Profile