// backend/utils/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    //   cloud_name: process.env.CLOUD_NAME,
    //   api_key: process.env.CLOUD_API_KEY,
    //   api_secret: process.env.CLOUD_API_SECRET,
  cloud_name: "dbmtsiyqt",
  api_key: '586397122476883',
  api_secret: 'cVNxXKpN6pDadY1HIRmoFv3QMJQ'
});

export default cloudinary;
