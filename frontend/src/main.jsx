import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.jsx'
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from "./pages/Login.jsx"
import AddContacts from './pages/AddContacts.jsx';
import Settings from './pages/Settings.jsx';
const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/home" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/addContacts" element={<AddContacts />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  </BrowserRouter>
);
