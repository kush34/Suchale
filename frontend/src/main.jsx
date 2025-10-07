import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';

import App from './App.jsx';
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import AddContacts from './pages/AddContacts.jsx';
import Settings from './pages/Settings.jsx';

import { UserContextProvider } from './Store/UserContext';
// import { SocketProvider } from './Store/SocketContext';
import { ChatContextProvider } from './Store/ChatContext';
import {ThemeContextProvider} from './Store/ThemeContext.jsx';
import { SocketProvider } from './Store/SocketContext';
import { registerServiceWorker } from './utils/register-service-worker';
const root = document.getElementById('root');

function ProtectedRoutes({ children }) {
  return (
    <UserContextProvider>
      <ThemeContextProvider>
      <SocketProvider>
        <ChatContextProvider>
          {children}
        </ChatContextProvider>
      </SocketProvider>
      </ThemeContextProvider>
    </UserContextProvider>
  );
}

registerServiceWorker();

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Toaster richColors closeButton position="top-right" />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      
      {/* All protected routes */}
      <Route
        path="/home"
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
    </Routes>
  </BrowserRouter>
);
