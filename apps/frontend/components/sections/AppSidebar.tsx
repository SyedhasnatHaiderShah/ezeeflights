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
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { logoutRequest } from "@/lib/api/auth-api";
import { useQueryClient } from "@tanstack/react-query";

import { NAVIGATION_GROUPS } from "@/lib/navigation";

export function AppSidebar() {
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
    router.push("/");
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

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  const userName =
    [session?.firstName, session?.lastName].filter(Boolean).join(" ") ||
    session?.email ||
    "Traveler";
  const userInitial = userName.charAt(0).toUpperCase();
  const isDarkMode = mounted && theme === "dark";

  const navigateToRoute = React.useCallback(
    (href: Route) => {
      close();
      router.push(href);
    },
    [close, router],
  );

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
          aria-label="Open sidebar"
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
          "fixed inset-y-0 left-0 z-[150] hidden w-[300px] flex-col border-r bg-background shadow-2xl transition-transform duration-300 md:flex",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="z-20 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
          <Link href="/" onClick={close}>
            <EzeeFlightsLogo
              isDarkMode={mounted && theme === "dark"}
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

        <div className="flex-1 overflow-y-auto p-4 flex flex-col min-h-0 relative z-0">
          <div className="mb-6 rounded-md border border-border/70 bg-card">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-red/10 font-semibold text-brand-red">
                  {userInitial}
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
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
                  className="flex h-10 w-full items-center justify-center rounded-lg bg-brand-red px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-brand-red/90 active:scale-[0.98] cursor-pointer"
                  onClick={() => {
                    openAuthModal("login");
                    close();
                  }}
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign in
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {NAVIGATION_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                <ul className="space-y-1">
                  {group.items.map((item) => {
                    const active =
                      pathname === item.href ||
                      pathname?.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    if (item.href === "/profile" && !session) {
                      return (
                        <li key={item.href}>
                          <button
                            onClick={() => {
                              openAuthModal("login");
                              close();
                            }}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                              active
                                ? "bg-brand-red/10 text-brand-red"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            Profile
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
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                            active
                              ? "bg-brand-red/10 text-brand-red"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {item.label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <span className="flex items-center gap-3">
                {isDarkMode ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                Theme
              </span>
              <span className="text-xs">
                {mounted ? (isDarkMode ? "Dark" : "Light") : "Theme"}
              </span>
            </button>
          </div>
        </div>

        {session && (
          <div className="z-20 mt-auto shrink-0 border-t bg-background p-4">
            <div className="rounded-xl bg-muted/60 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Loyalty Points
                </p>
                <p className="text-sm font-semibold text-foreground">8,450</p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-red to-brand-red-light" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
