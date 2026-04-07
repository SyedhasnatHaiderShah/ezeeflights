"use client";

import * as React from "react";
import { Menu, Heart, Sparkles, Sun, Moon, User, Bell } from "lucide-react";
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
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer hover:opacity-80 transition-opacity">
                <AppIcon icon={Bell} isFill />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={15}
              className="w-[380px] p-0 overflow-hidden rounded-2xl bg-background border shadow-2xl z-[40]"
            >
              <div className="flex items-center justify-between p-5 border-b bg-muted/20">
                <h2 className="text-lg font-bold tracking-tight">
                  Notifications
                </h2>
                <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
              </div>

              <div className="flex flex-col max-h-[60vh] overflow-y-auto">
                <div className="flex flex-col items-center justify-center py-12 px-6 text-muted-foreground space-y-4">
                  <div className="p-4 rounded-full bg-redmix/10 dark:bg-muted/10">
                    <Bell className="w-10 h-10 text-redmix" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-foreground/80">
                      All caught up!
                    </p>
                    <p className="text-xs">
                      Check back later for new alerts and flight updates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 border-t bg-muted/5">
                <button className="w-full py-2 text-xs font-medium text-redmix hover:bg-redmix/5 rounded-lg transition-colors">
                  View all in Dashboard
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
