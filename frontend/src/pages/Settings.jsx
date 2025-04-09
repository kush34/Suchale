import React from 'react'

const Settings = () => {
    const logOut = ()=>{
        localStorage.setItem("token", "");
    }
  return (
    <div>
        <div className="head text-4xl m-4 font-bold">
            Settings
        </div>
        <div className='m-5'>
            <button className="cursor-pointer" onClick={logOut}>
                Log Out
            </button>
        </div>
    </div>
  )
}

export default Settings