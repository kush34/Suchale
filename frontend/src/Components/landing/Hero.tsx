import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'

const Hero = () => {
    return (
        <div className='flex flex-col items-center justify-center mt-24'>
            <section>
                <span className="badge">
                    <ul className='flex gap-2 border px-5 py-1 rounded-4xl font-light'>
                        <li>{"->  latest  ->"}</li>
                        {/* <li>positive</li>
                        <li>trending</li> */}
                    </ul>
                </span>
            </section>
            <section className='flex flex-col items-center justify-center'>
                <h1 className='font-semibold text-6xl my-5 text-center'>Real and Live Stories <br />with data safety & no toxicity</h1>
                <p className='max-w-2xl text-center font-light'>Lorem ipsum dolor sit amet consectetur adipisicing elit. Harum illum inventore corrupti quisquam earum repudiandae amet atque   animi numquam fugiat.</p>
                <span className='mt-8'>
                    <Button className='rounded-4xl'>
                        Get Started <ArrowRight/>
                    </Button>
                </span>
            </section>
            <footer>
            </footer>
        </div>
    )
}

export default Hero