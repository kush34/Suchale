import React, { useState } from 'react'
import axios from 'axios';
const Login = () => {
  const [username,setUsername] = useState();
  const [password,setPassword] = useState();
  const [flag1,setFlag1] = useState(false);

  const handleSubmit = async ()=>{
    if(!username || !password){
      setFlag1(true);
    }
    else{
      const request = await axios
        .post(`${import.meta.env.VITE_URL}/user/login`,{
          username,
          password
        })
        .then(res =>{
          if(res.data){
            localStorage.setItem("token", res.data);
          }
        })
        .catch(err => console.error(err));
    }
  }
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
        </div>
      </div>
    </div>
  )
}

export default Login