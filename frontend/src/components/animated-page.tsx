import { AnimatePresence } from "motion/react";
import {
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import App from "@/App";
import PageTransition from "./page-transition";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import { NotificationPage } from "@/pages/notification-page";
import AddContacts from "@/pages/AddContacts";
import Settings from "@/pages/Settings";
import FeedPage from "@/pages/FeedPage";
import ProfilePage from "@/pages/ProfilePage";
import PostPage from "@/pages/PostPage";
import ProtectedRoutes from "./protected-routes";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <App />
            </PageTransition>
          }
        />

        <Route
          path="/register"
          element={
            <PageTransition>
              <Register />
            </PageTransition>
          }
        />

        <Route
          path="/login"
          element={
            <PageTransition>
              <Login />
            </PageTransition>
          }
        />

        <Route element={<ProtectedRoutes />}>
          <Route
            path="/messages"
            element={
              <PageTransition>
                <Home />
              </PageTransition>
            }
          />

          <Route
            path="/notification"
            element={
              <PageTransition>
                <NotificationPage />
              </PageTransition>
            }
          />

          <Route
            path="/addContacts"
            element={
              <PageTransition>
                <AddContacts />
              </PageTransition>
            }
          />

          <Route
            path="/settings"
            element={
              <PageTransition>
                <Settings />
              </PageTransition>
            }
          />

          <Route
            path="/feed"
            element={
              <PageTransition>
                <FeedPage />
              </PageTransition>
            }
          />

          <Route
            path="/profile/:username"
            element={
              <PageTransition>
                <ProfilePage />
              </PageTransition>
            }
          />

          <Route
            path="/post/:postId"
            element={
              <PageTransition>
                <PostPage />
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}