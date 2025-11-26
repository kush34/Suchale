import admin from 'firebase-admin';
import serviceAccount from '../../secret.json';

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: process.env.databaseURL
});

export default admin;