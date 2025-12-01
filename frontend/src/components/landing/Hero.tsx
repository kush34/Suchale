import React, { useEffect, useState } from 'react'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from 'react-router-dom'

export const Hero = () => {
    const badge = ["->  latest  ->", "-> positive ->", "-> trending ->"]
    const [index, setIndex] = useState(0);
    const navigate = useNavigate();
    useEffect(() => {
        const updateTime = setInterval(() => setIndex(prev => (prev + 1) % badge.length), 2000)
        return () => clearInterval(updateTime)
    }, [badge.length])
    return (
        <div className='flex flex-col items-center justify-center mt-24'>
            <section>
                <span className="badge">
                    <ul className='flex gap-2 border px-5 py-1 rounded-4xl font-light h-10 items-center'>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.5 }}
                            >
                                {badge[index]}
                            </motion.span>
                        </AnimatePresence>
                    </ul>
                </span>
            </section>
            <section className='flex flex-col items-center justify-center'>
                <h1 className='font-semibold text-xl md:text-6xl my-5 text-center'>Real and Live Stories <br />with data safety & no toxicity</h1>
                <p className='hidden md:inline max-w-2xl text-center font-light'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum illum inventore corrupti quisquam earum repudiandae amet atque   animi numquam fugiat.</p>
                <span className='mt-8'>
                    <Button className='rounded-4xl cursor-pointer' onClick={()=>navigate('/login')}>
                        Get Started <ArrowRight />
                    </Button>
                </span>
            </section>
            <footer>
            </footer>
        </div>
    )
}
