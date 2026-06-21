import { ReactNode, StrictMode, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Outlet, useLocation } from "react-router-dom";
import { Toaster } from "sonner";

import App from "./App";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AddContacts from "./pages/AddContacts";
import Settings from "./pages/Settings";

import { UserContextProvider } from "./Store/UserContext";
import { ChatContextProvider } from "./Store/ChatContext";
import { ThemeContextProvider } from "./Store/ThemeContext";
import { registerServiceWorker } from "./utils/register-service-worker";
import FeedPage from "./pages/FeedPage";
import { SidebarProvider } from "./components/ui/sidebar";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
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
    const pageName = location.pathname === "/" ? "landing" : location.pathname.replace(/^\//, "");
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
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        {/* All protected routes */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/messages" element={<Home />} />
          <Route path="/addContacts" element={<AddContacts />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/post/:postId" element={<PostPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
