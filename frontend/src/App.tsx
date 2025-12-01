import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/landing/topbar";
import { Hero } from "@/components/landing/hero-section";
import { PhotoMasonary } from "@/components/landing/photo-section";
import FAQs from "@/components/landing/faqs-section";

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