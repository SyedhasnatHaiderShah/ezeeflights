"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Car,
  CircleHelp,
  Compass,
  Gift,
  HandHelping,
  Heart,
  Home,
  Hotel,
  MapPinned,
  PanelLeftClose,
  Plane,
  Shield,
  Sparkles,
  Ticket,
  User,
  Wallet,
  LayoutDashboard,
  LogIn,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { usePageScroll } from "@/lib/hooks/use-page-scroll";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { logoutRequest } from "@/lib/api/auth-api";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { NAVIGATION_GROUPS } from "@/lib/navigation";
import { FOOTER_LINK_SECTIONS } from "@/lib/footer-links";
import { CollapsibleLinkSections } from "@/components/shared/CollapsibleLinkSections";

export function AppSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { isOpen, close, open } = useSidebarStore();
  const { data: session } = useAuthSession();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);
  const queryClient = useQueryClient();

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

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [close]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      // Only close on click outside if we are on desktop
      if (window.innerWidth < 768) return;

      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        close();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", onClickOutside);
    }
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [close, isOpen]);

  const userName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    session?.email ||
    t("Traveler");
  const userInitial = (userName || "T").charAt(0).toUpperCase();
  const isDarkMode = mounted && theme === "dark";
  const isScrolled = usePageScroll(20);
  const isHomepage = pathname === "/";
  const isGlossy = isHomepage && !isScrolled;

  const navigateToRoute = React.useCallback(
    (href: Route) => {
      close();
      router.push(href);
    },
    [close, router],
  );

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {!isOpen && (
        <div
          className="fixed bottom-0 left-0 top-0 z-50 hidden w-3 cursor-pointer bg-transparent transition-colors hover:bg-gradient-to-r hover:from-black/5 hover:to-transparent md:block"
          onMouseEnter={open}
          aria-label={t("Open sidebar")}
        />
      )}

      <aside
        ref={sidebarRef}
        onMouseLeave={() => {
          if (window.innerWidth >= 768) {
            close();
          }
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-[150] hidden w-fit flex-col border-r shadow-2xl transition-all duration-300 md:flex",
          isGlossy
            ? "bg-black/60 backdrop-blur-xl border-white/10 text-white"
            : "bg-background border-border text-foreground",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div
          className={cn(
            "z-20 flex h-16 shrink-0 items-center justify-between border-b px-4 transition-all duration-300",
            isGlossy
              ? "bg-transparent border-white/10 text-white"
              : "bg-background border-border",
          )}
        >
          <Link href="/" onClick={close}>
            <EzeeFlightsLogo
              isDarkMode={isGlossy || (mounted && theme === "dark")}
              className="h-auto w-28"
            />
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={close}
            className="rounded-full md:hidden"
          >
            <PanelLeftClose className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 flex flex-col min-h-0 relative z-0">
          <div
            className={cn(
              "mb-2 rounded-md border transition-all duration-300",
              isGlossy
                ? "border-white/10 bg-white/5 text-white p-3"
                : "border-border/70 bg-card p-3",
            )}
          >
            {session ? (
              <div className="flex items-center gap-1">
                {/* <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 font-semibold text-brand-red">
                  {userInitial}
                </span> */}
                <div>
                  <p
                    className={cn(
                      "text-xs font-semibold transition-all duration-300",
                      isGlossy
                        ? "text-white hover:bg-white/10 hover:text-white"
                        : "text-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {userName}
                  </p>
                  {/* <span className="inline-flex rounded-full bg-brand-yellow/20 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                    Gold Member
                  </span> */}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  type="button"
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-brand-red px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-brand-red/90 active:scale-[0.98] cursor-pointer"
                  onClick={() => {
                    openAuthModal("login");
                    close();
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  {t("Sign in")}
                </button>
              </div>
            )}
          </div>

          <div className="space-y-5">
            {NAVIGATION_GROUPS.filter((g) => {
              if (g.title === "ADMIN") {
                return (
                  session?.roles?.some(
                    (role: string) => role.toLowerCase() === "admin",
                  ) ?? false
                );
              }
              return true;
            }).map((group) => (
              <div key={group.title}>
                <p
                  className={cn(
                    "mb-2 px-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300",
                    isGlossy ? "text-white/50" : "text-foreground",
                  )}
                >
                  {t(group.title)}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    if (item.requiresAuth && !session) {
                      return (
                        <li key={item.href}>
                          <button
                            onClick={() => {
                              openAuthModal("login");
                              close();
                            }}
                            className={cn(
                              "flex w-full items-center gap-1 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-300",
                              active
                                ? "bg-brand-red/10 text-brand-red font-semibold"
                                : isGlossy
                                  ? "text-white hover:bg-white/10 hover:text-white"
                                  : "text-foreground font-semibold hover:bg-muted hover:text-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            {t(item.label)}
                          </button>
                        </li>
                      );
                    }

                    return (
                      <li key={item.href}>
                        <button
                          type="button"
                          onClick={() => navigateToRoute(item.href)}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "flex w-full items-center gap-5 rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all duration-300",
                            active
                              ? "bg-brand-red/10 text-brand-red font-semibold"
                              : isGlossy
                                ? "text-white hover:bg-white/10 hover:text-white"
                                : "text-foreground font-semibold hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {t(item.label)}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            {/* <div
              className={cn(
                "space-y-2 border-t pt-4",
                isGlossy ? "border-white/10" : "border-border/60",
              )}
            >
              <CollapsibleLinkSections
                sections={FOOTER_LINK_SECTIONS}
                onLinkClick={close}
              />
            </div> */}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "flex w-full items-center justify-start gap-5 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-300",
                isGlossy
                  ? "text-white hover:bg-white/10 hover:text-white"
                  : "text-foreground font-semibold hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="flex items-center gap-1">
                {isDarkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                {/* {t("Theme")} */}
              </span>
              <span className="text-xs">
                {mounted ? (isDarkMode ? t("Dark") : t("Light")) : t("Theme")}
              </span>
            </button>
          </div>
        </div>

        {session && (
          <div
            className={cn(
              "z-20 mt-auto shrink-0 border-t p-3 transition-all duration-300",
              isGlossy
                ? "bg-transparent border-white/10"
                : "bg-background border-border",
            )}
          >
            <button
              onClick={handleLogout}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-300",
                isGlossy
                  ? "text-white hover:bg-white/10 hover:text-white"
                  : "text-redmix font-semibold hover:bg-muted hover:text-foreground",
              )}
            >
              <LogOut className="h-4 w-4" />
              {t("Sign Out")}
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
