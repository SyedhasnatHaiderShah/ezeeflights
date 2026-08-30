import { COMPANY_LINKS } from "./company-links";

export { COMPANY_LINKS };

export type FooterLink = { label: string; href: string };

export const PRODUCT_LINKS: FooterLink[] = [
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Cars", href: "/cars" },
];

export const SUPPORT_LINKS: FooterLink[] = [
  { label: "FAQ", href: "/faq" },
  { label: "Contact Us", href: "/contact-us" },
  // { label: "Track Booking", href: "/my-trips" },
  { label: "Refunds Policy", href: "/transaction-and-refund-policy" },
  { label: "Terms and conditions", href: "/terms-and-conditions" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Cookie Policy", href: "/cookie-policy" },
];

export const FOOTER_LINK_SECTIONS = [
  { title: "Company", value: "company", links: COMPANY_LINKS },
  // { title: "Products", value: "products", links: PRODUCT_LINKS },
  { title: "Support", value: "support", links: SUPPORT_LINKS },
] as const;
