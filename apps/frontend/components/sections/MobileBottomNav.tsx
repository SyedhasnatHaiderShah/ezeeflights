"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import {
  Home,
  Search,
  Heart,
  User,
  LucideIcon,
  Plane,
  Building2,
  Car,
  PackageOpen,
  Map as MapIcon,
  CalendarDays,
  Globe,
  DollarSign,
  HelpCircle,
  Phone,
  Moon,
  Sun,
  Menu,
} from "lucide-react";
import { AppIcon } from "../ui/app-icon";

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
}

const leftNavItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/flights/result", icon: Search },
];

const rightNavItems: NavItem[] = [
  { name: "Saved", href: "/saved", icon: Heart },
  { name: "Profile", href: "/profile", icon: User },
];

interface NavigationItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  { title: "Cars", url: "/cars", icon: Car },
  { title: "Contact Us", url: "/contact", icon: Phone },
  { title: "Currency", url: "?config=currency", icon: DollarSign },
  { title: "Destinations", url: "/destinations", icon: MapIcon },
  { title: "Flights", url: "/flights", icon: Plane },
  { title: "Help Center", url: "/help", icon: HelpCircle },
  { title: "Language", url: "?config=language", icon: Globe },
  { title: "My Trips", url: "/trips", icon: CalendarDays },
  { title: "Packages", url: "/packages", icon: PackageOpen },
  { title: "Saved", url: "/saved", icon: Heart },
  { title: "Sign in / Profile", url: "/profile", icon: User },
  { title: "Stays", url: "/stays", icon: Building2 },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href ||
      (pathname?.startsWith(item.href) && item.href !== "/");

    return (
      <Link
        key={item.name}
        href={item.href as any}
        className="flex flex-col items-center justify-center min-w-[64px] h-full space-y-1 relative group"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {isActive && (
          <span className="absolute top-0 w-8 h-1 rounded-b-full bg-primary/20" />
        )}
        <div className="pointer-events-none">
          <AppIcon icon={Icon} isActive={isActive} />
        </div>
        <span
          className={cn(
            "text-[10px] font-bold tracking-tight transition-colors duration-300",
            isActive ? "text-primary" : "text-muted-foreground",
          )}
        >
          {item.name}
        </span>
      </Link>
    );
  };

  return (
    <>
      <nav
        className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-lg border-t border-border/50 md:hidden pb-safe"
      >
        {/*
          Using overflow-x-auto on the nav itself ensures that if the screen is
          dangerously narrow (e.g. 280px), the user can still reach all buttons.
        */}
        <div className="flex items-center justify-between h-16 px-2 sm:px-4 relative overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-around flex-1 h-full">
            {leftNavItems.map(renderNavItem)}
          </div>

          {/* Centre FAB */}
          <div className="relative flex items-center justify-center min-w-[70px] z-10 -mt-6">
            <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
              <Drawer.Trigger asChild>
                <button
                  aria-label="Open menu"
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-border/30 dark:bg-secondary/40 active:scale-95 transition-all duration-200 select-none cursor-pointer"
                  style={{
                    WebkitTapHighlightColor: "transparent",
                  }}
                >
                  <Menu className="w-5 h-5 text-foreground pointer-events-none" />
                </button>
              </Drawer.Trigger>

              <Drawer.Portal>
                <Drawer.Overlay
                  className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] mt-24 flex h-[85vh] flex-col rounded-t-[20px] bg-background border-t shadow-2xl focus:outline-none">
                  <Drawer.Title className="sr-only">Menu</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Access navigation and settings
                  </Drawer.Description>
                  <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-muted/60" />

                  <div className="flex-1 overflow-y-auto p-5 pb-10 mt-2">
                    <div className="grid grid-cols-4 gap-y-8 gap-x-2 mt-4">
                      {NAVIGATION_ITEMS.map((item) => {
                        const isActive = pathname === item.url;
                        return (
                          <Link
                            key={item.title}
                            href={item.url as any}
                            onClick={() => setIsOpen(false)}
                            className="flex flex-col items-center justify-start gap-2 group"
                            style={{
                              WebkitTapHighlightColor: "transparent",
                            }}
                          >
                            <div
                              className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                                isActive
                                  ? "bg-primary border-primary text-primary-foreground shadow-primary/20 scale-110"
                                  : "bg-background border-border group-hover:bg-muted group-hover:scale-105",
                              )}
                            >
                              <AppIcon icon={item.icon} isActive={isActive} />
                            </div>
                            <span
                              className={cn(
                                "text-[10px] font-medium text-center leading-tight px-0.5",
                                isActive
                                  ? "text-primary font-bold"
                                  : "text-muted-foreground group-hover:text-foreground",
                              )}
                            >
                              {item.title}
                            </span>
                          </Link>
                        );
                      })}

                      <button
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="flex flex-col items-center justify-start gap-2 group"
                        style={{
                          WebkitTapHighlightColor: "transparent",
                        }}
                      >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-background transition-all duration-300 group-hover:bg-muted group-hover:scale-105">
                          <AppIcon
                            icon={mounted && theme === "dark" ? Moon : Sun}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight px-0.5 text-muted-foreground group-hover:text-foreground">
                          Theme
                        </span>
                      </button>
                    </div>
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>

          <div className="flex items-center justify-around flex-1 h-full">
            {rightNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>
    </>
  );
}
