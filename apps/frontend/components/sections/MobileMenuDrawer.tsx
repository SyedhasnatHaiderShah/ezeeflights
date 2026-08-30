"use client";

import * as React from "react";
import { Drawer } from "vaul";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, X, Search, Maximize, LogIn, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { NAVIGATION_GROUPS } from "@/lib/navigation";
import { FOOTER_LINK_SECTIONS } from "@/lib/footer-links";
import { CollapsibleLinkSections } from "@/components/shared/CollapsibleLinkSections";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { logoutRequest } from "@/lib/api/auth-api";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useNavChromeSurface } from "@/lib/hooks/use-nav-chrome-surface";
import { useIsAdmin } from "@/lib/hooks/use-is-admin";
import {
  isNativeFullscreen,
  toggleNativeFullscreen,
} from "@/lib/capacitor/native-chrome";
import { isAndroid } from "@/lib/capacitor/platform";

export function MobileMenuDrawer() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { isOpen, close } = useSidebarStore();
  const { data: session } = useAuthSession();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const [searchQuery, setSearchQuery] = React.useState("");
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isMobile, setIsMobile] = React.useState(false);
  const [greeting, setGreeting] = React.useState("Good morning,");
  const {
    mounted,
    pathname,
    isScrolled,
    resolvedTheme,
    isDarkMode,
    useDarkChrome,
  } = useNavChromeSurface();

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
    try {
      window.sessionStorage.setItem("auth-modal-suppress-next-open", "1");
    } catch {}
    const isProtected =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/admin");
    if (isProtected) {
      router.push("/");
    } else {
      router.refresh();
    }
  };

  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = async () => {
    const next = await toggleNativeFullscreen({
      pathname,
      isScrolled,
      theme: resolvedTheme,
    });
    setIsFullscreen(next);
  };

  React.useEffect(() => {
    if (!isOpen) return;

    void isNativeFullscreen().then(setIsFullscreen);
  }, [isOpen]);

  React.useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) {
      setGreeting("Good morning,");
    } else if (currentHour >= 12 && currentHour < 17) {
      setGreeting("Good afternoon,");
    } else {
      setGreeting("Good evening,");
    }
  }, []);

  const userName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    session?.email ||
    t("Traveler");

  const isAdmin = useIsAdmin();

  // Flatten all items for the search and grid
  const allNavItems = React.useMemo(() => {
    const isAndroidDevice = isAndroid();
    const items = NAVIGATION_GROUPS.flatMap((group) => group.items).filter((item) => {
      if (item.href === "/dashboard") {
        if (!isAdmin || isAndroidDevice) {
          return false;
        }
      }
      return true;
    });

    if (!isAndroidDevice) {
      items.push({
        label: "Profile",
        href: "/profile" as any,
        icon: User,
        requiresAuth: true,
      });
    }

    return items;
  }, [isAdmin]);

  const filteredItems = allNavItems.filter((item) => {
    const translatedLabel = t(item.label) || "";
    return (
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translatedLabel.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Drawer.Root
      open={isOpen && isMobile}
      onOpenChange={(open) => !open && close()}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-[2px] md:hidden" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[101] mt-12 flex max-h-[92%] flex-col rounded-t-3xl shadow-2xl outline-none transition-colors duration-300 md:hidden",
            useDarkChrome
              ? "bg-[#0e0e0e] text-white"
              : "bg-white text-foreground",
          )}
        >
          <Drawer.Title className="sr-only">
            {t("Navigation Menu")}
          </Drawer.Title>
          <Drawer.Description className="sr-only">
            {t("Access flights, hotels, and account settings.")}
          </Drawer.Description>

          {/* Handle */}
          <div
            className={cn(
              "mx-auto my-3.5 h-1 w-10 shrink-0 rounded-full transition-colors duration-300",
              useDarkChrome ? "bg-white/20" : "bg-zinc-200",
            )}
          />

          <div className="flex-1 overflow-y-auto p-3 pt-1">
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
              className="mb-4 px-1"
            >
              {!mounted ? (
                <Skeleton className="h-5 w-28 mb-1 rounded-md" />
              ) : (
                <p
                  className={cn(
                    "text-sm",
                    useDarkChrome ? "text-white/70" : "text-foreground",
                  )}
                >
                  {t(greeting)}
                </p>
              )}
              <h3
                className={cn(
                  "text-xl font-bold",
                  useDarkChrome ? "text-white" : "text-foreground",
                )}
              >
                {isAndroid()
                  ? (session ? userName : t("Traveler"))
                  : (session ? userName : t("Sign in to continue"))}
              </h3>
            </motion.div>

            {/* <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="mb-5"
            >
              <CollapsibleLinkSections
                sections={FOOTER_LINK_SECTIONS}
                onLinkClick={close}
              />
            </motion.div> */}

            {/* Search Bar (Cleaner) */}
            {/* <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative mb-6"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t("Search...")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-border/50 text-sm focus:border-brand-red/50 transition-all outline-none"
              />
            </motion.div> */}

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
                        "group flex flex-col items-center gap-0 p-1 transition-all active:scale-95",
                        active
                          ? "text-brand-red"
                          : useDarkChrome
                            ? "text-white hover:text-brand-red"
                            : "text-foreground hover:text-brand-red",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-all",
                        )}
                      >
                        <Icon className="h-5 w-5 transition-transform" />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {t(item.label)}
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
                  className={cn(
                    "group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 hover:text-brand-red",
                    useDarkChrome ? "text-white" : "text-foreground",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl group-hover:bg-brand-red/5 transition-all">
                    {mounted && theme === "dark" ? (
                      <Moon className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    ) : (
                      <Sun className="h-5 w-5 transition-transform group-hover:rotate-90" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {mounted
                      ? theme === "dark"
                        ? t("Light")
                        : t("Dark")
                      : t("Theme")}
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
                  className={cn(
                    "group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 hover:text-brand-red",
                    useDarkChrome ? "text-white" : "text-foreground",
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl  group-hover:bg-brand-red/5 transition-all">
                    <Maximize className="h-5 w-5 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight">
                    {isFullscreen ? t("Exit Fullscreen") : t("Fullscreen")}
                  </span>
                </button>
              </motion.div>

              {/* Sign In / Sign Out (Integrated into Grid) */}
              {!isAndroid() &&
                (!session ? (
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
                      className={cn(
                        "group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 hover:text-brand-red",
                        useDarkChrome ? "text-white" : "text-foreground",
                      )}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl group-hover:bg-brand-red/5 transition-all">
                        <LogIn className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                      <span className="text-xs font-medium text-center leading-tight">
                        {t("Sign In")}
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
                      className={cn(
                        "group flex w-full flex-col items-center gap-1.5 p-1 transition-all active:scale-95 hover:text-brand-red",
                        useDarkChrome ? "text-white" : "text-foreground",
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-xl transition-all group-hover:bg-brand-red/5",
                          useDarkChrome ? "bg-white/10" : "bg-zinc-50",
                        )}
                      >
                        <LogOut className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </div>
                      <span className="text-[11px] font-medium text-center leading-tight">
                        {t("Sign Out")}
                      </span>
                    </button>
                  </motion.div>
                ))}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
