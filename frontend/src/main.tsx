import { lazy, ReactNode, StrictMode, Suspense, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";

const App = lazy(() => import("./App"));
const Home = lazy(() => import("./pages/Home"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const AddContacts = lazy(() => import("./pages/AddContacts"));
const Settings = lazy(() => import("./pages/Settings"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const NotificationPage = lazy(() =>
  import("./pages/notification-page").then((m) => ({
    default: m.NotificationPage,
  })),
);

import { UserContextProvider } from "./Store/UserContext";
import { ChatContextProvider } from "./Store/ChatContext";
import { ThemeContextProvider } from "./Store/ThemeContext";
import { registerServiceWorker } from "./utils/register-service-worker";
import { SidebarProvider } from "./components/ui/sidebar";
import Main from "./components/layouts/main";
import { SocketProvider } from "./Store/SocketContext";
import { trackEvent } from "./lib/posthog";
const root = document.getElementById("root");

type Props = {
  children: ReactNode;
};

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageName =
      location.pathname === "/"
        ? "landing"
        : location.pathname.replace(/^\//, "");
    const authState = ["/", "/login", "/register"].includes(location.pathname)
      ? "guest"
      : "authenticated";

    trackEvent("page_view", {
      page_name: pageName,
      path: location.pathname,
      auth_state: authState,
    });
  }, [location.pathname]);

  return null;
}

function ProtectedRoutes() {
  return (
    <UserContextProvider>
      <ThemeContextProvider>
        <SidebarProvider>
          <ChatContextProvider>
            <SocketProvider>
              <Main>
                <Outlet />
              </Main>
            </SocketProvider>
          </ChatContextProvider>
        </SidebarProvider>
      </ThemeContextProvider>
    </UserContextProvider>
  );
}

registerServiceWorker();
if (root) {
  ReactDOM.createRoot(root).render(
    <BrowserRouter>
      <RouteTracker />
      <Toaster richColors closeButton position="top-right" />

      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoutes />}>
            <Route path="/messages" element={<Home />} />
            <Route path="/notification" element={<NotificationPage />} />
            <Route path="/addContacts" element={<AddContacts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/profile/:username" element={<ProfilePage />} />
            <Route path="/post/:postId" element={<PostPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>,
  );
}
