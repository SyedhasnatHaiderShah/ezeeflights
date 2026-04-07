import type { Metadata } from "next";
import { Inter, Noto_Sans } from "next/font/google";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { MobileBottomNav } from "@/components/sections/MobileBottomNav";
import { ThemeProvider } from "@/components/theme-provider";
import { AppSidebar } from "@/components/sections/AppSidebar";
import { Providers } from "@/components/shared/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoTabs = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.ezeeflights.com"),
  title: {
    default: "Ezee Flights | Premium Flight Booking & Aerospace Intelligence",
    template: "%s | Ezee Flights",
  },
  description:
    "Experience premium flight booking with AI-powered recommendations. Discover curated journeys, exclusive offers, and a modern approach to global travel.",
  keywords: [
    "flight booking",
    "premium flights",
    "cheap flights",
    "travel intelligence",
    "global travel",
    "ezee flights",
    "vacation deals",
    "airline tickets",
    "aero intelligence",
  ],
  authors: [{ name: "Ezeewellness" }],
  creator: "Ezeeflights",
  publisher: "Ezeeflights",
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
    url: "https://www.ezeeflights.com",
    title: "Ezee Flights | The Modern Navigator",
    description:
      "Experience premium flight booking with AI-powered recommendations. Your exclusive gateway to global destinations.",
    siteName: "Ezee Flights",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ezee Flights Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ezee Flights | The Modern Navigator",
    description: "Navigate the skies with premium, AI-curated flight bookings.",
    creator: "@ezeeflights",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};

// Proper viewport for mobile — viewport-fit=cover enables safe-area-inset-* CSS env vars on iOS
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable,
          notoTabs.variable,
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {/* Include the Providers for React Query, etc */}
          <Providers>
            {/* Include the Sidebar globally */}
            <AppSidebar />

            <div
              className="relative flex flex-col min-h-screen pb-16 md:pb-0"
            >
              {children}
              <MobileBottomNav />
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
