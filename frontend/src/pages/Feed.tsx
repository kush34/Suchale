import React from 'react'
import { AppSidebar } from '@/components/Feed/Navbar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import Feed from '@/components/Feed/Feed'
import CreatePost from '@/components/Feed/Post/CreatePost'

const FeedPage = () => {
    return (
        <SidebarProvider>
            <div className='w-full h-screen'>
                <AppSidebar />
                <aside>
                    <SidebarTrigger />
                </aside>
                <div className='flex flex-col justify-center items-center gap-2'>
                    <CreatePost/>
                    <Feed/>
                </div>
            </div>
        </SidebarProvider>
    )
}

export default FeedPage