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
import { trackEvent } from "@/lib/posthog";

const Settings = () => {
  const themeCtx = useContext(ThemeContext);
  if (!themeCtx) return null;
  const { theme, changeTheme } = themeCtx;
  const userCtx = useUser();
  if (!userCtx) return null;
  const { user } = userCtx;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    trackEvent("settings_viewed");
  }, []);
  const logOut = async () => {
    trackEvent("logout_clicked");
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
      trackEvent("profile_picture_upload_started", { file_type: file.type, file_size: file.size });

      // 1. Upload directly to Cloudinary
      const imageUrl = await uploadToCloudinary(file);

      // 2. Send URL to backend
      const res = await api.post("/user/profilepic", {
        imageUrl,
      });

      console.log("Profile pic updated:", res.data.url);
      trackEvent("profile_picture_upload_success");
    } catch (err) {
      console.error("Profile pic upload failed:", err);
      trackEvent("profile_picture_upload_failed");
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
        trackEvent("notifications_subscribed");
      }
    } catch (error) {
      console.log(error);
      toast("Failed enabling notification on this Device");
    }
  };
  const askNotificationPermission = async () => {
    trackEvent("notifications_permission_requested");
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted.");
      await subscribeUser();
    } else {
      console.warn("Notification permission denied.");
    }
  };
  return (
    <div className="flex h-screen flex-col bg-background">
    
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-6 py-5">
    
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 transition hover:bg-accent xl:hidden"
          >
            <Undo2 size={20} />
          </button>
    
          <h1 className="text-2xl font-bold">
            Settings
          </h1>
    
        </div>
      </div>
    
      {/* Content */}
      <div className="flex-1 overflow-y-auto">
    
        <div className="mx-auto max-w-3xl px-6 py-8">
    
          {/* Profile */}
    
          <div className="flex items-center gap-6 border-b pb-8">
    
            <div className="relative">
    
              <img
                src={user?.profilePic || "836.jpg"}
                alt="Profile"
                className="h-28 w-28 rounded-full object-cover"
              />
    
              <button
                onClick={triggerFileInput}
                className="absolute bottom-1 right-1 rounded-full border bg-card p-2 transition hover:bg-accent"
              >
                <Pencil size={16} />
              </button>
    
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleUpload}
                className="hidden"
              />
    
            </div>
    
            <div>
    
              <h2 className="text-2xl font-semibold">
                {user?.username}
              </h2>
    
              <p className="mt-1 text-muted-foreground">
                {user?.email}
              </p>
    
            </div>
    
          </div>
    
          {/* Preferences */}
    
          <div className="mt-8">
    
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Preferences
            </h3>
    
            <div className="overflow-hidden rounded-xl border">
    
              <button
                onClick={() => {
                  trackEvent("theme_changed");
                  changeTheme();
                }}
                className="flex w-full items-center justify-between border-b px-5 py-4 transition hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  {theme ? <Moon size={20} /> : <Sun size={20} />}
                  <span>Appearance</span>
                </div>
    
                <span className="text-sm text-muted-foreground">
                  {theme ? "Dark" : "Light"}
                </span>
              </button>
    
              <button
                onClick={askNotificationPermission}
                className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-accent"
              >
                <div className="flex items-center gap-4">
                  <Bell size={20} />
                  <span>Notifications</span>
                </div>
    
                <span className="text-sm text-muted-foreground">
                  Configure
                </span>
              </button>
    
            </div>
    
          </div>
    
          {/* Danger Zone */}
    
          <div className="mt-10">
    
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-red-500">
              Danger Zone
            </h3>
    
            <div className="overflow-hidden rounded-xl border border-red-200 dark:border-red-900">
    
              <button
                onClick={logOut}
                className="flex w-full items-center gap-4 px-5 py-4 text-red-500 transition hover:bg-red-500/10"
              >
                <LogOut size={20} />
    
                Log Out
              </button>
    
            </div>
    
          </div>
    
        </div>
    
      </div>
    
    </div>  );
};

export default Settings;
