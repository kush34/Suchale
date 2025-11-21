import React from 'react'
import { Button } from '../ui/button'
import { Languages } from 'lucide-react'

const Navbar = () => {
    return (
        <div className='flex justify-between mx-10 my-10'>
            <span className='font-bold text-xl'>Suchale</span>
            <span >
                <ul className='flex gap-5'>
                    <li>Home</li>
                    <li>Planning</li>
                    <li>FAQs</li>
                </ul>
            </span>
            <span className='flex gap-5 items-center text-sm'>
                <span className='flex gap-1'>
                    <Languages strokeWidth={1}/> Language
                </span>
                <span>
                    <Button className='rounded-2xl text-sm'>
                        Register
                    </Button>
                </span>
            </span>
        </div >
    )
}

export default Navbar