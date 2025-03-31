import React, { useState } from 'react'

const Register = () => {
    const [username,setUsername] = useState();
    const checkUserName = async ()=>{
        if(username.length <= 0) return;
        console.log(username);
    }

  return (
    <div className='w-full h-screen flex items-center justify-center bg-zinc-300 '>
        <div className="main w-3/4 xl:w-1/3 h-3/4 bg-white rounded-xl ">
            <div className="mt-5 head flex flex-col justify-center items-center h-1/4">
                <h1 className='text-2xl font-bold'>
                    Register 
                </h1>
                <p className='text-sm text-zinc-500'>create your account</p>
            </div>
            <div className="form mt-5 flex flex-col justify-center items-center">
                {/* username */}
                <div className='flex justify-center'>
                    <input type="text" onChange={(e)=>setUsername(e.target.value)} className='outline-none rounded border px-2 py-1 text-zinc-600' placeholder='choose your username' name="" id="" />
                    <button onClick={checkUserName} className='bg-black px-2 py-1 rounded ml-2 text-white cursor-pointer hover:text-zinc-300 ease-in duration-150 hover:scale-105'>Check</button>
                </div>
                <div className="email flex justify-center mt-5">
                    <input type="text" className='outline-none rounded border px-2 py-1 text-zinc-600' placeholder='enter your email'/>
                </div>
                <div className="password flex justify-center mt-5">
                    <input type="password" className='outline-none rounded border px-2 py-1 text-zinc-600' placeholder='choose your password'/>
                </div>
                <div className="submit">
                    <button className='bg-black mt-5 px-2 py-1 rounded text-white cursor-pointer hover:text-zinc-300 ease-in duration-100 hover:scale-105'>
                     Submit
                    </button>
                </div>
            </div>
            <div className="loginlink">

            </div>
        </div>
    </div>
  )
}

export default Register