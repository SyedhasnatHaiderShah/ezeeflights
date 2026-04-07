"use client";

import * as React from "react";
import { Menu, Heart, Sparkles, Sun, Moon, User, Bell } from "lucide-react";
import { Drawer } from "vaul";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
// @ts-ignore
import EzeeFlightsLogo from "@/components/ezee-flights-logo";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { AppIcon } from "@/components/ui/app-icon";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const toggleSidebar = useSidebarStore((state) => state.toggle);

  React.useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "h-16 bg-background shadow-md border-brand-gray"
          : "h-20 bg-background/95 backdrop-blur-sm border-transparent",
      )}
    >
      <div className="flex justify-between items-center h-full px-4 md:px-6 max-w-full mx-auto">
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center md:gap-2 gap-0">
          <button
            className="p-2 transition-colors rounded-md bg-transparent hidden md:flex"
            onClick={toggleSidebar}
            aria-label="Toggle menu"
          >
            <AppIcon icon={Menu} isFill />
          </button>

          <Link href="/" className="flex items-center gap-0.5 group">
            <EzeeFlightsLogo
              isDarkMode={mounted && theme === "dark"}
              className="w-32 h-auto"
            />
          </Link>
        </div>

        {/* Right Side: Utils & Auth */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications Dropdown / Drawer (Top to Bottom) - Visible on all screens */}
          <Drawer.Root direction="top">
            <Drawer.Trigger asChild>
              <div>
                <AppIcon icon={Bell} isFill />
              </div>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
              <Drawer.Content className="fixed top-0 left-0 right-0 z-[70] flex flex-col rounded-b-[24px] bg-background border-b shadow-2xl focus:outline-none h-[calc(100vh-64px)] md:h-auto md:max-h-[80vh]">
                <Drawer.Title className="sr-only">Notifications</Drawer.Title>
                <Drawer.Description className="sr-only">
                  View your recent alerts and notifications
                </Drawer.Description>
                
                <div className="flex items-center justify-between p-6 pb-4 border-b">
                  <h2 className="text-xl font-bold tracking-tight">Notifications</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-60 space-y-4 pb-10 min-h-[30vh]">
                    <Bell className="w-16 h-16 fill-current" />
                    <p className="text-sm font-medium">No new notifications</p>
                  </div>
                </div>

                <div className="mx-auto mb-4 mt-2 h-1.5 w-12 rounded-full bg-muted/60" />
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>

          {/* Desktop-only Utilities */}
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            {/* Ask AI Pill */}
            <AppIcon
              icon={Sparkles}
              label="Ask AI"
              className="hidden sm:flex"
              onClick={() => console.log("AI search open")}
            />

            {/* Favorites Heart */}
            <AppIcon
              icon={Heart}
              onClick={() => console.log("Favorites open")}
              isFill
            />

            {/* Theme Toggle (Optional/Hidden if needed, but keeping for utility) */}
            <AppIcon
              icon={mounted && theme === "dark" ? Sun : Moon}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              isFill
            />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div>
                  <AppIcon icon={User} isFill />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="font-semibold">
                  Sign in
                </DropdownMenuItem>
                <DropdownMenuItem>Trips</DropdownMenuItem>
                <div className="h-px bg-brand-gray my-1" />
                <DropdownMenuItem>Preferences</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
