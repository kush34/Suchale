import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/home-navbar";
import { Hero } from "@/components/landing/hero";
import { PhotoMasonary } from "@/components/landing/photo-marque";
import FAQs from "@/components/landing/faqs";

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