import { ReactNode } from "react";
import { useLocation } from "wouter";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface LayoutProps {
  children: ReactNode;
}

// Routes where the navbar and footer should be hidden for a focused experience
const FULL_SCREEN_ROUTES = ["/get-started", "/budget-wizard", "/portal", "/schedule", "/client-billing", "/rep-dashboard"];
// Prefixes for full-screen routes (admin panel)
const FULL_SCREEN_PREFIXES = ["/flowsites-admin", "/admin/", "/invoice/", "/accept-invite"];

export default function Layout({ children }: LayoutProps) {
  useScrollToTop();
  const [location] = useLocation();

  const isFullScreen =
    FULL_SCREEN_ROUTES.includes(location) ||
    FULL_SCREEN_PREFIXES.some((prefix) => location.startsWith(prefix));

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {!isFullScreen && <Navbar />}
      <main className="flex-1">{children}</main>
      {!isFullScreen && <Footer />}
    </div>
  );
}
