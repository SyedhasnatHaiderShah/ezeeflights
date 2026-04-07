"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Drawer } from "vaul";
import { cn } from "@/lib/utils";
import { AppImage } from "@/components/ui/app-image";
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
  icon: React.ComponentType<{ className?: string }>;
}

interface NavigationGroup {
  label: string;
  items: NavigationItem[];
}

const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    label: "Explore",
    items: [
      { title: "Flights", url: "/flights", icon: Plane },
      { title: "Stays", url: "/stays", icon: Building2 },
      { title: "Cars", url: "/cars", icon: Car },
      { title: "Packages", url: "/packages", icon: PackageOpen },
      { title: "Destinations", url: "/destinations", icon: MapIcon },
    ],
  },
  {
    label: "Account",
    items: [
      { title: "Sign in / Profile", url: "/profile", icon: User },
      { title: "My Trips", url: "/trips", icon: CalendarDays },
      { title: "Saved", url: "/saved", icon: Heart },
    ],
  },
  {
    label: "Preferences",
    items: [
      { title: "Currency", url: "?config=currency", icon: DollarSign },
      { title: "Language", url: "?config=language", icon: Globe },
    ],
  },
  {
    label: "Support",
    items: [
      { title: "Help Center", url: "/help", icon: HelpCircle },
      { title: "Contact Us", url: "/contact", icon: Phone },
    ],
  },
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
        className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
      >
        {isActive && (
          <span className="absolute top-0 w-8 h-1 rounded-b-full bg-primary/20" />
        )}

        <div>
          <AppIcon icon={Icon} isFill isActive={isActive} />
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
      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-lg border-t border-border/50 md:hidden pb-safe">
        <div className="flex items-center justify-between h-16 px-2 sm:px-4 relative">
          <div className="flex-1 flex justify-around h-full">
            {leftNavItems.map(renderNavItem)}
          </div>

          <div className="relative flex items-center justify-center w-[20%] z-10 -mt-6">
            <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
              <Drawer.Trigger asChild>
                <AppIcon icon={Menu} isFill />
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[70] mt-24 flex h-[85vh] flex-col rounded-t-[20px] bg-background border-t shadow-2xl focus:outline-none">
                  <Drawer.Title className="sr-only">Menu</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Access navigation and settings
                  </Drawer.Description>
                  <div className="mx-auto mt-4 h-1.5 w-12 rounded-full bg-muted/60" />

                  <div className="flex-1 overflow-y-auto p-5 pb-10 mt-2">
                    <div className="grid grid-cols-4 gap-y-8 gap-x-2 mt-4">
                      {NAVIGATION_GROUPS.flatMap((group) => group.items).map(
                        (item) => {
                          const isActive = pathname === item.url;
                          return (
                            <Link
                              key={item.title}
                              href={item.url as any}
                              onClick={() => setIsOpen(false)}
                              className="flex flex-col items-center justify-start gap-2 group hide-tap-highlight"
                            >
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm border",
                                  isActive
                                    ? "bg-primary border-primary text-primary-foreground shadow-primary/20 scale-110"
                                    : "bg-background border-border group-hover:bg-muted group-hover:scale-105",
                                )}
                              >
                                <item.icon
                                  className={cn(
                                    "h-[22px] w-[22px] stroke-[1.5px] fill-current",
                                    isActive
                                      ? "stroke-[2px]"
                                      : "text-foreground",
                                  )}
                                />
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
                        },
                      )}

                      {/* Theme Toggle within the grid */}
                      <button
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="flex flex-col items-center justify-start gap-2 group hide-tap-highlight"
                      >
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-background border border-border transition-all duration-300 shadow-sm group-hover:bg-muted group-hover:scale-105">
                          {mounted && theme === "dark" ? (
                            <Moon className="h-[22px] w-[22px] stroke-[1.5px] text-foreground fill-current" />
                          ) : (
                            <Sun className="h-[22px] w-[22px] stroke-[1.5px] text-foreground fill-current" />
                          )}
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

          <div className="flex-1 flex justify-around h-full">
            {rightNavItems.map(renderNavItem)}
          </div>
        </div>
      </nav>
    </>
  );
}
