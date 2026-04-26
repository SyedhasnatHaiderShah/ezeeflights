"use client";

import * as React from "react";
import { Drawer } from "vaul";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, X, Search, Maximize, LogIn, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { NAVIGATION_GROUPS } from "@/lib/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { logoutRequest } from "@/lib/api/auth-api";
import { useRouter } from "next/navigation";

export function MobileMenuDrawer() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { isOpen, close } = useSidebarStore();
  const { data: session } = useAuthSession();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [mounted, setMounted] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    await logoutRequest();
    queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    queryClient.invalidateQueries({ queryKey: ["profile-me"] });
    close();
    router.push("/");
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(
          `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
        );
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const userName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    session?.email ||
    "Traveler";

  // Flatten all items for the search and grid
  const allNavItems = React.useMemo(() => {
    return NAVIGATION_GROUPS.flatMap((group) => group.items);
  }, []);

  const filteredItems = allNavItems.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <Drawer.Root open={isOpen && isMobile} onOpenChange={(open) => !open && close()}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px] md:hidden" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] mt-12 flex max-h-[92%] flex-col rounded-t-3xl bg-white dark:bg-zinc-950 shadow-2xl outline-none md:hidden">
          <Drawer.Title className="sr-only">Navigation Menu</Drawer.Title>
          <Drawer.Description className="sr-only">
            Access flights, hotels, and account settings.
          </Drawer.Description>

          <div className="flex-1 overflow-y-auto p-3">
            {/* Handle */}
            <div className="mx-auto mb-4 h-1 w-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-800" />

            {/* Header */}
            {/* <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between mb-4 px-1"
            >
              <h2 className="text-lg font-bold text-foreground">Menu</h2>
              <button
                onClick={close}
                className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </motion.div> */}

            {/* User Info Section (Simplified) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-6 px-1"
            >
              <p className="text-sm text-muted-foreground">Good evening,</p>
              <h3 className="text-xl font-bold text-foreground">
                {session ? userName : "Sign in to continue"}
              </h3>
            </motion.div>

            {/* Search Bar (Cleaner) */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative mb-6"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border/50 text-sm focus:border-brand-red/50 transition-all outline-none"
              />
            </motion.div>

            {/* Section Header */}
            {/* <div className="mb-4 px-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                All Pages
              </h4>
            </div> */}

            {/* Grid of Items (Clean List-Grid) */}
            <div className="grid grid-cols-3 gap-y-3 gap-x-2 pb-5">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 + index * 0.02 }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => {
                        if (item.href === "/profile" && !session) {
                          openAuthModal("login");
                        }
                        close();
                      }}
                      className={cn(
                        "group flex flex-col items-center gap-1.5 p-1 transition-all active:scale-95",
                        active
                          ? "text-brand-red"
                          : "text-foreground hover:text-brand-red",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                          active
                            ? "bg-brand-red/5"
                            : "bg-zinc-50 dark:bg-zinc-900 group-hover:bg-brand-red/5",
                        )}
                      >
                        <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="text-[11px] font-medium text-center leading-tight">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                );
              })}

              {/* Theme Toggle (Integrated into Grid) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + filteredItems.length * 0.02 }}
              >
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 text-foreground hover:text-brand-red"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover:bg-brand-red/5 transition-all">
                    {mounted && theme === "dark" ? (
                      <Moon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    ) : (
                      <Sun className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">
                    {mounted ? (theme === "dark" ? "Light" : "Dark") : "Theme"}
                  </span>
                </button>
              </motion.div>

              {/* Fullscreen (Integrated into Grid) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + (filteredItems.length + 1) * 0.02 }}
              >
                <button
                  onClick={toggleFullscreen}
                  className="group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 text-foreground hover:text-brand-red"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover:bg-brand-red/5 transition-all">
                    <Maximize className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[11px] font-medium text-center leading-tight">
                    Fullscreen
                  </span>
                </button>
              </motion.div>

              {/* Sign In / Sign Out (Integrated into Grid) */}
              {!session ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 + (filteredItems.length + 2) * 0.02,
                  }}
                >
                  <button
                    onClick={() => {
                      close();
                      openAuthModal("login");
                    }}
                    className="group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 text-foreground hover:text-brand-red"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover:bg-brand-red/5 transition-all">
                      <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">
                      Sign In
                    </span>
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.1 + (filteredItems.length + 2) * 0.02,
                  }}
                >
                  <button
                    onClick={handleLogout}
                    className="group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 text-foreground hover:text-brand-red"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900 group-hover:bg-brand-red/5 transition-all">
                      <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight">
                      Sign Out
                    </span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
