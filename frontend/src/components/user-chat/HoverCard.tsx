
type Props = {
    hoverTopbar: boolean,
    infoWindow: any[],
    mousePos: {
        x: number
        y: number
    }
}
const HoverCard = ({ hoverTopbar, infoWindow, mousePos }: Props) => {
    return (
        <>
            {hoverTopbar && infoWindow && infoWindow.length > 0 && (
                <div
                    style={{
                        position: "fixed",
                        top: mousePos.y + 15,
                        left: mousePos.x + 15,
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                        zIndex: 1000,
                        width: "200px",
                    }}
                    className="bg-popover text-popover-foreground shadow p-2 rounded"
                >
                    <div className="font-bold mb-2">Members</div>
                    {infoWindow.map((member) => (
                        <div key={member._id} className="flex items-center mb-1">
                            <img
                                className="w-8 h-8 rounded-full mr-2"
                                src={member.profilePic}
                                alt={member.username}
                            />
                            <span>{member.username}</span>
                        </div>
                    ))}
                </div>
            )
            }
        </>
    )
}

export default HoverCard