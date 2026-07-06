import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import ProtectedRoutes from "./protected-routes";

const App = lazy(() => import("@/App"));
const Register = lazy(() => import("@/pages/Register"));
const Login = lazy(() => import("@/pages/Login"));
const Home = lazy(() => import("@/pages/Home"));
const NotificationPage = lazy(() =>
  import("@/pages/notification-page").then((module) => ({
    default: module.NotificationPage,
  }))
);
const Settings = lazy(() => import("@/pages/Settings"));
const FeedPage = lazy(() => import("@/pages/FeedPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const PostPage = lazy(() => import("@/pages/PostPage"));
const Explore = lazy(() => import("@/pages/explore-page"));

export default function AnimatedRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/register" element={<Register />} />

        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/messages" element={<Home />} />

          <Route path="/notification" element={<NotificationPage />} />

          <Route path="/explore" element={<Explore />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/feed" element={<FeedPage />} />

          <Route path="/profile/:username" element={<ProfilePage />} />

          <Route path="/post/:postId" element={<PostPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}