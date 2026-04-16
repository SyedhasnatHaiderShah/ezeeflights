"use client";

import * as React from "react";
import {
  PanelLeft,
  Heart,
  Sparkles,
  Sun,
  Moon,
  User,
  Bell,
} from "lucide-react";
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
import { motion, AnimatePresence } from "framer-motion";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";

const menuVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      staggerChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
} as const;

import { Drawer } from "vaul";
import { useRouter } from "next/navigation";

const NotificationContent = () => (
  <div className="flex flex-col h-full bg-background rounded-t-2xl sm:rounded-none">
    <div className="flex items-center justify-between p-5 border-b bg-muted/20">
      <h2 className="text-lg font-bold tracking-tight">Notifications</h2>
      <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
    </div>

    <div className="flex flex-col flex-1 overflow-y-auto min-h-[300px] max-h-[60vh]">
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center justify-center py-12 px-6 text-muted-foreground space-y-4"
      >
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
      </motion.div>
    </div>

    <motion.div
      variants={itemVariants}
      className="p-4 border-t bg-muted/5 mt-auto"
    >
      <button className="w-full py-3 text-sm font-bold text-redmix hover:bg-redmix/5 rounded-xl border border-redmix/10 transition-all">
        View all in Dashboard
      </button>
    </motion.div>
  </div>
);

const FavoriteContent = () => (
  <div className="flex flex-col h-full bg-background rounded-t-2xl sm:rounded-none">
    <div className="flex items-center justify-between p-5 border-b bg-muted/20">
      <h2 className="text-lg font-bold tracking-tight">Saved Favorites</h2>
      <div className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
    </div>

    <div className="flex flex-col flex-1 overflow-y-auto min-h-[300px] max-h-[60vh]">
      <motion.div
        variants={itemVariants}
        className="flex flex-col items-center justify-center py-12 px-6 text-muted-foreground space-y-4"
      >
        <div className="p-4 rounded-full bg-redmix/10 dark:bg-muted/10">
          <Heart className="w-10 h-10 text-redmix" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground/80">
            No favorites yet
          </p>
          <p className="text-xs">
            Tap the heart on flights or destinations to save them here.
          </p>
        </div>
      </motion.div>
    </div>

    <motion.div
      variants={itemVariants}
      className="p-4 border-t bg-muted/5 mt-auto"
    >
      <button className="w-full py-3 text-sm font-bold text-redmix hover:bg-redmix/5 rounded-xl border border-redmix/10 transition-all">
        Explore Destinations
      </button>
    </motion.div>
  </div>
);

import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { logoutRequest } from "@/lib/api/auth-api";
import { useQueryClient } from "@tanstack/react-query";

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = React.useState(false);
  const [isFavoriteDrawerOpen, setIsFavoriteDrawerOpen] = React.useState(false);
  const openAuthModal = useAuthModalStore((state) => state.open);
  const router = useRouter();
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const { data: session, isLoading, refetch } = useAuthSession();
  const queryClient = useQueryClient();

  // Debugging auth session
  React.useEffect(() => {
    if (session) console.log("Header Session Detected:", session);
  }, [session]);

  const handleLogout = async () => {
    try {
      await logoutRequest();
      // Invalidate the session query to update the UI
      queryClient.invalidateQueries({ queryKey: ["auth-session"] });
      queryClient.invalidateQueries({ queryKey: ["profile-me"] });
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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
          ? "h-20 bg-background shadow-sm border-redmix transition-all duration-300 ease-in-out"
          : "h-20 bg-background/95 backdrop-blur-sm border-transparent transition-all duration-300 ease-in-out",
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
            <AppIcon icon={PanelLeft} />
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
          {/* Mobile Favorites (Drawer) */}
          <div className="md:hidden">
            <Drawer.Root
              open={isFavoriteDrawerOpen}
              onOpenChange={setIsFavoriteDrawerOpen}
              shouldScaleBackground
            >
              <Drawer.Trigger asChild>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                >
                  <AppIcon icon={Heart} isFill />
                </motion.div>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[100] outline-none flex flex-col rounded-t-[20px] bg-background border-t shadow-2xl overflow-hidden appearance-none">
                  <Drawer.Title className="sr-only">
                    Saved Favorites
                  </Drawer.Title>
                  <Drawer.Description className="sr-only">
                    View your saved flights and destinations.
                  </Drawer.Description>
                  <div className="mx-auto mt-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted-foreground/20" />
                  <FavoriteContent />
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>

          {/* Mobile Notifications (Drawer) */}
          <div className="md:hidden">
            <Drawer.Root
              open={isNotifDrawerOpen}
              onOpenChange={setIsNotifDrawerOpen}
              shouldScaleBackground
            >
              <Drawer.Trigger asChild>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer"
                >
                  <AppIcon icon={Bell} isFill />
                </motion.div>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[100] outline-none flex flex-col rounded-t-[20px] bg-background border-t shadow-2xl overflow-hidden appearance-none">
                  <Drawer.Title className="sr-only">Notifications</Drawer.Title>
                  <Drawer.Description className="sr-only">
                    View your recent flight updates and alerts.
                  </Drawer.Description>
                  <div className="mx-auto mt-3 h-1.5 w-12 flex-shrink-0 rounded-full bg-muted-foreground/20" />
                  <NotificationContent />
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          </div>

          {/* Desktop Notifications (Dropdown) */}
          <div className="hidden md:flex gap-3">
            <AppIcon
              icon={Sparkles}
              label="Ask Ezee"
              className="hidden text-xs font-semibold sm:flex"
              onClick={() => console.log("AI search open")}
            />
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <AppIcon icon={Bell} isFill />
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={15}
                asChild
                className="w-[380px] p-0 overflow-hidden rounded-md bg-background border shadow-2xl z-[40]"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={menuVariants}
                >
                  <NotificationContent />
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop-only Utilities */}
          <div className="hidden md:flex items-center gap-2 md:gap-4">
            {/* Favorites Heart (Dropdown) */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <AppIcon icon={Heart} isFill />
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={15}
                asChild
                className="w-[380px] p-0 overflow-hidden rounded-md bg-background border shadow-2xl z-[40]"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={menuVariants}
                >
                  <FavoriteContent />
                </motion.div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle (Optional/Hidden if needed, but keeping for utility) */}
            <AppIcon
              icon={mounted && theme === "dark" ? Sun : Moon}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              isFill
            />

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="cursor-pointer">
                  <AppIcon icon={User} isFill />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isLoading ? (
                  <div className="p-4 space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                  </div>
                ) : session ? (
                  <>
                    <DropdownMenuItem
                      className="font-semibold cursor-pointer"
                      onClick={() => router.push("/profile")}
                    >
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => router.push("/profile?tab=trips")}
                    >
                      My Trips
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={handleLogout}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      className="font-semibold cursor-pointer"
                      onClick={() => openAuthModal("login")}
                    >
                      Sign in / Sign up
                    </DropdownMenuItem>
                    <div className="h-px bg-border my-1" />
                    <DropdownMenuItem onClick={() => router.push("/support")}>
                      Help
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
