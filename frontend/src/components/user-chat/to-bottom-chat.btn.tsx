import { ArrowDown } from 'lucide-react';
import { Button } from "@/components/ui/button"
type Props = {
    toBottomBtnFlag: boolean;
    handleScrollToBottom: () => void;
}

export default function ToBottomBtn({ toBottomBtnFlag, handleScrollToBottom }: Props) {
    return (
        <div className="flex items-center justify-center mb-2 z-20">
            {
                toBottomBtnFlag &&
                <Button onClick={handleScrollToBottom} className="rounded-full p-2 shadow-xl"><ArrowDown /></Button>
            }
        </div>
    )
}
