import React, { useContext, useEffect, useRef } from 'react'
import { useUser } from '../Store/UserContext';
import { useNavigate } from "react-router-dom"
import api from '../utils/axiosConfig';
import { ThemeContext } from '../Store/ThemeContext';
import { registerServiceWorker } from '@/utils/register-service-worker';
import { toast } from 'sonner';
import { Bell, LogOut, Moon, Pencil, Sun, Undo2 } from 'lucide-react';
const Settings = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const { user } = useUser();
    const navigate = useNavigate();
    const fileInputRef = useRef();
    const logOut = () => {
        localStorage.setItem("token", "");
        navigate("/login")
    }
    const handleUpload = async (e) => {
        const formData = new FormData();
        formData.append("file", e.target.files[0]);

        try {
            const res = await api.post("/user/profilepic", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            console.log("Uploaded URL:", res.data.url);
        } catch (err) {
            console.error(err);
        }
    };
    const triggerFileInput = () => {
        fileInputRef.current.click();
    };


    const subscribeUser = async () => {
        try {
            const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
            const registration = await registerServiceWorker();
            if (!publicKey) {
                new Error("No Public key found");
                console.error("No Public key found");
            }
            const urlBase64ToUint8Array = (base64String) => {
                const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
                const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
                const rawData = window.atob(base64);
                return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
            };
    
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });
    
    
            console.log("Push Subscription:", subscription);
    
            const response = await api.post("/user/subscribe", {
                subscription
            });
            if(response.status == 201){
                toast("Notification Enabled on this Device");
            }
        } catch (error) {
            console.log(error);
            toast("Failed enabling notification on this Device");
        }
    }
    const askNotificationPermission = async () => {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
            console.log("Notification permission granted.");
            await subscribeUser()
        } else {
            console.warn("Notification permission denied.");
        }
    };

    return (
        <div className={`${theme ? "bg-zinc-100 text-black" : "bg-black text-white"} h-screen`}>
            <div className={`head flex items-center justify-between`}>
                <div className="title text-lg md:text-4xl m-4 font-bold">
                    Settings
                </div>
                <div><button onClick={() => navigate("/home")} className='m-5 bg-black text-white rounded-full px-2 py-2 cursor-pointer'><Undo2 /></button></div>
            </div>
            <div className='m-5'>
                <div className="profilepic flex justify-center items-center">
                    <img
                        className="w-40 h-40 object-cover rounded-full"
                        src={user?.profilePic || "836.jpg"}
                        onError={(e) => { e.target.src = "836.jpg"; }}
                        alt="User profile"
                    />
                    <div className="edit m-5 cursor-pointer">
                        <input type="file" className='hidden' onChange={handleUpload} ref={fileInputRef} />
                        <button onClick={triggerFileInput} className='cursor-pointer hover:bg-transparent hover:text-sky-500 ease-in duration-150 border-2 border-black bg-black px-2 py-2 rounded-full hover:border-sky-500 font-bold text-white'><Pencil /></button>
                    </div>
                </div>
                <div className="username flex flex-col mt-10 md:text-xl items-center justify-center ">
                    <span className='font-bold'>
                        {user?.username}
                    </span>
                    <span className='font-bold'>
                        {user?.email}
                    </span>
                </div>
                <div className="flex justify-center m-5 " onClick={toggleTheme}>
                    <button className={`flex gap-5 cursor-pointer border-b ${theme ? "border-zinc-200":"border-zinc-800"} py-2 w-full md:w-1/4 justify-center`}>
                        {theme ? <Moon />:<Sun /> } Theme
                    </button>
                </div>
                <div className="flex justify-center m-5 " onClick={askNotificationPermission}>
                    <button className={`flex gap-5 cursor-pointer border-b ${theme ? "border-zinc-200":"border-zinc-800"} py-2 w-full md:w-1/4 justify-center`}>
                        <Bell /> Notification
                    </button>
                </div>
                <div className="flex justify-center m-5 " onClick={logOut}>
                    <button className={`flex gap-5 cursor-pointer border-b ${theme ? "border-zinc-200":"border-zinc-800"} py-2 w-full md:w-1/4 justify-center`}>
                       <LogOut /> Log Out
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Settings