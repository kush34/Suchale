import { Outlet } from "react-router-dom";
import { AppSidebar } from "../Feed/Navbar";
import { ReactNode } from "react";
import { SidebarInset, SidebarTrigger } from "../ui/sidebar";

export default function Main({ children }: { children: ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {children}</SidebarInset>
    </>
  );
}
