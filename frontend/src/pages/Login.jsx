import React, { useState } from 'react'
import Loader1 from "../loaders/Loader1"
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
const Login = () => {
  const navigate = useNavigate();
  const [username,setUsername] = useState();
  const [password,setPassword] = useState();
  const [flag1,setFlag1] = useState(false);
  const [flag2,setFlag2] = useState(false);
  const [flag3,setFlag3] = useState(false);
  const [loading,setLoading] = useState(false);
  const handleSubmit = async ()=>{
    if(!username || !password){
      setFlag1(true);
    }
    else{
      setLoading(true);
      const request = await axios
        .post(`${import.meta.env.VITE_URL}/user/login`,{
          username,
          password
        })
        .then(res =>{
          if(res.data.status == 1){
            localStorage.setItem("token", res.data.token);
            navigate('/home');
          }else if(res.data.status == 2){
            setFlag2(true);
          }else{
            setFlag3(true);
          }
          
        })
        .catch(err => console.error(err));
        setLoading(false);
    }
  }
  if(loading) return(
    <Loader1/>
  )
  return (
    <div className='w-full h-screen flex justify-center items-center bg-zinc-300'>
      <div className="main w-full xl:w-1/3 h-3/4 rounded flex flex-col justify-center items-center bg-white ">
        <div className="head mt-5 flex flex-col items-center">
          <h1 className='text-xl font-bold'>Login</h1>
          <p className='text-sm text-zinc-500'>enter your account credentials</p>
        </div>
        <div className="form flex flex-col items-center mt-5">
          <div className="username">
            <input onChange={(e)=>setUsername(e.target.value)} type="text" className='text-center rounded outline-none px-3 py-1 border' placeholder='enter your username' name=""/>
          </div>
          <div className="password mt-2">
            <input onChange={(e)=>setPassword(e.target.value)} type="password"  placeholder='enter your password' className='text-center rounded outline-none px-3 py-1 border' name="" />
          </div>
          <div className="submit mt-5">
            <button onClick={handleSubmit} className='bg-black text-white px-2 py-1 rounded cursor-pointer hover:text-zinc-300 ease-in duration-100 hover:scale-105'>Submit</button>
          </div>
          {
            flag1 && 
            <div className='text-red-600 font-bold text-sm mt-5'>
              Please enter your email and password
            </div>
          }
          {
            flag2 && 
            <div className='text-red-600 font-bold text-sm mt-5'>
              invalid credentials Pls try again
            </div>
          }
          {
            flag3 && 
            <div className='text-red-600 font-bold text-sm mt-5'>
              something went wrong
            </div>
          }
        </div>
        <div className='mt-2 text-zinc-800 hover:border-b ease-in duration-100 cursor-pointer' onClick={()=>navigate('/register')}>
          create an account
        </div>
      </div>
    </div>
  )
}

export default Login