export const COMPANY_LINKS = [
  { label: "About Us", href: "/about-us" },
  // { label: "Contact Us", href: "/contact-us" },
  { label: "Our Global Offices", href: "/our-global-offices" },
  // { label: "Privacy Policy", href: "/privacy-policy" },
  // { label: "Terms and conditions", href: "/terms-and-conditions" },
  // { label: "Cookie Policy", href: "/cookie-policy" },
  // {
  //   label: "Transaction & Refund Policy",
  //   href: "/transaction-and-refund-policy",
  // },
  // { label: "Blog", href: "/blog" },
  { label: "Flights", href: "/flights" },
  { label: "Hotels", href: "/hotels" },
  { label: "Cars", href: "/cars" },
] as const;

export type CompanyLink = (typeof COMPANY_LINKS)[number];
