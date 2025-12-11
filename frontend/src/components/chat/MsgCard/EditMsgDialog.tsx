import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type EditMsgDialog = {
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  newContent:string;
  setNewContent:React.Dispatch<React.SetStateAction<string>>;
  handleSaveEdit:()=>void;
};

const EditMsgDialog = ({isEditing,setIsEditing,newContent,setNewContent,handleSaveEdit}:EditMsgDialog) => {
  return (
    <Dialog open={isEditing} onOpenChange={setIsEditing}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>
        <Input
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <DialogFooter className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMsgDialog;