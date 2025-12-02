import { ReactNode, StrictMode } from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "sonner";

import App from "./App";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import AddContacts from "./pages/AddContacts";
import Settings from "./pages/Settings";

import { UserContextProvider } from "./Store/UserContext";
// import { SocketProvider } from './Store/SocketContext';
import { ChatContextProvider } from "./Store/ChatContext";
import { ThemeContextProvider } from "./Store/ThemeContext";
import { SocketProvider } from "./Store/SocketContext";
import { registerServiceWorker } from "./utils/register-service-worker";
import FeedPage from "./pages/FeedPage";
import { SidebarProvider } from "./components/ui/sidebar";
import ProfilePage from "./pages/ProfilePage";
import PostPage from "./pages/PostPage";
import Main from "./components/layouts/main";
const root = document.getElementById("root");

type Props = {
  children: ReactNode;
};

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
