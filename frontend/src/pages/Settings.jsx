import React, { useEffect, useRef } from 'react'
import { useUser } from '../Store/UserContext';
import {useNavigate} from "react-router-dom"
import api from '../utils/axiosConfig';
const Settings = () => {
    const {user} = useUser();
    const navigate = useNavigate();
    const fileInputRef = useRef();
    const logOut = ()=>{
        localStorage.setItem("token", "");
        navigate("/login")
    }
    const handleUpload = async (e) => {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);
      
        try {
          const res = await api.post("/user/profilepic", formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          console.log("Uploaded URL:", res.data.url);
          // Save this URL in user profile or video DB
        } catch (err) {
          console.error(err);
        }
      };
      const triggerFileInput = () => {
        fileInputRef.current.click();
      };
      
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
            <div className="edit m-5 cursor-pointer">
            <input type="file" className='hidden' onChange={handleUpload}  ref={fileInputRef}/>
            <button onClick={triggerFileInput} className='cursor-pointer hover:bg-transparent hover:text-black ease-in duration-150 border-2 border-black bg-black px-3 py-2 rounded font-bold text-white'>Change</button>
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
                <button className="cursor-pointer font-bold text-white bg-black px-4 py-2 rounded hover:text-red-500 hover:border-2 border-red-500 hover:bg-transparent ease-in duration-150">
                    Log Out
                </button>
            </div>
        </div>
    </div>
  )
}

export default Settings