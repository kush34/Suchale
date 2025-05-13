import React, { useState} from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOtp = ({email,password,username}) => {
    const navigate = useNavigate();
    const [otp,setOtp] = useState();
    const sendOtp = async ()=>{
        try {
            const response = await axios.post(`${import.meta.env.VITE_URL}/user/verifyOtp`, {
              email:email,
              username:username,
              password:password,
              otp,
            });
            if (response.status === 200) {
              navigate('/login');
            }
          } catch (error) {
            console.log(error.response?.data || error.message);
          }
    }
  return (
    
    <div className='w-full h-screen flex flex-col justify-center  '>
        <div className = " flex flex-col justify-center items-center m-5">
            <h1 className="m-3 text-6xl font-bold">Enter your OTP</h1>    
            <p className="text-sm">please enter your OTP sent to your mail ID</p>
        </div>
        <div className="flex flex-col justify-center items-center">
            <input type="number" value={otp} onChange={(e)=>setOtp(e.target.value)} className="py-2 px-5 text-center bg-zinc-300 rounded outline-none" placeholder='enter your OTP' name="" id="" />
            <div className="submit">
                <button onClick = {sendOtp}className="cursor-pointer hover:scale-105 hover:bg-white hover:text-black border-2 border-black ease-in duration-120 bg-black text-white rounded py-2 px-5 m-5">Submit</button>
            </div>
        </div>
    </div>
  )
}

export default VerifyOtp