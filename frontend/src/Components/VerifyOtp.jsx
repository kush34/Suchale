import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from '@/pages/Login';
import { Button } from './ui/button';

const VerifyOtp = ({ email, password, username }) => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState();
  const sendOtp = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_URL}/user/verifyOtp`, {
        email: email,
        username: username,
        password: password,
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-950 font-sans text-white"
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 120%, rgba(50, 80, 200, 0.45) 0%, rgba(10, 10, 10, 1) 50%)',
        backgroundSize: 'cover'
      }}>
      <div className="p-8 rounded-lg"
        style={{
          backgroundColor: 'rgba(20, 20, 20, 0.7)',
          boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 40px rgba(0, 0, 0, 0.7), inset 0 0 8px rgba(70, 130, 180, 0.1)'
        }}>
        <div
          className="flex flex-col justify-center items-center mb-6 space-y-2"
        >
          <h1 className="text-4xl font-bold">Enter your OTP</h1>
          <p className="text-sm text-zinc-400 font-light">Please enter your OTP sent to your mail ID</p>
        </div>
        <div className="flex flex-col justify-center items-center space-y-6">
          <Input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder='enter your OTP'
            name=""
            id=""
            className="w-full max-w-xs p-3 text-black rounded"
          />
          <div className="submit w-full max-w-xs">
            <Button
              onClick={sendOtp}
              className="w-full"
            >
              Submit
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyOtp