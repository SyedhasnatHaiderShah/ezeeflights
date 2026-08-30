"use client";

import { useEffect, useState } from "react";
import { LoaderUI } from "./global-loader";
import { AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function InitialAppLoader() {
  const [show, setShow] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // Only show the initial app loader on the home page or destination pages
    if (pathname !== "/" && !pathname.startsWith("/destinations")) {
      setShow(false);
      return;
    }

    const handleReady = () => setShow(false);
    window.addEventListener("hero-ready", handleReady);

    // Fallback: hide after 3 seconds just in case the event never fires
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => {
      window.removeEventListener("hero-ready", handleReady);
      clearTimeout(timer);
    };
  }, [pathname]);

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && <LoaderUI message="Welcome to Ezee Flights..." />}
    </AnimatePresence>
  );
}
