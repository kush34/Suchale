import { Outlet } from "react-router-dom";
import { AppSidebar } from "../Feed/Navbar";
import { ReactNode } from "react";
import { SidebarInset, SidebarTrigger } from "../ui/sidebar";
import MobileNav from "../navigation/MobileNav";

export default function Main({ children }: { children: ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        {children}</SidebarInset>
      <MobileNav />
    </>
  );
}
