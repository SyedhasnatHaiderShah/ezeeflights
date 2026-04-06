"use client"

import * as React from "react"
import {
  Phone,
  UserCircle,
  Menu,
  X,
  Globe,
  Heart,
  Briefcase,
  Sparkles,
  Sun,
  Moon
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
// @ts-ignore
import logo from "@/public/logo.svg"
import Link from "next/link"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  // @ts-ignore
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { AppImage } from "@/components/ui/app-image"

interface NavLink {
  href: string;
  label: string;
}

const NAV_LINKS: NavLink[] = [
  { href: "/flights", label: "Flights" },
  { href: "/stays", label: "Stays" },
  { href: "/cars", label: "Cars" },
  { href: "/packages", label: "Packages" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = React.useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 border-b",
        isScrolled
          ? "h-16 bg-background shadow-md border-brand-gray"
          : "h-20 bg-background/95 backdrop-blur-sm border-transparent"
      )}
    >
      <div className="flex justify-between items-center h-full px-4 md:px-6 max-w-full mx-auto">
        {/* Left Side: Hamburger & Logo */}
        <div className="flex items-center gap-6">
          <Dialog>
            <DialogTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-md transition-colors">
                <Menu className="w-5 h-5 text-foreground" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xs h-full top-0 left-0 translate-x-0 translate-y-0 rounded-none p-0 border-none">
              <div className="flex flex-col h-full bg-background">
                <div className="flex items-center justify-between p-4 border-b">
                  <DialogTitle className="sr-only">Menu</DialogTitle>
                  <DialogDescription className="sr-only">Navigational links for easy flights</DialogDescription>
                  <Link href="/" className="flex gap-0.5 group">
                    <AppImage src={logo} alt="Logo" className="w-24 h-auto" width={100} height={40} />
                  </Link>
                </div>
                <div className="flex flex-col p-4 gap-4">
                  {NAV_LINKS.map(link => (
                    <Link
                      key={link.label}
                      href={link.href as any}
                      className="text-lg font-bold text-foreground py-2 border-b border-muted last:border-0"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="mt-auto p-4 border-t bg-muted space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold opacity-60">Currency</span>
                    <span className="text-sm font-bold">USD</span>
                  </div>
                  <Button variant="brand-red" className="w-full font-bold h-12">
                    Sign in
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Link href="/" className="flex items-center gap-0.5 group">
            <AppImage src={logo} alt="Logo" className="w-32 h-auto" width={128} height={40} priority />
          </Link>
        </div>

        {/* Right Side: Utils & Auth */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Favorites Heart */}
          <button className="p-2 hover:bg-muted rounded-full transition-colors text-brand-blue/70 hover:text-brand-blue dark:text-brand-red-light/70 dark:hover:text-brand-red-light">
            <Heart className="w-5 h-5" />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-muted rounded-full transition-colors text-brand-blue/70 hover:text-brand-blue dark:text-brand-red-light/70 dark:hover:text-brand-red-light"
            aria-label="Toggle theme"
          >
            {mounted && (theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
            {!mounted && <Sun className="w-5 h-5 opacity-0" />}
          </button>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center cursor-pointer gap-2 p-0.5 hover:ring-2 hover:ring-brand-gray transition-all rounded-full">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-brand-red flex items-center justify-center border border-brand-red">
                  <UserCircle className="w-8 h-8 flex items-center justify-center text-white" />
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="font-semibold">Sign in</DropdownMenuItem>
              <DropdownMenuItem>Trips</DropdownMenuItem>
              <div className="h-[1px] bg-brand-gray my-1" />
              <DropdownMenuItem>Preferences</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
