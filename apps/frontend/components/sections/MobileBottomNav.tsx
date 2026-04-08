"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
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
  Maximize,
  Minimize,
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

const TOP_AIRLINES = [
  { name: "Alaska", href: "/alaska-airlines" },
  { name: "JetBlue", href: "/jetblue-airlines" },
  { name: "Southwest", href: "/southwest-airlines" },
  { name: "Delta", href: "/delta-airlines" },
  { name: "Aeromexico", href: "/aeromexico-airlines" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { y: 10, opacity: 0, scale: 0.9 },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20,
    } as const,
  },
} as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);

    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message}`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive =
      pathname === item.href ||
      (pathname?.startsWith(item.href) && item.href !== "/");

    return (
      <Link
        key={item.name}
        href={item.href as any}
        className="flex flex-col items-center justify-center min-w-12 h-full space-y-1 relative group"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        {isActive && (
          <motion.span
            layoutId="navItemUnderline"
            className="absolute top-0 w-8 h-1 rounded-b-full bg-primary/40 shadow-[0_2px_4px_rgba(var(--primary),0.3)]"
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 } as const}
          />
        )}
        <div className="pointer-events-none">
          <AppIcon icon={Icon} isActive={isActive} />
        </div>
        {/* <span
          className={cn(
            "text-[10px] font-bold tracking-tight transition-colors duration-300",
            isActive ? "text-primary shadow-sm" : "text-muted-foreground",
          )}
        >
          {item.name}
        </span> */}
      </Link>
    );
  };

  return (
    <>
      <nav className="fixed bottom-0 w-full z-50 bg-background/90 backdrop-blur-lg border-t border-border/50 md:hidden pb-safe">
        <div className="flex items-center justify-between h-16 px-2 sm:px-4 relative overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center justify-around flex-1 h-full">
            {leftNavItems.map(renderNavItem)}
          </div>

          <div className="relative flex items-center justify-center min-w-16 z-10 -mt-3">
            <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
              <Drawer.Trigger asChild>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  aria-label="Open menu"
                  className="flex items-center justify-center w-12 h-12 rounded-full border border-border/30 transition-all duration-200 select-none cursor-pointer"
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  <motion.div
                    animate={{ rotate: isOpen ? 90 : 0 }}
                    transition={
                      { type: "spring", stiffness: 260, damping: 20 } as const
                    }
                  >
                    <AppIcon
                      icon={Menu}
                      isActive={isOpen}
                      className="pointer-events-none"
                    />
                  </motion.div>
                </motion.button>
              </Drawer.Trigger>

              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[100] mt-24 flex h-[85vh] flex-col rounded-t-[24px] bg-background border-t shadow-2xl focus:outline-none appearance-none overflow-hidden">
                  <Drawer.Title className="sr-only">Main Menu</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    Explore flights, cars, and other travel options.
                  </Drawer.Description>
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-muted/60" />

                  <div className="flex-1 overflow-y-auto p-5 pb-20 mt-6">
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex flex-col gap-10"
                    >
                      <div className="grid grid-cols-4 gap-y-10 gap-x-4">
                        {NAVIGATION_ITEMS.map((item) => {
                          const isActive = pathname === item.url;
                          return (
                            <motion.div
                              key={item.title}
                              variants={itemVariants}
                              // whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Link
                                href={item.url as any}
                                onClick={() => setIsOpen(false)}
                                onPointerDown={(e) => e.stopPropagation()}
                                className="flex flex-col items-center justify-start gap-3 group"
                                style={{
                                  WebkitTapHighlightColor: "transparent",
                                }}
                              >
                                <div
                                  className={cn(
                                    "w-12 h-12 flex items-center justify-center transition-all duration-300",
                                    isActive
                                      ? "text-white"
                                      : " border border-border/5",
                                  )}
                                >
                                  <AppIcon
                                    icon={item.icon}
                                    isActive={isActive}
                                  />
                                </div>
                                <span
                                  className={cn(
                                    "text-xs font-semibold text-center leading-tight tracking-wider",
                                    isActive
                                      ? "text-redmix"
                                      : "text-muted-foreground group-hover:text-redmix",
                                  )}
                                >
                                  {item.title}
                                </span>
                              </Link>
                            </motion.div>
                          );
                        })}

                        <motion.div variants={itemVariants}>
                          <button
                            onClick={() =>
                              setTheme(theme === "dark" ? "light" : "dark")
                            }
                            onPointerDown={(e) => e.stopPropagation()}
                            className="flex flex-col items-center justify-start gap-3 group"
                            style={{ WebkitTapHighlightColor: "transparent" }}
                          >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300">
                              <AppIcon
                                icon={mounted && theme === "dark" ? Moon : Sun}
                              />
                            </div>
                            <span className="text-xs font-semibold text-center leading-tight tracking-wider text-muted-foreground">
                              Theme
                            </span>
                          </button>
                        </motion.div>
                        <motion.div variants={itemVariants}>
                          <button
                            onClick={toggleFullScreen}
                            onPointerDown={(e) => e.stopPropagation()}
                            className="flex flex-col items-center justify-start gap-3 group"
                            style={{ WebkitTapHighlightColor: "transparent" }}
                          >
                            <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300">
                              <AppIcon
                                icon={isFullScreen ? Minimize : Maximize}
                                isActive={isFullScreen}
                              />
                            </div>
                            <span className="text-xs font-semibold text-center leading-tight tracking-wider text-muted-foreground">
                              {isFullScreen ? "Exit Full" : "Full Screen"}
                            </span>
                          </button>
                        </motion.div>
                      </div>

                      {/* Top Airlines Section */}
                      <div className="flex flex-col gap-4">
                        <h4 className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] px-1">
                          Top Airlines
                        </h4>
                        <div className="flex gap-2 flex-wrap">
                          {TOP_AIRLINES.map((airline) => (
                            <motion.div
                              key={airline.name}
                              variants={itemVariants}
                            >
                              <Link
                                href={airline.href as any}
                                onClick={() => setIsOpen(false)}
                                className="flex flex-col items-center gap-3 p-1 hover:bg-brand-red/5 hover:border-brand-red/20 transition-all text-xs font-semibold group"
                              >
                                <AppIcon
                                  icon={Plane}
                                  // className="w-3.5 h-3.5"
                                />
                                <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                                  {airline.name}
                                </span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
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
