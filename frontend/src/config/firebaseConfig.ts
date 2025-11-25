import axios from "axios";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGE_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const getFirebaseToken = async () => {
    const user = auth.currentUser;
    if (!user) return null;

    try {
        const token = await user.getIdToken(true); // always fresh

        const response = await axios.post(
            `${import.meta.env.VITE_URL}/user/firebaseTokenVerify`,
            { token }
        );

        if (response.status === 200)
            return { ok: true, token: response.data.result.token };

        return { ok: false, message: response.data.message };
    } catch (err) {
        console.error("Token verify error:", err);
        return { ok: false };
    }
};


export const googleSignInPopUp = async () => {
    try {
        await signInWithPopup(auth, provider);
        return await getFirebaseToken();
    } catch (error) {
        console.error("Google Sign-in Error:", error);
        return { ok: false };
    }
};



