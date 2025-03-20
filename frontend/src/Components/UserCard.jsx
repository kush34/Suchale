import React from 'react'

const UserCard = () => {
  return (
    <div className='flex items-center border-b pb-3 hover:bg-zinc-200 ease-in duration-150 rounded'>
        <div className="ml-2 userimg mt-2">
            <img className='w-12 h-12 rounded-full' src="https://placehold.co/400x400" alt="" />
        </div>
        <div className='mx-2'>
            <div className="userName text-xl font-medium">
                Yash Chatt
            </div>
            <div className="lastmsg font-light text-sm">
                call you later
            </div>
        </div>
    </div>
  )
}

export default UserCard