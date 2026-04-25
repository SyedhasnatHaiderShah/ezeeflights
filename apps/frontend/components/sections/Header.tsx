"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Drawer } from "vaul";
import { motion } from "framer-motion";
import {
  Bell,
  Briefcase,
  Car,
  Heart,
  Hotel,
  MapPinned,
  PanelLeft,
  Plane,
  Shield,
  Sparkles,
  Sun,
  Moon,
  User,
  ChevronDown,
  Gift,
  X,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppIcon } from "@/components/ui/app-icon";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { logoutRequest } from "@/lib/api/auth-api";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from "@/lib/api/notifications";
import { Button } from "../ui/button";

const navTabs = [
  { label: "Flights", href: "/flights", icon: Plane },
  { label: "Hotels", href: "/hotels", icon: Hotel },
  { label: "Cars", href: "/cars", icon: Car },
  { label: "Packages", href: "/packages", icon: Gift },
] as const;

const moreLinks = [
  { label: "Transfers", href: "/transfers", icon: Car },
  { label: "Insurance", href: "/insurance", icon: Shield },
  { label: "Experiences", href: "/experience", icon: Sparkles },
  { label: "Destinations", href: "/destinations", icon: MapPinned },
] as const;

const NotificationContent = () => {
  const { data: notifications = [] } = useNotifications({ page: 1, limit: 10 });
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();

  return (
    <div className="flex h-full min-h-[320px] flex-col bg-background">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-semibold">
          Notifications ({unread?.count ?? 0})
        </h2>
        <button
          className="text-xs text-brand-red"
          onClick={() => markAll.mutate()}
        >
          Mark all read
        </button>
      </div>
      <div className="flex-1 overflow-auto p-3">
        {notifications.length === 0 ? (
          <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
            All caught up! Check back later for new alerts.
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              key={notification.id}
              className={`mb-2 w-full rounded-lg border p-3 text-left ${notification.isRead ? "opacity-70" : "bg-muted/40"}`}
              onClick={() => markRead.mutate(notification.id)}
            >
              <p className="text-sm font-semibold">{notification.title}</p>
              <p className="text-xs text-muted-foreground">
                {notification.body}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

const FavoriteContent = () => (
  <div className="flex h-full min-h-[320px] flex-col bg-background">
    <div className="border-b p-4">
      <h2 className="text-lg font-semibold">Saved Favorites</h2>
    </div>
    <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
      No favorites yet. Save flights and destinations to see them here.
    </div>
  </div>
);

export function Header({ transparent = false }: { transparent?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();

  const currentTab = searchParams.get("tab") || "flights";
  const toggleSidebar = useSidebarStore((state) => state.toggle);
  const openAuthModal = useAuthModalStore((state) => state.open);
  const { data: session, isLoading } = useAuthSession();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [promoDismissed, setPromoDismissed] = React.useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = React.useState(false);
  const [isFavoriteDrawerOpen, setIsFavoriteDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const dismissed =
      window.sessionStorage.getItem("header-promo-dismissed") === "1";
    setPromoDismissed(dismissed);
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dismissPromo = React.useCallback(() => {
    setPromoDismissed(true);
    window.sessionStorage.setItem("header-promo-dismissed", "1");
  }, []);

  const handleLogout = async () => {
    await logoutRequest();
    queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    queryClient.invalidateQueries({ queryKey: ["profile-me"] });
    router.push("/");
  };

  const displayName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    session?.email ||
    "User";
  const userInitial = displayName.trim().charAt(0).toUpperCase();

  const isTransparent = transparent && !isScrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b transition-all duration-300",
          isScrolled
            ? "bg-background shadow-sm border-border"
            : isTransparent
              ? "bg-white/15 backdrop-blur-xl border-white/10 text-white"
              : "bg-background/95 backdrop-blur-md border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
              className={cn(
                "hidden rounded-lg p-2 transition md:inline-flex",
                isTransparent
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
              className={cn(
                "rounded-lg p-2 transition md:hidden",
                isTransparent
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <PanelLeft className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center">
              <EzeeFlightsLogo
                isDarkMode={(mounted && theme === "dark") || isTransparent}
                className="h-auto w-32"
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navTabs.map((tab) => {
              const isActive =
                pathname === tab.href ||
                pathname?.startsWith(`${tab.href}/`) ||
                (pathname === "/" && currentTab === tab.label.toLowerCase());
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "relative hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-300 rounded-full",
                    isActive
                      ? isTransparent
                        ? "bg-white text-redmix shadow-lg"
                        : "bg-redmix text-white shadow-lg"
                      : isTransparent
                        ? "text-white hover:text-white hover:bg-white/10"
                        : "text-foreground hover:text-redmix hover:bg-redmix/10",
                  )}
                >
                  {/* <Icon
                    className={cn(
                      "h-4 w-4",
                      isActive
                        ? isTransparent
                          ? "text-redmix"
                          : "text-white"
                        : isTransparent
                          ? "text-white/70"
                          : "text-muted-foreground",
                    )}
                  /> */}
                  {tab.label}
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "relative flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full",
                    moreLinks.some(
                      (link) =>
                        pathname === link.href ||
                        (pathname === "/" &&
                          currentTab === link.label.toLowerCase()),
                    )
                      ? isTransparent
                        ? "bg-white text-redmix shadow-lg"
                        : "bg-redmix text-white shadow-lg"
                      : isTransparent
                        ? "text-white/80 hover:text-white hover:bg-white/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Briefcase className="h-4 w-4" />
                  <span className="lg:hidden">Explore</span>
                  <span className="hidden lg:inline">More</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                className="w-[320px] lg:w-[560px] p-4"
              >
                <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_1fr] gap-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                    {/* On screens below lg, show primary tabs in dropdown */}
                    <div className="lg:hidden contents">
                      {navTabs.map((item) => {
                        const isSubActive = pathname === item.href;
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-xl p-3 transition-all duration-200",
                              isSubActive
                                ? "bg-redmix/5 text-redmix"
                                : "hover:bg-muted text-foreground",
                            )}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isSubActive
                                  ? "bg-redmix text-white"
                                  : "bg-muted group-hover:bg-background",
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-bold">{item.label}</span>
                          </Link>
                        );
                      })}
                      <div className="h-px bg-border my-2 lg:hidden" />
                    </div>

                    {moreLinks.map((item) => {
                      const isSubActive =
                        pathname === item.href ||
                        (pathname === "/" &&
                          currentTab === item.label.toLowerCase());
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 rounded-xl p-3 transition-all duration-200 group",
                            isSubActive
                              ? "bg-redmix/5 text-redmix"
                              : "hover:bg-muted text-foreground",
                          )}
                        >
                          <div
                            className={cn(
                              "p-2 rounded-lg transition-colors",
                              isSubActive
                                ? "bg-redmix text-white"
                                : "bg-muted group-hover:bg-background",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-bold">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="hidden lg:block">
                    <Link
                      href="/packages"
                      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl"
                    >
                      <Image
                        src="/logos-banner-new.jpg"
                        alt="Featured deals"
                        width={260}
                        height={160}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                        <p className="text-xs uppercase tracking-wide text-white/80">
                          Featured
                        </p>
                        <p className="text-sm font-semibold">
                          Explore top travel bundles
                        </p>
                      </div>
                    </Link>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden md:block">
              <Link
                href="/support"
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-300",
                  isTransparent
                    ? "text-white hover:text-redmix"
                    : "text-foreground hover:text-redmix",
                )}
              >
                Ask Ezee
              </Link>
            </div>

            <div className="md:hidden">
              <Drawer.Root
                open={isNotifDrawerOpen}
                onOpenChange={setIsNotifDrawerOpen}
              >
                <Drawer.Trigger asChild>
                  <button
                    className={cn(
                      "rounded-lg p-2 transition",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted-foreground",
                    )}
                  >
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-redmix" />
                    </div>
                  </button>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm" />
                  <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[80] overflow-hidden rounded-t-2xl border-t bg-background">
                    <Drawer.Title className="sr-only">
                      Notifications
                    </Drawer.Title>
                    <NotificationContent />
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            </div>

            <div className="md:hidden">
              <Drawer.Root
                open={isFavoriteDrawerOpen}
                onOpenChange={setIsFavoriteDrawerOpen}
              >
                <Drawer.Trigger asChild>
                  <button
                    className={cn(
                      "rounded-lg p-2 transition",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted-foreground",
                    )}
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm" />
                  <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[80] overflow-hidden rounded-t-2xl border-t bg-background">
                    <Drawer.Title className="sr-only">Favorites</Drawer.Title>
                    <FavoriteContent />
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            </div>

            <div className="hidden md:block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "rounded-lg p-2 transition",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Bell className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[360px] p-0 overflow-hidden"
                >
                  <NotificationContent />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden md:block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "rounded-lg p-2 transition",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <Heart className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-[360px] p-0 overflow-hidden"
                >
                  <FavoriteContent />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "hidden rounded-lg p-2 transition md:inline-flex",
                isTransparent
                  ? "text-white hover:bg-white/10 hover:text-white"
                  : "text-foreground hover:bg-muted",
              )}
            >
              {mounted && theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            {isLoading ? (
              <div className="hidden h-10 w-24 animate-pulse rounded-full bg-muted md:block" />
            ) : session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-redmix/10 text-sm font-semibold text-redmix md:h-10 md:w-10">
                    {userInitial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-trips")}>
                    My Trips
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/wallet")}>
                    Wallet
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={handleLogout}
                  >
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <div className="hidden items-center gap-2 md:flex">
                  <button
                    onClick={() => openAuthModal("login")}
                    className={cn(
                      "rounded-full px-6 py-2 text-sm font-medium cursor-pointer transition-all duration-300",
                      isTransparent
                        ? "text-white hover:text-redmix"
                        : "text-foreground hover:text-redmix",
                    )}
                  >
                    Sign in
                  </button>
                  {/* <button
                    onClick={() => openAuthModal("register")}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-medium transition",
                      isTransparent
                        ? "border-white/20 bg-white/5 text-white hover:bg-white/10"
                        : "border-border bg-transparent text-foreground hover:bg-muted",
                    )}
                  >
                    Sign up
                  </button> */}
                </div>
                <button
                  onClick={() => openAuthModal("login")}
                  className={cn(
                    "rounded-lg p-2 transition md:hidden",
                    isTransparent
                      ? "text-white hover:bg-white/10 hover:text-white"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <User className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Promo Strip */}
      {!isScrolled && !promoDismissed && (
        <div className="border-b border-brand-yellow/40 bg-brand-yellow/10">
          <div className="mx-auto flex min-h-[2.25rem] max-w-screen-2xl items-center justify-between gap-3 px-4 py-2 sm:h-9 sm:px-6 sm:py-0">
            <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] leading-snug text-foreground xs:text-xs sm:text-sm">
              <span className="font-medium">
                {/* Shorter text for tiny screens, full text for larger ones */}
                <span className="inline md:hidden">
                  🔥 Flash Deals: Up to 40% Off
                </span>
                <span className="hidden md:inline">
                  🔥 Flash Deals Active — Save up to 40% this week
                </span>
              </span>
              <Link
                href="/deals"
                className="whitespace-nowrap font-bold text-redmix hover:underline"
              >
                See Deals →
              </Link>
            </div>

            <button
              aria-label="Dismiss deals strip"
              onClick={dismissPromo}
              className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-brand-yellow/30 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
