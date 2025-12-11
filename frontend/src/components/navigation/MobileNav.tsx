import { Home, Inbox, Search, Settings } from 'lucide-react';
import React from 'react'
import { Link } from 'react-router-dom';

const MobileNav = () => {
    const items = [
        {
            title: "Home",
            url: "/feed",
            icon: Home,
        },
        {
            title: "Messages",
            url: "/messages",
            icon: Inbox,
        },
        {
            title: "Search",
            url: "/addContacts",
            icon: Search,
        },
        {
            title: "Settings",
            url: "/settings",
            icon: Settings,
        },
    ];
    return (
        <div className='absolute z-100 p-5 bottom-0 bg-accent w-full gap-15 h-14 flex justify-center items-center xl:hidden'>
            {items.map((item) => (
                <Link
                    to={item.url}
                >
                    <item.icon />
                </Link>
            ))}
        </div>
    )
}

export default MobileNav