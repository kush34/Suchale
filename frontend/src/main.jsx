import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import ReactDOM from "react-dom/client";
import './index.css'
import { BrowserRouter, Routes, Route } from "react-router";
import App from './App.jsx'
import Home from './pages/Home.jsx';

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/home" element={<Home />} />
    </Routes>
  </BrowserRouter>
);
