"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Drawer } from "vaul";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
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
  Info,
  ChevronRight,
  Grid3X3,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";
import { useCacheIndicatorStore } from "@/lib/store/cache-indicator-store";
import { Zap } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppIcon } from "@/components/ui/app-icon";
import { CurrencySelector } from "../shared/CurrencySelector";
import { useCurrencyStore } from "@/lib/store/currency-store";
import { Globe } from "lucide-react";
import { LanguageSelector } from "../shared/LanguageSelector";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { logoutRequest } from "@/lib/api/auth-api";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useIsAdmin } from "@/lib/hooks/use-is-admin";
import { useProfile } from "@/lib/hooks/use-profile";
import { useUnreadCount } from "@/lib/api/notifications";
import { NotificationContent } from "@/components/notifications/NotificationContent";
import { useWishlistStore } from "@/lib/store/use-wishlist-store";
import { Button } from "../ui/button";
import { AskEzeeAi } from "../ai/AskEzeeAi";
import { usePageScroll } from "@/lib/hooks/use-page-scroll";
import { NAV_HERO_GLASS, NAV_SCROLLED } from "@/lib/constants/nav-chrome";
import { isAndroid } from "@/lib/capacitor/platform";

const navTabs = [
  { label: "Flights", href: "/", icon: Plane, tab: "flights" },
  { label: "Hotels", href: "/", icon: Hotel, tab: "hotels" },
  { label: "Cars", href: "/", icon: Car, tab: "cars" },
  // { label: "Packages", href: "/", icon: Gift, tab: "packages" },
] as const;

const moreLinks = [
  { label: "Transfers", href: "/", icon: Car, tab: "transfers" },
  { label: "Insurance", href: "/insurance", icon: Shield, tab: "insurance" },
  {
    label: "Experiences",
    href: "/experience",
    icon: Sparkles,
    tab: "experience",
  },
  {
    label: "Destinations",
    href: "/destinations",
    icon: MapPinned,
    tab: "destinations",
  },
] as const;

