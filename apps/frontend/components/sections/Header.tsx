"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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

const NotificationContent = () => (
  <div className="flex h-full min-h-[320px] flex-col bg-background">
    <div className="border-b p-4">
      <h2 className="text-lg font-semibold">Notifications</h2>
    </div>
    <div className="flex flex-1 items-center justify-center p-6 text-center text-sm text-muted-foreground">
      All caught up! Check back later for new alerts.
    </div>
  </div>
);

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

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
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
    const dismissed = window.sessionStorage.getItem("header-promo-dismissed") === "1";
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

  const displayName = [session?.firstName, session?.lastName].filter(Boolean).join(" ") || session?.email || "User";
  const userInitial = displayName.trim().charAt(0).toUpperCase();

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b transition-all duration-300",
          isScrolled
            ? "bg-background shadow-sm border-border"
            : "bg-background/95 backdrop-blur-md border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-1 md:gap-2">
            <button
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
              className="hidden rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground md:inline-flex"
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Toggle sidebar"
              onClick={toggleSidebar}
              className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
            >
              <PanelLeft className="h-5 w-5" />
            </button>

            <Link href="/" className="flex items-center">
              <EzeeFlightsLogo
                isDarkMode={mounted && theme === "dark"}
                className="h-auto w-32"
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navTabs.map((tab) => {
              const isActive = pathname === tab.href || pathname?.startsWith(`${tab.href}/`);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={cn(
                    "relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "text-brand-red"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  <span
                    className={cn(
                      "absolute bottom-0 left-0 h-0.5 w-full origin-left bg-brand-red transition-transform duration-300",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              );
            })}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
                  <Briefcase className="h-4 w-4" />
                  More
                  <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-[560px] p-4">
                <div className="grid grid-cols-[1.2fr_1fr] gap-4">
                  <div className="grid grid-cols-2 gap-2">
                    {moreLinks.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-2 rounded-lg border border-border/70 p-3 text-sm font-medium text-foreground transition hover:bg-muted"
                      >
                        <item.icon className="h-4 w-4 text-brand-red" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <Link href="/deals" className="group relative overflow-hidden rounded-xl">
                    <Image
                      src="/logos-banner-new.jpg"
                      alt="Featured deals"
                      width={260}
                      height={160}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                      <p className="text-xs uppercase tracking-wide text-white/80">Featured</p>
                      <p className="text-sm font-semibold">Explore top travel bundles</p>
                    </div>
                  </Link>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          <div className="flex items-center gap-2">
            <AppIcon
              icon={Sparkles}
              label="Ask Ezee"
              className="hidden sm:flex"
              onClick={() => router.push("/support")}
            />

            <div className="md:hidden">
              <Drawer.Root open={isNotifDrawerOpen} onOpenChange={setIsNotifDrawerOpen}>
                <Drawer.Trigger asChild>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
                    <Bell className="h-5 w-5" />
                  </button>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm" />
                  <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[80] overflow-hidden rounded-t-2xl border-t bg-background">
                    <Drawer.Title className="sr-only">Notifications</Drawer.Title>
                    <NotificationContent />
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            </div>

            <div className="md:hidden">
              <Drawer.Root open={isFavoriteDrawerOpen} onOpenChange={setIsFavoriteDrawerOpen}>
                <Drawer.Trigger asChild>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted">
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
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Bell className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[360px] p-0 overflow-hidden">
                  <NotificationContent />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden md:block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <Heart className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[360px] p-0 overflow-hidden">
                  <FavoriteContent />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
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
                  <button className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-red/10 text-sm font-semibold text-brand-red md:h-10 md:w-10">
                    {userInitial}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>Profile</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/my-trips")}>My Trips</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/wallet")}>Wallet</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={handleLogout}>
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <div className="hidden items-center gap-2 md:flex">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuthModal("register")}
                    className="rounded-full bg-gradient-to-r from-brand-red to-brand-red-light px-4 py-2 text-sm font-semibold text-white"
                  >
                    Sign up
                  </button>
                </div>
                <button
                  onClick={() => openAuthModal("login")}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted md:hidden"
                >
                  <User className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!isScrolled && !promoDismissed && (
        <div className="border-b border-brand-yellow/40 bg-brand-yellow/10">
          <div className="mx-auto flex h-9 max-w-screen-2xl items-center justify-between px-4 text-xs sm:px-6 sm:text-sm">
            <div className="flex items-center gap-2 text-foreground">
              <span>🔥 Flash Deals Active — Save up to 40% this week</span>
              <Link href="/deals" className="font-semibold text-brand-red hover:underline">
                See Deals →
              </Link>
            </div>
            <button
              aria-label="Dismiss deals strip"
              onClick={dismissPromo}
              className="rounded p-1 text-muted-foreground transition hover:bg-brand-yellow/30 hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
