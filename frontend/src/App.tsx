import { useNavigate } from 'react-router-dom'
import { Button } from '@/Components/ui/button';
import Navbar from './Components/landing/Navbar';
import Hero from './Components/landing/Hero';
import PhotoMasonary from './Components/landing/PhotoMasonary';
import FAQs from './Components/landing/FAQs';

const App = () => {
  const navigate = useNavigate();
  return (
    <div className='max-w-8xl min-h-screen mx-auto'>
      <Navbar />
      <Hero />
      <PhotoMasonary />
      <FAQs />
    </div>

  )
}

export default App