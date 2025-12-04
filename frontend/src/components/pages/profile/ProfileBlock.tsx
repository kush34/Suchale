import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/utils/axiosConfig";
import { EllipsisVertical } from "lucide-react";
import { toast } from "sonner";

export function ProfileBlock({ username }: { username: string }) {
  const blockUserByUsername = async () => {
    try {
      const response =  await api.post(`/user/blockUser/${username}`);
      if(response.status === 200){
        toast(`${username} blocked`)
      }
    } catch (error:any) {
      toast(`${error.response.message}`)
    }
  };
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <span className="cursor-pointer">
            <EllipsisVertical />
          </span>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Block User</DialogTitle>
            <DialogDescription>
              By Blocking this user you will not see any posts and msgs from
              this user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4"></div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={blockUserByUsername} variant={"destructive"}>
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
