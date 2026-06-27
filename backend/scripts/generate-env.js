import crypto from "crypto";
import fs from "fs";

import webpush from "web-push";
const vapid = webpush.generateVAPIDKeys();

const env = `
PORT=5000
NODE_ENV=development

MONGO_URI=mongodb://mongodb:27017/social
MONGO_URI_TEST=mongodb://mongodb:27017/social-test

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${crypto.randomBytes(16).toString("hex")}

jwt_Secret=${crypto.randomBytes(64).toString("hex")}

EMAIL_USER=
EMAIL_PASSWORD=

DOMAIN_1=http://localhost:5173
DOMAIN_2=http://localhost:3000

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

VAPID_PUBLIC_KEY=${vapid.publicKey}
VAPID_PRIVATE_KEY=${vapid.privateKey}
`;

fs.writeFileSync(".env", env);

console.log("Generated .env");