import ThemeContextProvider from "@/Store/ThemeContext";
import { UserContextProvider } from "@/Store/UserContext";
import { SidebarProvider } from "./ui/sidebar";
import { ChatContextProvider } from "@/Store/ChatContext";
import { SocketProvider } from "@/Store/SocketContext";
import Main from "./layouts/main";
import { Outlet } from "react-router-dom";

export default function ProtectedRoutes() {
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