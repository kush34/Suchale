import { lazy, ReactNode, StrictMode, Suspense, useEffect } from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import {
  BrowserRouter,
  useLocation,
} from "react-router-dom";
import { Toaster } from "sonner";
import { registerServiceWorker } from "./utils/register-service-worker";
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

registerServiceWorker();
if (root) {
  ReactDOM.createRoot(root).render(
    <BrowserRouter>
      <RouteTracker />
      <Toaster richColors closeButton position="top-right" />

      <Suspense fallback={<div>Loading...</div>}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>,
  );
}
