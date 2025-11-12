import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-app', 
    allowed_formats: ['jpg', 'png', 'mp4','pdf','docx','txt','rtf','odt'], 
    resource_type: 'auto',
  } as any,
});

const upload = multer({ storage });

export default upload;
