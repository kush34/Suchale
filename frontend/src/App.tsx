import { useNavigate } from 'react-router-dom'
import { Button } from '@/Components/ui/button';

const App = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen w-full relative text-white">
      <div className="min-h-screen w-full relative">
        {/* Dark Dot Matrix */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: '#0a0a0a',
            backgroundImage: `
       radial-gradient(circle at 25% 25%, #222222 0.5px, transparent 1px),
       radial-gradient(circle at 75% 75%, #111111 0.5px, transparent 1px)
     `,
            backgroundSize: '10px 10px',
            imageRendering: 'pixelated',
          }}
        />
        <main className='w-full h-screen z-10'>
          <nav className='z-10 p-10 flex justify-around'>
            <div className='z-10 text-2xl tracking-wider font-bold'>
              Suchale
            </div>
            <div className='z-10'>
              <ul className='flex gap-5'>
                <li><a href="#">Home</a></li>
                <li>Features</li>
                <li>Pricing</li>
                <li>Contact</li>
              </ul>
            </div>
            <div className='flex gap-10'>
              <Button onClick={() => navigate("/login")} className={'z-10 hover:scale-105 cursor-pointer'}>Sign In</Button>
            </div>
          </nav>
          <div className="z-10 flex justify-center gap-20 items-center mt-24">
            <div className='z-10 w-1/2 h-1/3'>
              <img src="image.png" className='z-10 w-full h-full rounded shadow-2xl' alt="mockup image" />
            </div>
            <div className='w-1/3 z-10 flex flex-col justify-center'>
              <span className='text-4xl font-light'>
                Blazing Fast Messaging
              </span>
              <span className='text-2xl font-bold'>
                with Security and privacy
              </span>
              <span className='mt-5'>
                <Button onClick={() => navigate("/register")} className={'z-10 hover:scale-105 bg-sky-600 ease-in duration-75 cursor-pointer'}>Join Now</Button>
              </span>
            </div>
          </div>
        </main>
      </div>
    </div >

  )
}

export default App