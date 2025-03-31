import React, { useState } from 'react'
import axios from 'axios';

const Register = () => {
    const [username,setUsername] = useState();
    const [flag1,setFlag1] = useState(true);
    const [flag2,setFlag2] = useState(true);
    const [flag3,setFlag3] = useState(false);
    const [flag4,setFlag4] = useState(false);
    const [password,setPassword] = useState();
    const [email,setEmail] = useState();
    const validateEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
      };
    const checkUserName = async ()=>{
        if(username.length <= 0) return;
        // console.log(username);
        const request = await axios.post(`${import.meta.env.VITE_URL}/user/usernameCheck`, {username});
        // console.log(typeof request.data.status, request.data.status);
        if(request.data.status === "1"){
            setFlag2(false);
            setFlag1(true);
        }
        else {
            setFlag1(false);
            setFlag2(true);
        }
    }
    const validate  = ()=>{
        if(!username || !password || !email || password.length < 6 || !validateEmail(email)){
            setFlag3(true);
            return false;
        }else{
            setFlag3(false);
            return true;
        }

    }
    const handleSubmit = async ()=>{
        if(!validate()) return;
        else{
            const request = await axios.post(`${import.meta.env.VITE_URL}/user/create`,{
                email,
                username,
                password
            });
            if(request.data.status == 200){
                setFlag4(true);
            }
        }
    }
  return (
    <div className={` w-full h-screen flex items-center justify-center bg-zinc-300`}>
        <div className={`main w-3/4 xl:w-1/3 h-3/4 bg-white rounded-xl ${flag3 ? "border border-red-600" : "border-none"} ${flag4 && "border border-green-600" }`}>
            <div className="mt-5 head flex flex-col justify-center items-center h-1/4">
                <h1 className='text-2xl font-bold'>
                    Register 
                </h1>
                <p className='text-sm text-zinc-500'>create your account</p>
            </div>
            <div className="form mt-5 flex flex-col justify-center items-center">
                {/* username */}
                <div className='flex flex-col justify-center'>
                    <div className='flex justify-center'>
                        <input type="text" onChange={(e)=>setUsername(e.target.value)} className='outline-none rounded border px-2 py-1 text-zinc-600' placeholder='choose your username' name="" id="" />
                        <button onClick={checkUserName} className='bg-black px-2 py-1 rounded ml-2 text-white cursor-pointer hover:text-zinc-300 ease-in duration-150 hover:scale-105'>Check</button>
                    </div>
                    <div className={`${flag1 ? "hidden" : "flex"} text-red-500  justify-center`}>
                        <p>username not availabe</p>
                    </div>
                    <div className={`${flag2 ? 'hidden' : 'flex'} text-green-500  justify-center`}>
                        <p>username availabe</p>
                    </div>
                </div>
                <div className="email flex justify-center mt-5">
                    <input onChange={(e)=>setEmail(e.target.value)} type="text" className='outline-none rounded border px-2 py-1 text-zinc-600' placeholder='enter your email'/>
                </div>
                <div className="password flex justify-center mt-5">
                    <input onChange={(e)=>setPassword(e.target.value)} type="password" className='outline-none rounded border px-2 py-1 text-zinc-600' placeholder='choose your password'/>
                </div>
                <div className="submit">
                    <button onClick={handleSubmit} className='bg-black mt-5 px-2 py-1 rounded text-white cursor-pointer hover:text-zinc-300 ease-in duration-100 hover:scale-105'>
                     Submit
                    </button>
                </div>
                {
                    flag4 &&
                    <div className='cursor-pointer mt-5 hover:text-sky-500'>
                        <a href="/login">
                            <p>Account created, Pls login here</p>
                        </a>
                    </div>
                }
                {
                    flag3 &&
                <div className="flag3 text-sm text-red-500 mt-5 text-center">
                    <p>Pls fill all the details</p>
                    <p>Enter valid email address</p>
                    <p>Pls check username before submitting</p>
                    <p>Password should be more than 6 characters</p>
                </div>
                }
            </div>
            <div className="loginlink">

            </div>
        </div>
    </div>
  )
}

export default Register