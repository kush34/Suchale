import React from 'react'
import { Button } from '../ui/button'
import { Languages } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const Navbar = () => {
    const navigate = useNavigate();
    return (
        <div className='flex justify-between mx-10 my-10'>
            <span className='font-bold text-xl'>Suchale</span>
            <span >
                <ul className='hidden md:flex gap-5'>
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
                    <Button className='rounded-2xl text-sm' onClick={()=>navigate("/login")}>
                        Register
                    </Button>
                </span>
            </span>
        </div >
    )
}
