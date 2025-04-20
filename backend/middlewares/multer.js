// backend/middleware/multer.js
import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../utils/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat-app', // change folder name if needed
    allowed_formats: ['jpg', 'png', 'mp4'], // or others
  },
});

const upload = multer({ storage });

export default upload;
