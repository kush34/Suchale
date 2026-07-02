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

import { UserContextProvider } from "./Store/UserContext";
import { ChatContextProvider } from "./Store/ChatContext";
import { ThemeContextProvider } from "./Store/ThemeContext";
import { registerServiceWorker } from "./utils/register-service-worker";
import { SidebarProvider } from "./components/ui/sidebar";
import Main from "./components/layouts/main";
import { SocketProvider } from "./Store/SocketContext";
import { trackEvent } from "./lib/posthog";
import AnimatedRoutes from "./components/animated-page";
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
        <AnimatedRoutes/>
      </Suspense>
    </BrowserRouter>,
  );
}
