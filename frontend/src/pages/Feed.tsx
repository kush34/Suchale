import React from 'react'
import { AppSidebar } from '@/components/Feed/Navbar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import Feed from '@/components/Feed/Feed'

const FeedPage = () => {
    return (
        <SidebarProvider>
            <div className='w-full h-screen'>
                <AppSidebar />
                <aside>
                    <SidebarTrigger />
                </aside>
                <div className='flex justify-center items-center'>
                    <Feed/>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default FeedPage