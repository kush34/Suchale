import axios from "axios";
import { initializeApp } from "firebase/app";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";

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

    if (user) {
        try {
            const token = await user.getIdToken();
            console.log("Token:", token);
            const response = await axios.post(`${import.meta.env.VITE_URL}/user/firebaseTokenVerify`)
            if (response.status === 200) {
                return { status: true, message: "Login Successfull" }
            } else {
                return { status: false, message: `${response.data.message}` }
            }
        } catch (error) {
            console.error("Error getting token:", error);
            return { status: false, messsage: error }
        }
    }
};


export const googleSignInPopUp = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential) return null;

        const token = credential.accessToken;
        const user = result.user;

        await getFirebaseToken();
        console.log(`User signed in`);
        return true;
    } catch (error: any) {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.customData?.email;
        const credential = GoogleAuthProvider.credentialFromError(error);
        console.error(`Sign-in error: ${errorCode} - ${errorMessage}`);
        return false;
    }
}




