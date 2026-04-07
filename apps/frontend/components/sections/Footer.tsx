"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Phone, Mail, MapPin, Copy, Check } from "lucide-react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "@/components/ui/brand-icons";
import { AppIcon } from "@/components/ui/app-icon";

export function Footer() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Contact Us", href: "#" },
    { name: "Deals", href: "/deals" },
    { name: "Experience", href: "/experience" },
    { name: "Journeys", href: "/journeys" },
    { name: "Reviews", href: "/reviews" },
    { name: "Terms and conditions", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Cookie Policy", href: "#" },
    { name: "Transaction & Refund Policy", href: "#" },
    { name: "FAQ", href: "#" },
    { name: "Blog", href: "#" },
  ];

  const topAirlines = [
    "Alaska Airlines",
    "JetBlue Airlines",
    "Southwest Airlines",
    "Delta Airlines",
    "Aeromexico Airlines",
  ];

  const globalSites = [
    { name: "UK", flag: "/uk.png", href: "https://www.uk.ezeeflights.com/" },
    { name: "CA", flag: "/ca.png", href: "https://www.ezeeflights.ca/" },
    { name: "AE", flag: "/ae.png", href: "https://www.ezeeflights.ae/" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#" },
    { icon: Twitter, href: "#" },
    { icon: Instagram, href: "#" },
    { icon: Linkedin, href: "#" },
  ];

  return (
    <footer className="w-full bg-[#f9fafb] dark:bg-background pt-12 pb-8 px-6 md:px-12 border-t border-border mt-auto font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-10 mb-12">
          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="text-[#0d2353] dark:text-foreground text-lg font-bold font-display">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-[#4b5563] dark:text-muted-foreground hover:text-[#c52a28] transition-colors text-xs font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Airlines Column */}
          <div className="space-y-4">
            <h3 className="text-[#0d2353] dark:text-foreground text-lg font-bold font-display">
              Top Airlines
            </h3>
            <ul className="space-y-2">
              {topAirlines.map((airline) => (
                <li key={airline}>
                  <a
                    href="#"
                    className="text-[#4b5563] dark:text-muted-foreground hover:text-[#c52a28] transition-colors text-xs font-medium"
                  >
                    {airline}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-6">
            <h3 className="text-[#0d2353] dark:text-foreground text-lg font-bold font-display">
              Contact
            </h3>

            {/* USA Contact */}
            <div className="flex gap-4 items-start group">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-secondary/40 shadow-md overflow-hidden shrink-0 mt-0.5 relative">
                <Image
                  src="/usa.png"
                  alt="USA Flag"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 flex-grow">
                <p className="text-[#4b5563] dark:text-muted-foreground text-xs leading-tight font-medium">
                  945 Taraval Street, San Francisco, CA 94116 United States of
                  America
                </p>
                <div className="flex items-center gap-2 group/item">
                  <div className="flex items-center gap-2 text-[#4b5563] dark:text-muted-foreground hover:text-[#c52a28] transition-colors">
                    <AppIcon icon={Phone} className="w-8 h-8" />
                    <span className="text-xs font-bold">+1-888-604-0198</span>
                  </div>
                  <button
                    onClick={() => handleCopy("+1-888-604-0198", "usa-phone")}
                    className="p-1.5 rounded-md hover:bg-muted transition-all opacity-0 group-hover/item:opacity-100 active:scale-90"
                    title="Copy to clipboard"
                  >
                    {copiedId === "usa-phone" ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#6b7280] font-medium">
                  (24×7 Available)
                </p>
              </div>
            </div>

            {/* UAE Contact */}
            <div className="flex gap-4 items-start group">
              <div className="w-8 h-8 rounded-full bg-white dark:bg-secondary/40 shadow-md overflow-hidden shrink-0 mt-0.5 relative">
                <Image
                  src="/ae.png"
                  alt="UAE Flag"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-1 flex-grow">
                <p className="text-[#4b5563] dark:text-muted-foreground text-xs leading-tight font-medium">
                  17th floor 1703 Venture Zone Business Center Fahidi Heights
                  Khalid Bin Al Waleed Street Bur Dubai 44320
                </p>
                <div className="flex items-center gap-2 group/item">
                  <div className="flex items-center gap-2 text-[#4b5563] dark:text-muted-foreground hover:text-[#c52a28] transition-colors">
                    <AppIcon icon={Phone} className="w-8 h-8" />
                    <span className="text-xs font-bold">+971-04-254-3652</span>
                  </div>
                  <button
                    onClick={() => handleCopy("+971-04-254-3652", "uae-phone")}
                    className="p-1.5 rounded-md hover:bg-muted transition-all opacity-0 group-hover/item:opacity-100 active:scale-90"
                    title="Copy to clipboard"
                  >
                    {copiedId === "uae-phone" ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-[#6b7280] font-medium">
                  (24×7 Available)
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between group/email pt-2">
              <div className="flex items-center gap-3">
                <AppIcon icon={Mail} />
                <span className="text-xs font-bold tracking-tight text-[#4b5563] dark:text-muted-foreground group-hover/email:text-[#c52a28] transition-colors">
                  sales@ezeeflights.com
                </span>
              </div>
              <button
                onClick={() => handleCopy("sales@ezeeflights.com", "email")}
                className="p-1.5 rounded-md hover:bg-muted transition-all opacity-0 group-hover/email:opacity-100 active:scale-90"
                title="Copy to clipboard"
              >
                {copiedId === "email" ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>

          {/* Follow Us Column */}
          <div className="space-y-6">
            <h3 className="text-[#0d2353] dark:text-foreground text-lg font-bold font-display">
              Follow Us
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <AppIcon key={idx} icon={social.icon} asChild>
                  <a
                    href={social.href}
                    aria-label={`Follow us on ${social.icon.displayName || "social media"}`}
                  />
                </AppIcon>
              ))}
            </div>
          </div>
        </div>

        {/* Global Sites & Payment Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 py-8 border-t border-gray-200 dark:border-border">
          {/* Our Global Sites */}
          <div className="space-y-4">
            <h4 className="text-[#0d2353] dark:text-foreground text-lg font-bold font-display">
              Our Global Sites
            </h4>
            <div className="flex gap-4">
              {globalSites.map((site) => (
                <a
                  key={site.name}
                  href={site.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white dark:bg-secondary/40 shadow-md overflow-hidden hover:scale-110 hover:-translate-y-1 transition-all duration-300 relative"
                  title={`${site.name} Website`}
                >
                  <Image
                    src={site.flag}
                    alt={`${site.name} Flag`}
                    fill
                    className="object-cover"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* Trusted Logos Banner */}
          <div className="relative w-full max-w-2xl h-16 md:h-12 opacity-80 hover:opacity-100 transition-all duration-300 dark:invert dark:brightness-[1.2] dark:hue-rotate-180 dark:contrast-[1.1] dark:mix-blend-screen">
            <Image
              src="/logos-banner-new.jpg"
              alt="Payment & Trust Logos"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Description & Copyright */}
        <div className="pt-8 border-t border-gray-200 dark:border-border text-center space-y-4">
          <p className="text-xs text-[#4b5563] dark:text-muted-foreground leading-relaxed max-w-7xl mx-auto font-medium">
            Ezee Flights is an ISO 9001:2015 certified, world-leading platform
            for booking the cheapest flights online. With our lowest fare
            guarantee and unbeatable value, you can explore the world's most
            popular destinations within your budget! Ezee Flights provides
            trusted travel services worldwide, helping you discover new places
            with confidence and ease.
          </p>
          <p className="text-[#4b5563] dark:text-muted-foreground text-xs font-medium">
            Copyright ©{new Date().getFullYear()} Ezeeflights. All Rights
            Reserved. Ezeeflights is a part of Ezeewellness.
          </p>
        </div>
      </div>
    </footer>
  );
}
