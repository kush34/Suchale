import React from 'react'
import { Skeleton } from '../ui/skeleton'

const PostPageSkeleton = () => {
    return (
        <div className='w-full h-screen flex justify-center mt-12 py-4'>
            <div className="flex flex-col items-center space-x-4 ">
                <div className='flex items-center space-x-4'>
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <div className='flex justify-evenly w-[500px] my-5'>
                    <Skeleton className="h-4 w-9" />
                    <Skeleton className="h-4 w-9" />
                    <Skeleton className="h-4 w-9" />
                </div>
            </div>
        </div>
    )
}

export default PostPageSkeleton