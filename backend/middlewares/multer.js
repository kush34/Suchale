import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-app', 
    allowed_formats: ['jpg', 'png', 'mp4','pdf','docx','txt','rtf','odt'], 
    resource_type: 'auto',
  },
});

const upload = multer({ storage });

export default upload;
