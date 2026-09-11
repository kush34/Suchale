import admin from 'firebase-admin';

// ponytail: credentials come from env in deployed images; secret.json is a
// local-dev fallback only (gitignored AND dockerignored, never baked into layers).
// Set FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY
// (private key in standard escaped-newline form, see .env.sample).
const serviceAccount = process.env.FIREBASE_PROJECT_ID
    ? {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    : require('../../secret.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: process.env.databaseURL
});

export default admin;
