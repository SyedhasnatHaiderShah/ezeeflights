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
  Plane,
  Shield,
  Sparkles,
  Ticket,
  User,
  Wallet,
  LayoutDashboard,
  Calculator,
  Trophy,
} from "lucide-react";
import type { Route } from "next";
import React from "react";

export interface NavigationItem {
  label: string;
  href: Route;
  icon: React.ComponentType<{ className?: string }>;
  requiresAuth?: boolean;
}

export interface NavigationGroup {
  title: string;
  items: NavigationItem[];
}

export const NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    title: "DISCOVER",
    items: [
      { label: "Home", href: "/", icon: Home },
      {
        label: "Destinations",
        href: "/destinations" as Route,
        icon: MapPinned,
      },
      { label: "Deals", href: "/deals" as Route, icon: Sparkles },
      { label: "Experiences", href: "/experience" as Route, icon: Compass },
      {
        label: "Budget Planner",
        href: "/budget-planner" as Route,
        icon: Calculator,
      },
    ],
  },
  {
    title: "BOOK",
    items: [
      { label: "Flights", href: "/flights" as Route, icon: Plane },
      { label: "Hotels", href: "/hotels" as Route, icon: Hotel },
      { label: "Cars", href: "/cars" as Route, icon: Car },
      { label: "Transfers", href: "/transfers" as Route, icon: Car },
      { label: "Insurance", href: "/insurance" as Route, icon: Shield },
      { label: "Packages", href: "/packages" as Route, icon: Gift },
    ],
  },
  {
    title: "MY ACCOUNT",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard" as Route,
        icon: LayoutDashboard,
        requiresAuth: true,
      },
      {
        label: "My Trips",
        href: "/my-trips" as Route,
        icon: Ticket,
        requiresAuth: true,
      },
      {
        label: "Wallet",
        href: "/wallet" as Route,
        icon: Wallet,
        requiresAuth: true,
      },
      {
        label: "Rewards",
        href: "/rewards" as Route,
        icon: Trophy,
        requiresAuth: true,
      },
      {
        label: "Wishlist",
        href: "/wishlist" as Route,
        icon: Heart,
        requiresAuth: true,
      },
      {
        label: "Profile",
        href: "/profile" as Route,
        icon: User,
        requiresAuth: true,
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      { label: "Help", href: "/support" as Route, icon: HandHelping },
      {
        label: "My Tickets",
        href: "/support/tickets" as Route,
        icon: CircleHelp,
      },
    ],
  },
];
