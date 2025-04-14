import React, { useEffect } from 'react'
import { useUser } from '../Store/UserContext';
import {useNavigate} from "react-router-dom"
const Settings = () => {
    const {user} = useUser();
    const navigate = useNavigate();
    const logOut = ()=>{
        localStorage.setItem("token", "");
        navigate("/login")
    }
  return (
    <div>
        <div className="head flex items-center justify-between">
            <div className="title text-4xl m-4 font-bold">
                Settings
            </div>
            <div><button onClick={()=>navigate("/home")} className='m-5 bg-black text-white rounded px-4 py-2 cursor-pointer'>Back</button></div>
        </div>
        <div className='m-5'>
            <div className="profilepic flex justify-center items-center">
            <img
                className="w-40 h-40 object-cover rounded-full"
                src={user?.profilePic || "836.jpg"}
                onError={(e) => { e.target.src = "836.jpg"; }}
                alt="User profile"
            />
            <div className="edit cursor-pointer">
                Edit
            </div>
            </div>
            <div className="username flex flex-col text-xl items-center justify-center ">
                    Username:
                <span className='font-bold'>
                    {user?.username}
                </span>
                Email
                <span className='font-bold'>
                    {user?.email}
                </span>
            </div>
            <div className="flex justify-center m-5 " onClick={logOut}>
                <button className="cursor-pointer font-bold text-white bg-black px-4 py-2 rounded hover:text-red-500 hover:border-2 border-red-500 hover:bg-transparent">
                    Log Out
                </button>
            </div>
        </div>
    </div>
  )
}

export default Settings