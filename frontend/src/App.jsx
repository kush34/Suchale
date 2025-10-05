import React from 'react'
import { Button } from './Components/ui/button'
import { useNavigate } from 'react-router-dom'

const App = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full relative">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
          backgroundSize: "20px 20px",
          backgroundPosition: "0 0, 0 0",
          maskImage: `
          repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
      `,
          WebkitMaskImage: `
    repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)
      `,
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
      />
      <main className='w-full h-screen'>
        <nav className='z-10 p-10 flex justify-around'>
          <div className='text-2xl text-blue-400 font-bold'>
            Suchale
          </div>
          <div className='flex gap-10'>
            <Button onClick={()=>navigate("/login")} className={'z-10 hover:scale-105 cursor-pointer'}>Sign In</Button>
          </div>
        </nav>
        <landing className="flex justify-center items-center mt-36">
          <div className='z-10 flex flex-col '>
            <span className='text-5xl font-bold'>
              Blazing Fast Messaging
            </span>
            <span className='text-2xl font-light'>
              with Security and privacy
            </span>
            <span className='mt-5'>
              <Button onClick={()=>navigate("/register")} className={'z-10 hover:scale-105 ease-in duration-75 cursor-pointer'}>Join Now</Button>
            </span>
          </div>
        </landing>
      </main>
    </div>

  )
}

export default App