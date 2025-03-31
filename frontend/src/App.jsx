import React from 'react'

const App = () => {
  return (
    <div className='bg-zinc-950 h-screen w-full text-white flex justify-center items-center'>
      <div className="head flex justify-center flex-col items-center">
        <div className='text-5xl font-medium '>
          Suchale 
        </div>
        <button className='hover:scale-105 ease-in duration-150 bg-white px-4 py-2 rounded text-black m-2'>
          <a href="/register" rel="noopener noreferrer">
            Get Started
          </a>
        </button>
      </div>
    </div>
  )
}

export default App