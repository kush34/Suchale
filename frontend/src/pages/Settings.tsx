import {
  FormEvent,
  ReactEventHandler,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useUser } from "../Store/UserContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosConfig";
import { ThemeContext } from "../Store/ThemeContext";
import { registerServiceWorker } from "@/utils/register-service-worker";
import { toast } from "sonner";
import { Bell, LogOut, Moon, Pencil, Sun, Undo2 } from "lucide-react";

const Settings = () => {
  const themeCtx = useContext(ThemeContext);
  if (!themeCtx) return null;
  const { theme, changeTheme } = themeCtx;
  const userCtx = useUser();
  if (!userCtx) return null;
  const { user } = userCtx;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logOut = async () => {
    const res = await api("/user/logout");
    if (res.status === 200) {
      toast("logged out!")
    }
    navigate("/login");
  };
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];

      // 1. Upload directly to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // 2. Send URL to backend
      const res = await api.post("/user/profilepic", {
        imageUrl,
      });

      console.log("Profile pic updated:", res.data.url);
    } catch (err) {
      console.error("Profile pic upload failed:", err);
    } finally {
      // optional but good UX
      e.target.value = "";
    }
  };
  const uploadToCloudinary = async (file: File) => {
    try {
      // 1. Get pre-signed signature from backend
      const { data } = await api.get("/post/preSignedUrl");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", data.apiKey);
      formData.append("timestamp", data.timestamp);
      formData.append("signature", data.signature);
      formData.append("folder", data.folder);

      // 2. Upload to Cloudinary
      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await uploadRes.json();

      if (!result.secure_url) throw new Error("Upload failed");

      return result.secure_url;
    } catch (err) {
      throw err;
    }
  };
  const subscribeUser = async () => {
    try {
      const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      const registration = await registerServiceWorker();
      if (!registration) return null;

      if (!publicKey) {
        new Error("No Public key found");
        console.error("No Public key found");
      }
      const urlBase64ToUint8Array = (base64String: string) => {
        const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding)
          .replace(/\-/g, "+")
          .replace(/_/g, "/");
        const rawData = window.atob(base64);
        return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
      };

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      console.log("Push Subscription:", subscription);

      const response = await api.post("/user/subscribe", {
        subscription,
      });
      if (response.status == 201) {
        toast("Notification Enabled on this Device");
      }
    } catch (error) {
      console.log(error);
      toast("Failed enabling notification on this Device");
    }
  };
  const askNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      await subscribeUser();
    } else {
      console.warn("Notification permission denied.");
    }
  };
  return (
    <div className="h-screen bg-background flex flex-col items-center justify-center">
      <div className="w-full head flex items-center justify-between xl:hidden">
        <div className="title text-lg md:text-4xl m-4 font-bold">Settings</div>
        <button
          onClick={() => navigate(-1)}
          className="m-5 rounded-full px-2 py-2"
        >
          <Undo2 />
        </button>
      </div>

      <div className="m-5 w-full">
        <div className="profilepic flex justify-center items-center">
          <img
            className="w-40 h-40 object-cover rounded-full"
            src={user?.profilePic || "836.jpg"}
            alt="User profile"
          />
          <div className="edit m-5 cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleUpload}
              ref={fileInputRef}
            />
            <button
              onClick={triggerFileInput}
              className="cursor-pointer border-2 border-black dark:border-white px-2 py-2 rounded-full font-bold hover:text-sky-500 hover:border-sky-500"
            >
              <Pencil />
            </button>
          </div>
        </div>

        <div className="username flex flex-col mt-10 md:text-xl items-center justify-center">
          <span className="font-bold">{user?.username}</span>
          <span className="font-bold">{user?.email}</span>
        </div>

        <div className="flex justify-center m-5" onClick={changeTheme}>
          <button className="flex gap-5 cursor-pointer border-b border-zinc-200 dark:border-zinc-800 py-2 w-full md:w-1/4 justify-center">
            {theme ? <Moon /> : <Sun />} Theme
          </button>
        </div>

        <div
          className="flex justify-center m-5"
          onClick={askNotificationPermission}
        >
          <button className="flex gap-5 cursor-pointer border-b border-zinc-200 dark:border-zinc-800 py-2 w-full md:w-1/4 justify-center">
            <Bell /> Notification
          </button>
        </div>

        <div className="flex justify-center m-5" onClick={logOut}>
          <button className="flex gap-5 cursor-pointer border-b border-zinc-200 dark:border-zinc-800 py-2 w-full md:w-1/4 justify-center">
            <LogOut /> Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
