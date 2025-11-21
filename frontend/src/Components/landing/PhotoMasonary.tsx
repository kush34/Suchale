import React from 'react'

const PhotoMasonary = () => {

    const photos = ["./Landing/1.jpg", "./Landing/2.jpg", "./Landing/3.jpg", "./Landing/4.jpg", "./Landing/5.jpg", "./Landing/6.jpg"]
    return (
        <div className='overflow-hidden mt-24'>
            <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .marquee-container {
          display: flex;
          animation: marquee 60s linear infinite;
          width: max-content;
        }
        .marquee-container:hover {
          animation-play-state: paused;
        }
      `}</style>
            <div className='marquee-container gap-5'>
                {[...photos, ...photos, ...photos].map((img, index) => <img className='w-96 rounded-xl object-cover h-96 flex-shrink-0' key={index} src={img} alt={`Photo ${index + 1}`} />)}
            </div>
        </div>
    )
}

export default PhotoMasonary