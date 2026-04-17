import Link from "next/link";
import { Apple, Facebook, Instagram, Linkedin, Play, Twitter, Youtube, type LucideIcon } from "lucide-react";
import EzeeFlightsLogo from "@/components/ezee-flights-logo";
import { cn } from "@/lib/utils";

const companyLinks = ["About Us", "Careers", "Press", "Blog", "Contact Us"];

const productLinks = [
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Cars", href: "/cars" },
  { label: "Packages", href: "/packages" },
  { label: "Insurance", href: "/insurance" },
  { label: "Transfers", href: "/transfers" },
];

const supportLinks = [
  "FAQ",
  "Help Center",
  "Track Booking",
  "Refunds Policy",
  "Terms of Service",
  "Privacy Policy",
];

const socialIcons = [Facebook, Instagram, Twitter, Linkedin, Youtube] as const;

function AppButton({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <button className="inline-flex w-full items-center gap-2 rounded-lg bg-black px-3 py-2 text-left text-white transition hover:opacity-90">
      <Icon className="h-4 w-4" />
      <div>
        <p className="text-[10px] text-white/70">Download on</p>
        <p className="text-sm font-semibold leading-tight">{label}</p>
      </div>
    </button>
  );
}

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto max-w-screen-2xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div className="space-y-4">
            <EzeeFlightsLogo isDarkMode={false} className="h-auto w-36" />
            <p className="text-sm text-muted-foreground">Your journey begins with us</p>
            <div className="flex items-center gap-2">
              {socialIcons.map((Icon, index) => (
                <a
                  key={`social-${index}`}
                  href="#"
                  aria-label="Social link"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-brand-red hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-muted-foreground transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Products</h3>
            <ul className="space-y-2">
              {productLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-foreground">Support</h3>
            <ul className="space-y-2">
              {supportLinks.map((label) => (
                <li key={label}>
                  <Link href="#" className="text-sm text-muted-foreground transition hover:text-foreground">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">Get the App</h3>
            <p className="text-sm text-muted-foreground">Download our app</p>
            <div className="space-y-2">
              <AppButton icon={Apple} label="App Store" />
              <AppButton icon={Play} label="Google Play" />
            </div>
            <span className="inline-flex rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              4.9★ · 100K+ Downloads
            </span>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-border pt-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© 2025 EzeeFlights. All rights reserved.</p>
          <p className={cn("text-center")}>Visa · Mastercard · Amex · PayPal · Stripe</p>
          <p className="text-right">🔒 SSL Secured</p>
        </div>
      </div>
    </footer>
  );
}
