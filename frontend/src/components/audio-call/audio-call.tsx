import { Phone, X } from 'lucide-react'
import { Button } from '../ui/button'
import { useSocket } from '@/Store/SocketContext'

type Props = {
    username: string,
    profilePic: string,
}
const AudioCallComp = (Prop: Props) => {
    const { audioElementRef,endAudioCall } = useSocket();

    return (
        <div className='p-12 w-full h-screen flex flex-col gap-10 items-center justify-between'>
            <div className="mt-12 callerInfo flex flex-col items-center justify-center gap-10 text-2xl font-bold">
                {Prop.username || "Yashu"}
                <img src={Prop.profilePic} className='size-1/2 rounded-full' alt="" />
            </div>
            <div className="audio">
                <audio ref={audioElementRef} autoPlay ></audio>
            </div>
            <div className="actions">
                <Button onClick={()=>endAudioCall()} variant={"destructive"}>
                    <Phone />
                </Button>
            </div>
        </div>
    )
}

export default AudioCallComp