import React from 'react'

interface MediaProps {
    src: string[];
}


const Media = ({ src }: MediaProps) => {
    return (
        <div className='grid grid-cols-2'>
            {src.map(
                (item, index) =>
                    <img src={item} key={index} alt="post_meida" className='' />
            )
            }
        </div>
    )
}

export default Media