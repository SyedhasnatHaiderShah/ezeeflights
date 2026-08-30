import type { Metadata } from "next";
import "@/lib/dom-patch";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { Providers } from "@/components/shared/providers";
import { Toaster } from "@/components/ui/toaster";
import { CorrelationProvider } from "@/lib/correlation/correlation-context";
import { I18nProvider } from "@/components/shared/I18nProvider";
import { GlobalLoader } from "@/components/shared/global-loader";
import nextDynamic from "next/dynamic";

const MobileBottomNav = nextDynamic(() =>
  import("@/components/sections/MobileBottomNav").then(
    (m) => m.MobileBottomNav,
  ),
);
const AppSidebar = nextDynamic(() =>
  import("@/components/sections/AppSidebar").then((m) => m.AppSidebar),
);
const MobileMenuDrawer = nextDynamic(() =>
  import("@/components/sections/MobileMenuDrawer").then(
    (m) => m.MobileMenuDrawer,
  ),
);

const inter = { variable: "font-inter" };
const notoTabs = { variable: "font-noto" };

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ezeeflights.com"),
  title: {
    default:
      "Affordable Flights & Budget-Friendly Airfare Deals - Ezee Flights",
    template: "%s | Ezee Flights",
  },
  description:
    "Book affordable flights and budget-friendly airfare deals with Ezee Flights. Compare domestic & international flights to Dubai, Riyadh, London, New York & more with AI-powered recommendations and exclusive offers.",
  keywords: [
    // Core product
    "book cheap flights online",
    "best flight deals",
    "compare airfare prices",
    "cheap airline tickets",
    "last minute flights",
    "international flight booking",
    "domestic flights",
    "round trip flights",
    "one way flights",
    "flight search engine",

    // Brand
    "ezee flights",
    "ezeeflights",
    "ezee flights booking",

    // High-volume destinations from Pakistan
    "cheap flights to dubai",
    "cheap flights to sharjah",
    "cheap flights to abu dhabi",
    "cheap flights to riyadh",
    "cheap flights to jeddah",
    "cheap flights to dammam",
    "cheap flights to medina",
    "cheap flights to doha",
    "cheap flights to muscat",
    "cheap flights to kuwait city",
    "cheap flights to bahrain",

    // International high-volume
    "cheap flights to london",
    "cheap flights to toronto",
    "cheap flights to new york",
    "cheap flights to manchester",
    "cheap flights to birmingham",

    // Departure market
    "flights from karachi",
    "flights from lahore",
    "flights from delhi",
    "flights from india",
    "flights from pakistan",
    "pakistan to uk flights",
    "pakistan to canada flights",
    "pakistan to usa flights",

    // Intent-based
    "lowest airfare guarantee",
    "flight ticket price check",
    "online flight reservation",
    "travel deals 2025",
    "affordable flights",
    "budget airline tickets",
    "flight booking website pakistan",
  ],
  authors: [{ name: "Ezee Flights", url: "https://www.ezeeflights.com" }],
  creator: "Ezee Flights",
  publisher: "Ezee Flights",
  category: "Travel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB", "en_PK", "ar_AE", "ar_SA"],
    url: "https://www.ezeeflights.com",
    title: "Ezee Flights | Book Cheap Flights & Compare Airfare Deals",
    description:
      "Find and book the cheapest flights online. Compare hundreds of airlines and travel sites to get the best deal on your next flight domestic or international with AI-powered recommendations and exclusive offers.",
    siteName: "Ezee Flights",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ezee Flights – Book Cheap Flights Online",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ezee Flights | Cheap Flights & Best Airfare Deals",
    description:
      "Compare & book cheap flights online. Best prices on international & domestic airline tickets. Search, compare, save with Ezee Flights.",
    creator: "@ezeeflights",
    site: "@ezeeflights",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://www.ezeeflights.com",
    languages: {
      "en-US": "https://www.ezeeflights.com",
      "en-GB": "https://www.ezeeflights.com/en-gb",
      "ar-AE": "https://www.ezeeflights.com/ar",
    },
  },
  verification: {
    google: "YOUR_GOOGLE_SEARCH_CONSOLE_TOKEN",
    // yandex: "YOUR_YANDEX_TOKEN",
    // bing: "YOUR_BING_WEBMASTER_TOKEN",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      dir="ltr"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className="overflow-x-hidden"
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                if (typeof window !== 'undefined' && typeof Node !== 'undefined') {
                  var origRemove = Node.prototype.removeChild;
                  Node.prototype.removeChild = function(child) {
                    if (child && child.parentNode !== this) {
                      if (child.parentNode) {
                        return child.parentNode.removeChild(child);
                      }
                      return child;
                    }
                    return origRemove.apply(this, arguments);
                  };
                  var origInsert = Node.prototype.insertBefore;
                  Node.prototype.insertBefore = function(newNode, refNode) {
                    if (refNode && refNode.parentNode !== this) {
                      if (refNode.parentNode) {
                        return refNode.parentNode.insertBefore(newNode, refNode);
                      }
                      return origInsert.call(this, newNode, null);
                    }
                    return origInsert.apply(this, arguments);
                  };
                }
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          "min-h-screen w-full max-w-full touch-pan-y bg-background font-sans antialiased",
          inter.variable,
          notoTabs.variable,
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          <I18nProvider>
            <CorrelationProvider sessionId="">
              <Providers>
                {/* <AppSidebar /> */}
                <MobileMenuDrawer />

                <div className="native-app-shell relative flex min-h-screen w-full max-w-full flex-col">
                  {children}
                  <MobileBottomNav />
                </div>
                <Toaster />
                {/* <InitialAppLoader /> */}
                <GlobalLoader />
              </Providers>
            </CorrelationProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
