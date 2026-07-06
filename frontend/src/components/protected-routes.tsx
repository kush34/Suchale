import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";

import ThemeContextProvider from "@/Store/ThemeContext";
import { UserContextProvider } from "@/Store/UserContext";
import { SidebarProvider } from "./ui/sidebar";
import { ChatContextProvider } from "@/Store/ChatContext";
import { SocketProvider } from "@/Store/SocketContext";
import { StoryProvider } from "@/Store/storyContext";

import Main from "./layouts/main";
import PageTransition from "./page-transition";

export default function ProtectedRoutes() {
  const location = useLocation();

  return (
    <UserContextProvider>
      <ThemeContextProvider>
        <SidebarProvider>
          <ChatContextProvider>
            <StoryProvider>
              <SocketProvider>
                <Main>
                  <AnimatePresence mode="wait">
                    <PageTransition key={location.pathname}>
                      <Outlet />
                    </PageTransition>
                  </AnimatePresence>
                </Main>
              </SocketProvider>
            </StoryProvider>
          </ChatContextProvider>
        </SidebarProvider>
      </ThemeContextProvider>
    </UserContextProvider>
  );
}