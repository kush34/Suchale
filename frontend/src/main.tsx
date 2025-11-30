import { ReactNode, StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import App from './App';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AddContacts from './pages/AddContacts';
import Settings from './pages/Settings';

import { UserContextProvider } from './Store/UserContext';
// import { SocketProvider } from './Store/SocketContext';
import { ChatContextProvider } from './Store/ChatContext';
import { ThemeContextProvider } from './Store/ThemeContext';
import { SocketProvider } from './Store/SocketContext';
import { registerServiceWorker } from './utils/register-service-worker';
import FeedPage from './pages/FeedPage';
import { SidebarProvider } from './components/ui/sidebar';
import ProfilePage from './pages/ProfilePage';
const root = document.getElementById('root');

type Props = {
  children: ReactNode;
};

function ProtectedRoutes({ children }: Props) {
  return (
    <UserContextProvider>
      <ThemeContextProvider>
        {/* <SidebarProvider> */}
          <ChatContextProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ChatContextProvider>
        {/* </SidebarProvider> */}
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
        <Route
          path="/messages"
          element={
            <ProtectedRoutes>
              <Home />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/addContacts"
          element={
            <ProtectedRoutes>
              <AddContacts />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoutes>
              <Settings />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/feed"
          element={
            <ProtectedRoutes>
              <FeedPage />
            </ProtectedRoutes>
          }
        />
        <Route
          path="/profile/:username"
          element={
              <ProfilePage />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
