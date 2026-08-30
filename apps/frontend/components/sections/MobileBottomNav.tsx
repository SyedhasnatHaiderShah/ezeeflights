"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Plane,
  Ticket,
  User,
  Menu,
  LayoutGrid,
  Mic,
  type LucideIcon,
  Building2,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { isNavPathActive } from "@/lib/auth/is-admin";
import { useIsAdmin } from "@/lib/hooks/use-is-admin";
import { useAuthSession } from "@/lib/hooks/use-auth-session";
import { useAuthModalStore } from "@/lib/store/use-auth-modal-store";
import { useSidebarStore } from "@/lib/store/sidebar-store";
import { useNavChromeSurface } from "@/lib/hooks/use-nav-chrome-surface";
import { useTranslation } from "react-i18next";
import {
  NAV_BOTTOM_HERO_GLASS,
  NAV_BOTTOM_SCROLLED,
} from "@/lib/constants/nav-chrome";
import { requestMicrophoneAccess } from "@/lib/capacitor";
import nextDynamic from "next/dynamic";

const AskEzeeAi = nextDynamic(
  () => import("@/components/ai/AskEzeeAi").then((m) => m.AskEzeeAi),
  { ssr: false },
);

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  requiresAuth?: boolean;
  isMenu?: boolean;
}

const navItems: NavItem[] = [
  { id: "home", label: "Home", href: "/", icon: Home },
  { id: "hotels", label: "Hotels", href: "/hotels", icon: Building2 },
  { id: "menu", label: "Menu", href: "#", icon: Menu, isMenu: true },
  {
    id: "cars",
    label: "Cars",
    href: "/cars",
    icon: Car,
  },
  {
    id: "profile",
    label: "Profile",
    href: "/profile",
    icon: User,
    requiresAuth: true,
  },
];

export function MobileBottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { data: session } = useAuthSession();
  const openAuthModal = useAuthModalStore((state) => state.open);
  const { open: openSidebar, isOpen: isSidebarOpen } = useSidebarStore();
  const { isHeroMode, useDarkChrome } = useNavChromeSurface();

  const isAdmin = useIsAdmin();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isRequestingMic, setIsRequestingMic] = React.useState(false);
  // Prevent hydration mismatch: server renders English labels, client translates after mount
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = async () => {
    if (isOpen) {
      setIsOpen(false);
      return;
    }

    setIsRequestingMic(true);
    try {
      const granted = await requestMicrophoneAccess({
        onGranted: () => setIsOpen(true),
      });
      if (granted) {
        setIsOpen(true);
      }
    } catch (err) {
      console.error("Microphone access failed:", err);
    } finally {
      setIsRequestingMic(false);
    }
  };

  const dynamicNavItems = React.useMemo(() => {
    return navItems.map((item) => {
      if (item.id === "profile") {
        return {
          ...item,
          id: "ask-ezee",
          label: "Ask Ezee",
          href: "#",
          icon: Mic,
        };
      }
      return item;
    });
  }, []);

  if (pathname?.startsWith("/auth")) {
    return null;
  }

  return (
    <>
      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out md:hidden pb-safe will-change-[background-color,border-color,backdrop-filter,box-shadow]",
          isHeroMode ? NAV_BOTTOM_HERO_GLASS : NAV_BOTTOM_SCROLLED,
        )}
      >
        <div className="grid h-[60px] grid-cols-5 px-2">
          {dynamicNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.isMenu
              ? isSidebarOpen
              : isNavPathActive(pathname, item.href);

            const content = (
              <div className="relative z-10 flex flex-col items-center justify-center gap-1 mt-1">
                <Icon
                  className={cn(
                    "h-[22px] w-[22px] transition-all duration-200",
                    active
                      ? useDarkChrome
                        ? "text-white"
                        : "text-redmix"
                      : useDarkChrome
                        ? "text-white/70"
                        : "text-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] tracking-wide transition-colors duration-200",
                    active
                      ? useDarkChrome
                        ? "text-white font-semibold"
                        : "text-redmix font-semibold"
                      : useDarkChrome
                        ? "text-white/70 font-medium"
                        : "text-foreground font-medium",
                  )}
                  suppressHydrationWarning
                >
                  {mounted ? t(item.label) : item.label}
                </span>
              </div>
            );

            if (item.isMenu) {
              return (
                <button
                  key={item.id}
                  onClick={openSidebar}
                  className="relative flex flex-col items-center justify-center"
                >
                  {content}
                </button>
              );
            }

            if (item.id === "ask-ezee") {
              return (
                <button
                  key={item.id}
                  onClick={handleToggle}
                  disabled={isRequestingMic}
                  className="relative flex flex-col items-center justify-center"
                >
                  {content}
                </button>
              );
            }

            if (item.requiresAuth && !session) {
              return (
                <button
                  key={item.id}
                  onClick={() => openAuthModal("login")}
                  className="relative flex flex-col items-center justify-center"
                >
                  {content}
                </button>
              );
            }

            return (
              <Link
                key={item.id}
                href={item.href as never}
                className="relative flex flex-col items-center justify-center"
              >
                {content}
              </Link>
            );
          })}
        </div>
      </motion.nav>
      <AskEzeeAi open={isOpen} onOpenChange={setIsOpen} autoStart={true} />
    </>
  );
}