const LoginSuccessStrip = ({ onDismiss }: { onDismiss: () => void }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="relative z-10 border-b border-green-500/20 bg-green-500/5 backdrop-blur-sm overflow-hidden"
    >
      <div className="relative mx-auto flex min-h-[2.5rem] max-w-screen-2xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
        <div className="flex flex-1 items-center gap-2 text-xs sm:text-sm">
          <Sparkles className="h-4 w-4 text-white" />
          <span className="font-semibold text-white">{t("Welcome back!")}</span>
          <span className="text-white/70 hidden sm:inline">
            {t("You have successfully signed in to your account.")}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 rounded-full p-1.5 text-green-600/50 transition-all hover:bg-green-600/10 hover:text-green-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

const FavoriteContent = ({
  isTransparent = false,
}: {
  isTransparent?: boolean;
}) => {
  const { t } = useTranslation();
  const wishlistItems = useWishlistStore((state) => state.items);
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex h-full max-h-[360px] flex-col transition-all duration-500",
        isTransparent
          ? "bg-white/10 dark:bg-black/60 backdrop-blur-2xl border-white/20 text-white"
          : "bg-background text-foreground",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border-b p-4 transition-colors duration-500",
          isTransparent ? "border-white/10" : "border-border",
        )}
      >
        <h2 className="text-lg font-semibold">
          {t("Saved Favorites")} ({wishlistItems.length})
        </h2>
        {wishlistItems.length > 0 && (
          <Button
            variant="link"
            size="sm"
            className={cn(
              "font-bold transition-colors",
              isTransparent ? "text-white hover:text-white/80" : "text-redmix",
            )}
            onClick={() => router.push("/my-trips" as any)}
          >
            {t("View All")}
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto p-4">
        {wishlistItems.length === 0 ? (
          <div
            className={cn(
              "flex h-full items-center justify-center p-6 text-center text-sm",
              isTransparent ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {t(
              "No favorites yet. Save flights and destinations to see them here.",
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {wishlistItems.map((item) => (
              <button
                key={item.id}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 text-left",
                  isTransparent
                    ? "bg-white/10 border-white/10 hover:bg-white/20"
                    : "border-border bg-card/50 hover:bg-muted/50",
                )}
                onClick={() => {
                  if (item.entityType === "flights") {
                    // Optionally navigate to specific flight search?
                    // For now just stay or go to results
                  }
                }}
              >
                <div
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                    isTransparent ? "bg-white/20" : "bg-redmix/10",
                  )}
                >
                  {item.entityType === "flights" ? (
                    <Plane
                      className={cn(
                        "h-5 w-5",
                        isTransparent ? "text-white" : "text-redmix",
                      )}
                    />
                  ) : (
                    <Hotel
                      className={cn(
                        "h-5 w-5",
                        isTransparent ? "text-white" : "text-redmix",
                      )}
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-bold truncate",
                      isTransparent ? "text-white" : "text-foreground",
                    )}
                  >
                    {item.entityType === "flights" &&
                    item.data?.outbound?.length > 0
                      ? `${item.data.outbound[0].fromAirport?.code || ""} → ${item.data.outbound[item.data.outbound.length - 1].toAirport?.code || ""}`
                      : t("Saved Item")}
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      isTransparent ? "text-white/70" : "text-muted-foreground",
                    )}
                  >
                    {(item.entityType || "").charAt(0).toUpperCase() +
                      (item.entityType || "").slice(1)}{" "}
                    • {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4",
                    isTransparent ? "text-white/50" : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function HeaderContent({ transparent = false }: { transparent?: boolean }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { theme, setTheme } = useTheme();
  const baseCurrency = useCurrencyStore((s) => s.baseCurrency);

  const currentTab = searchParams.get("tab") || "flights";
  const toggleSidebar = useSidebarStore((state: any) => state.toggle);
  const openAuthModal = useAuthModalStore((state: any) => state.open);
  const { data: session, isLoading } = useAuthSession();
  const isAdmin = useIsAdmin();
  const { fromCache, cachedAgoLabel } = useCacheIndicatorStore();
  const { data: profile } = useProfile(!!session);
  const { data: unread } = useUnreadCount();

  const isScrolled = usePageScroll(20);
  const [mounted, setMounted] = React.useState(false);
  const [promoDismissed, setPromoDismissed] = React.useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = React.useState(false);

  const prevSession = React.useRef(session);

  React.useEffect(() => {
    if (!isLoading && !session) {
      window.sessionStorage.removeItem("auth-session-init");
      // Any other session state to clear
    }
    if (!prevSession.current && session) {
      setShowLoginSuccess(true);
      const timer = setTimeout(() => setShowLoginSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
    prevSession.current = session;
  }, [session, isLoading]);
  const [profileNotifyDismissed, setProfileNotifyDismissed] =
    React.useState(false);
  const [isNotifDrawerOpen, setIsNotifDrawerOpen] = React.useState(false);
  const [isFavoriteDrawerOpen, setIsFavoriteDrawerOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isAskEzeeOpen, setIsAskEzeeOpen] = React.useState(false);
  const [isExploreOpen, setIsExploreOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isUserMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const isProfileComplete = React.useMemo(() => {
    if (!session) return true;
    if (!profile) return true; // Assume complete while loading to avoid flicker, or could show spinner

    // Use the root fields which are merged from baseUser and profile
    return !!(
      profile.firstName &&
      profile.lastName &&
      profile.phone &&
      profile.nationality
    );
  }, [profile, session]);

  const initializeWishlist = useWishlistStore((state) => state.initialize);
  const wishlistCount = useWishlistStore((state) => state.items.length);

  React.useEffect(() => {
    setMounted(true);
    // Initialize wishlist with optional userId
    initializeWishlist(session?.id);

    const dismissed =
      window.sessionStorage.getItem("header-promo-dismissed") === "1";
    setPromoDismissed(dismissed);
    const profileDismissed =
      window.sessionStorage.getItem("header-profile-notify-dismissed") === "1";
    setProfileNotifyDismissed(profileDismissed);
  }, []);

  const dismissPromo = React.useCallback(() => {
    setPromoDismissed(true);
    window.sessionStorage.setItem("header-promo-dismissed", "1");
  }, []);

  const dismissProfileNotify = React.useCallback(() => {
    setProfileNotifyDismissed(true);
    window.sessionStorage.setItem("header-profile-notify-dismissed", "1");
  }, []);

  const handleLogout = async () => {
    await logoutRequest();
    queryClient.invalidateQueries({ queryKey: ["auth-session"] });
    queryClient.invalidateQueries({ queryKey: ["profile-me"] });
    try {
      window.sessionStorage.setItem("auth-modal-suppress-next-open", "1");
    } catch {}
    const isProtected =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/admin");
    if (isProtected) {
      router.push("/" as any);
    } else {
      router.refresh();
    }
  };

  const displayName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    session?.email ||
    t("User");
  const userInitial = (displayName || t("User")).trim().charAt(0).toUpperCase();

  const isTransparent = transparent && !isScrolled;

  return (
    <header className="fixed inset-x-0 top-0 z-[60] isolate">
      <div
        className={cn(
          "relative z-20 border-b transition-all duration-300",
          isScrolled
            ? NAV_SCROLLED
            : isTransparent
              ? NAV_HERO_GLASS
              : "bg-background/95 backdrop-blur-md border-transparent text-foreground",
        )}
      >
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-1 md:gap-2">
            {/* <button
              aria-label={t("Toggle sidebar")}
              onClick={toggleSidebar}
              className={cn(
                "hidden rounded-lg p-2 transition md:inline-flex",
                isTransparent
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <PanelLeft className="h-5 w-5" />
            </button> */}

            <Link
              href={"/" as any}
              className="flex items-center"
              aria-label={t("Ezee Flights Home")}
            >
              <EzeeFlightsLogo
                isDarkMode={(mounted && theme === "dark") || isTransparent}
                className="h-auto w-32"
              />
            </Link>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {navTabs.map((tab) => {
              const tabParam = searchParams.get("tab");
              // If a tab is in the URL, use it. Otherwise, default to "flights" only when on the home page.
              const isActive = tabParam
                ? tabParam === tab.tab
                : pathname === "/" && tab.tab === "flights";
              pathname === "/" && currentTab === tab.label.toLowerCase();
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.tab}
                  href={`${tab.href}?tab=${tab.tab}` as any}
                  className={cn(
                    "relative hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium cursor-pointer transition-all duration-300 rounded-full",
                    isActive
                      ? isTransparent
                        ? "bg-white text-redmix shadow-[0_8px_16px_rgba(255,255,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.4)]"
                        : "bg-redmix text-white shadow-[0_8px_16px_rgba(197,42,40,0.3),inset_0_1px_1px_rgba(255,255,255,0.3)]"
                      : isTransparent
                        ? "text-white hover:text-white hover:bg-white/10"
                        : "text-foreground hover:text-redmix hover:bg-redmix/10",
                  )}
                >
                  {mounted ? t(tab.label) : tab.label}
                </Link>
              );
            })}

            {/* <DropdownMenu
              open={isExploreOpen}
              onOpenChange={setIsExploreOpen}
              modal={false}
            >
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "group relative flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full overflow-hidden",
                    moreLinks.some((link) => {
                      const linkTabId = link.label.toLowerCase();
                      const tabFromUrl = searchParams.get("tab");
                      return tabFromUrl
                        ? tabFromUrl === linkTabId
                        : pathname === link.href;
                    })
                      ? isTransparent
                        ? "bg-white text-redmix shadow-lg shadow-redmix/20"
                        : "bg-redmix text-white shadow-lg shadow-redmix/30"
                      : isTransparent
                        ? "text-white/90 hover:text-white border border-white/40 bg-white/10 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] hover:bg-white/20"
                        : "text-foreground border border-border/30 bg-background/20 backdrop-blur-xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] hover:text-redmix hover:bg-redmix/5",
                  )}
                >
                  <Grid3X3 className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                  <span className="lg:hidden">{t("Explore")}</span>
                  <span className="hidden lg:inline">{t("More")}</span>
                  <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={12}
                onPointerDownOutside={() => setIsExploreOpen(false)}
                className={cn(
                  "w-[280px] lg:w-[480px] p-0 overflow-hidden rounded-[2rem] border animate-in fade-in zoom-in-95 duration-300",
                  isScrolled
                    ? "bg-background/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-border/40"
                    : isTransparent
                      ? "bg-[#0e0e0e]/80 backdrop-blur-xl border-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      : "bg-background/95 backdrop-blur-md border-transparent text-foreground",
                )}
              >
                <div className="flex flex-col lg:flex-row">
                  <div className="flex-1 p-3 lg:p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
                      <div className="lg:hidden contents">
                        {navTabs.map((item) => {
                          const tabParam = searchParams.get("tab");
                          const isSubActive = tabParam
                            ? tabParam === item.tab
                            : pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <DropdownMenuItem key={item.tab} asChild>
                              <Link
                                href={`${item.href}?tab=${item.tab}` as any}
                                className={cn(
                                  "flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 group cursor-pointer",
                                  isSubActive
                                    ? "bg-primary/10 text-primary"
                                    : isTransparent
                                      ? "text-white/80 hover:text-white hover:bg-white/10"
                                      : "text-foreground/70 hover:text-foreground hover:bg-muted",
                                )}
                              >
                                <div
                                  className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                                    isSubActive
                                      ? "bg-primary text-white"
                                      : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-primary",
                                  )}
                                >
                                  <Icon className="h-4 w-4" />
                                </div>
                                <span className="text-sm font-semibold tracking-tight">
                                  {t(item.label)}
                                </span>
                              </Link>
                            </DropdownMenuItem>
                          );
                        })}
                        <div className="h-px bg-border/50 my-2 lg:hidden" />
                      </div>

                      {moreLinks.map((item) => {
                        const tabParam = searchParams.get("tab");
                        const isSubActive = tabParam
                          ? tabParam === item.tab
                          : pathname === item.href ||
                            (pathname === "/" &&
                              currentTab === item.label.toLowerCase());
                        const Icon = item.icon;
                        return (
                          <DropdownMenuItem key={item.tab} asChild>
                            <Link
                              href={`${item.href}?tab=${item.tab}` as any}
                              className={cn(
                                "flex items-center gap-3 rounded-xl p-2.5 transition-all duration-200 group cursor-pointer",
                                isSubActive
                                  ? "bg-primary/10 text-primary"
                                  : isTransparent
                                    ? "text-white/80 hover:text-white hover:bg-white/10"
                                    : "text-foreground/70 hover:text-foreground hover:bg-muted",
                              )}
                            >
                              <div
                                className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-lg transition-all",
                                  isSubActive
                                    ? "bg-primary text-white"
                                    : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-primary",
                                )}
                              >
                                <Icon className="h-4 w-4" />
                              </div>
                              <span className="text-sm font-semibold tracking-tight">
                                {t(item.label)}
                              </span>
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </div>
                  </div>

                  <div className="hidden lg:block w-[150px] bg-muted/20 border-l border-border/30 p-3">
                    <DropdownMenuItem asChild>
                      <Link
                        href={"/packages?tab=packages" as any}
                        className="group relative flex h-full flex-col overflow-hidden rounded-xl bg-background border border-border/40 transition-all hover:border-primary/20 hover:shadow-md cursor-pointer"
                      >
                        <div className="relative aspect-square overflow-hidden bg-slate-100">
                          <Image
                            src="/logos-banner-new.jpg"
                            alt={t("Featured")}
                            fill
                            className="object-cover p-0 transition-all duration-700 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-40" />
                        </div>
                        <div className="p-2.5">
                          <p className="text-[9px] font-bold uppercase tracking-widest text-primary mb-0.5">
                            {t("Featured")}
                          </p>
                          <p className="text-[10px] font-bold leading-[1.2] text-foreground line-clamp-2">
                            {t("Explore Top Bundles")}
                          </p>
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </nav>

          <div className="flex items-center gap-2">
            {fromCache && cachedAgoLabel && (
              <div
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 transition-all duration-300"
                title={t("Search results loaded instantly from cache")}
              >
                <Zap className="h-3 w-3 fill-amber-400 text-amber-500" />
                {/* <span className="hidden xl:inline">Instant</span>
                <span className="text-amber-500/70 hidden xl:inline font-normal">·</span>
                <span className="font-normal text-amber-600 dark:text-amber-500">
                  cached {cachedAgoLabel}
                </span> */}
              </div>
            )}
            {/* <Link
              href={"/fake-jetcost" as any}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-300 cursor-pointer",
                isTransparent
                  ? "bg-white/10 text-white hover:bg-white/20"
                  : "bg-background hover:bg-black",
              )}
            >
              <span>Jetcost</span>
            </Link> */}
            {/* <CurrencySelector isTransparent={isTransparent} /> */}
            <LanguageSelector isTransparent={isTransparent} />
            {/* <div className="hidden md:block">
              <button
                onClick={() => setIsAskEzeeOpen(true)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all cursor-pointer duration-300",
                  isTransparent
                    ? "text-white hover:text-redmix"
                    : "text-foreground hover:text-redmix",
                )}
              >
                Ask Ezee
              </button>
            </div> */}

            {/* {mounted && session && (
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
                        {unread && unread.count > 0 && (
                          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-redmix" />
                        )}
                      </div>
                    </button>
                  </Drawer.Trigger>
                  <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm" />
                    <Drawer.Content
                      className={cn(
                        "fixed bottom-0 left-0 right-0 z-[80] flex flex-col h-[80vh] overflow-hidden rounded-t-3xl border-t outline-none",
                        isScrolled
                          ? "bg-background/85 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-border/40"
                          : isTransparent
                            ? "bg-[#0e0e0e]/80 backdrop-blur-xl border-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                            : "bg-background/95 backdrop-blur-md border-transparent text-foreground",
                      )}
                    >
                      <Drawer.Title className="sr-only">
                        {t("Notifications")}
                      </Drawer.Title>
                      <div className="mx-auto mt-3.5 h-1.5 w-12 shrink-0 rounded-full bg-muted-foreground/30" />
                      <NotificationContent
                        isTransparent={isTransparent}
                        isMobile={true}
                      />
                    </Drawer.Content>
                  </Drawer.Portal>
                </Drawer.Root>
              </div>
            )} */}

            {/* wishlist */}

            {/* <div className="md:hidden">
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
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <div className="relative">
                      <Heart className="h-5 w-5" />
                      {wishlistCount > 0 && (
                        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 flex items-center justify-center rounded-full bg-redmix text-[8px] font-bold text-white shadow-sm animate-in zoom-in duration-300">
                          {wishlistCount}
                        </span>
                      )}
                    </div>
                  </button>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 z-[70] bg-black/45 backdrop-blur-sm" />
                  <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[80] overflow-hidden rounded-t-2xl border-t bg-background">
                    <Drawer.Title className="sr-only">Favorites</Drawer.Title>
                    <FavoriteContent isTransparent={isTransparent} />
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            </div> */}

            {/* {mounted && session && (
              <div className="hidden md:block">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={cn(
                        "rounded-lg p-2 transition cursor-pointer",
                        isTransparent
                          ? "text-white hover:bg-white/10 hover:text-white"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <div className="relative">
                        <Bell className="h-5 w-5" />
                        {unread && unread.count > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-redmix" />
                        )}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={10}
                    className={cn(
                      "w-auto min-w-[280px] p-0 overflow-hidden transition-all duration-500 rounded-md",
                      isScrolled
                        ? "bg-background/85 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] border-border/40"
                        : isTransparent
                          ? "bg-[#0e0e0e]/80 backdrop-blur-xl border-white/10 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
                          : "bg-background/95 backdrop-blur-md border-transparent",
                    )}
                  >
                    <NotificationContent isTransparent={isTransparent} />
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )} */}

            {/* <div className="hidden md:block">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "rounded-lg p-2 transition cursor-pointer",
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
                  className={cn(
                    "w-[360px] p-0 overflow-hidden transition-all duration-500",
                    isTransparent
                      ? "bg-white/15 dark:bg-black/20 backdrop-blur-2xl border-white/30 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2),inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                      : "bg-background",
                  )}
                >
                  <FavoriteContent isTransparent={isTransparent} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div> */}

            {/* currency selector */}
            {/* <CurrencySelector isTransparent={isTransparent} /> */}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "hidden rounded-lg p-2 cursor-pointer transition md:inline-flex",
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

            {mounted &&
              !isLoading &&
              (session ? (
                <div className="relative">
                  <button
                    ref={triggerRef}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={cn(
                      "hidden h-9 w-9 items-center justify-center cursor-pointer rounded-full border border-white/20 text-sm font-semibold text-redmix md:flex md:h-10 md:w-10",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {userInitial}
                  </button>
                  {isUserMenuOpen && (
                    <div
                      ref={menuRef}
                      className={cn(
                        "absolute right-0 top-full mt-3 w-44 p-1 overflow-hidden backdrop-blur-xl shadow-lg animate-in fade-in zoom-in-95 duration-150 rounded-md border",
                        isScrolled
                          ? "bg-background/85 border-border/40"
                          : isTransparent
                            ? "bg-[#0e0e0e]/80 border-white/10 text-white"
                            : "bg-background/95 border-transparent text-foreground",
                      )}
                      style={{ zIndex: 99999 }}
                    >
                      <button
                        className={cn(
                          "w-full text-left cursor-pointer rounded-md p-2 transition-colors text-sm",
                          isTransparent
                            ? "text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                            : "text-foreground hover:bg-muted focus:bg-muted focus:text-foreground",
                        )}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/profile" as any);
                        }}
                      >
                        {t("Profile")}
                      </button>
                      {isAdmin && !isAndroid() && (
                        <button
                          className={cn(
                            "w-full text-left cursor-pointer rounded-lg p-2 transition-colors text-sm",
                            isTransparent
                              ? "text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                              : "text-foreground hover:bg-muted focus:bg-muted focus:text-foreground",
                          )}
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            router.push("/dashboard?tab=cheap-bid" as any);
                          }}
                        >
                          {t("Cheap Bid")}
                        </button>
                      )}
                      {/* <button
                        className={cn(
                          "w-full text-left cursor-pointer rounded-lg p-2 transition-colors text-sm",
                          isTransparent
                            ? "text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                            : "text-foreground hover:bg-muted focus:bg-muted focus:text-foreground",
                        )}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/my-trips" as any);
                        }}
                      >
                        {t("My Trips")}
                      </button> */}
                      {/* <button
                        className={cn(
                          "w-full text-left cursor-pointer rounded-lg p-2 transition-colors text-sm",
                          isTransparent
                            ? "text-white hover:bg-white/10 hover:text-white focus:bg-white/10 focus:text-white"
                            : "text-foreground hover:bg-muted focus:bg-muted focus:text-foreground",
                        )}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          router.push("/wallet" as any);
                        }}
                      >
                        {t("Wallet")}
                      </button> */}
                      <button
                        className={cn(
                          "w-full text-left cursor-pointer rounded-lg p-2 transition-colors text-sm text-red-600 focus:text-red-600",
                          isTransparent
                            ? "hover:bg-white/10 focus:bg-white/10 focus:text-red-500"
                            : "hover:bg-muted focus:bg-muted focus:text-red-600",
                        )}
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                      >
                        {t("Sign out")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal("login")}
                  className={cn(
                    "rounded-full p-2.5 transition-all cursor-pointer duration-300 md:block hidden",
                    isTransparent
                      ? "text-white hover:bg-white/10 shadow-sm"
                      : "text-redmix hover:bg-redmix/10",
                  )}
                  aria-label={t("Sign in")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 15 17"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="account-button__icon h-5 w-5"
                  >
                    <path
                      className="account-button__icon-path"
                      d="M10.375 3.813a3.063 3.063 0 1 1-6.125 0 3.063 3.063 0 0 1 6.125 0"
                    />
                    <path
                      className="account-button__icon-path"
                      d="M0.75 15.625c.323-3.434 2.896-6.125 6.563-6.125s6.24 2.691 6.562 6.125"
                    />
                  </svg>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Profile Update Notification - Only show on home page (after mount to avoid hydration mismatch) */}
      {mounted &&
        !isProfileComplete &&
        !profileNotifyDismissed &&
        session &&
        pathname === "/" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="relative z-10 border-b border-redmix/30 bg-redmix/[0.03] backdrop-blur-sm overflow-hidden"
          >
            {/* Subtle animated background pulse */}
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-redmix/[0.05]"
            />

            <div className="relative mx-auto flex min-h-[2.5rem] max-w-screen-2xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
              <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Info
                      className={cn(
                        "h-4 w-4",
                        isTransparent
                          ? "text-white hover:bg-white/10 hover:text-white"
                          : "text-foreground hover:bg-muted",
                      )}
                    />
                    <motion.span
                      animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full bg-redmix/20"
                    />
                  </div>
                  <span
                    className={cn(
                      "font-semibold",
                      isTransparent
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {t("Profile Incomplete")}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-muted-foreground hidden md:inline",
                    isTransparent
                      ? "text-white hover:bg-white/10 hover:text-white"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {t(
                    "Complete your details to unlock faster bookings and personalized offers.",
                  )}
                </span>
                <Link
                  href={"/profile" as any}
                  className={cn(
                    "group flex items-center gap-1 font-bold text-redmix transition-colors hover:text-redmix/80",
                    isTransparent
                      ? "text-white hover:bg-white/10 hover:text-white"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  {t("Update Now")}
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>

              <button
                aria-label={t("Dismiss profile notification")}
                onClick={dismissProfileNotify}
                className="flex-shrink-0 rounded-full p-1.5 text-muted-foreground transition-all hover:bg-redmix/10 hover:text-redmix"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        )}

      {/* <AnimatePresence>
        {showLoginSuccess && (
          <LoginSuccessStrip onDismiss={() => setShowLoginSuccess(false)} />
        )}
      </AnimatePresence> */}

      {/* Promo Strip - Only on Homepage */}
      {/* {pathname === "/" && !isScrolled && !promoDismissed && (
        <div className="border-b border-brand-yellow/40 bg-brand-yellow/10">
          <div className="mx-auto flex min-h-[2.25rem] max-w-screen-2xl items-center justify-between gap-3 px-4 py-2 sm:h-9 sm:px-6 sm:py-0">
            <div className="flex flex-1 flex-wrap items-center gap-x-2 gap-y-0.5 text-xs leading-snug text-white xs:text-xs sm:text-sm">
              <span className="font-medium">
                <span className="inline md:hidden">
                  {t("🔥 Flash Deals: Up to 10% Off")}
                </span>
                <span className="hidden md:inline">
                  {t("🔥 Flash Deals Active. Save up to 10% this week")}
                </span>
              </span>
              <Link
                href={"/deals" as any}
                className="whitespace-nowrap font-bold text-white hover:underline"
              >
                {t("See Deals →")}
              </Link>
            </div>
            <button
              aria-label={t("Dismiss deals strip")}
              onClick={dismissPromo}
              className="flex-shrink-0 rounded-md p-1 text-muted-foreground transition hover:bg-brand-yellow/30 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )} */}

      <AskEzeeAi open={isAskEzeeOpen} onOpenChange={setIsAskEzeeOpen} />
    </header>
  );
}

export function Header(props: { transparent?: boolean }) {
  return (
    <React.Suspense fallback={null}>
      <HeaderContent {...props} />
    </React.Suspense>
  );
}
