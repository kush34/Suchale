import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button';
import Navbar from './components/landing/Navbar';
import Hero from './components/landing/Hero';
import PhotoMasonary from './components/landing/PhotoMasonary';
import FAQs from './components/landing/FAQs';

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