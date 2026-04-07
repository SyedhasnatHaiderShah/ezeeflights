import * as React from "react";
import { LucideIcon, LucideProps } from "lucide-react";

/**
 * Creates a brand icon component compatible with LucideIcon type.
 */
const createBrandIcon = (name: string, children: React.ReactNode): LucideIcon => {
  const Icon = React.forwardRef<SVGSVGElement, LucideProps>(
    ({ size = 24, strokeWidth = 2, color = "currentColor", ...props }, ref) => (
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
      >
        {children}
      </svg>
    )
  );
  Icon.displayName = name;
  return Icon as unknown as LucideIcon;
};

export const Facebook = createBrandIcon(
  "Facebook",
  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
);

export const Twitter = createBrandIcon(
  "Twitter",
  <path d="M22 4s-1 2.18-4.5 9c0 5.33-3.67 10-9 10C4 23 2 20 2 20c3.33 0 6-2 6-2-2.67-1-4-2.67-4-2.67 1 0 1.67-.33 1.67-.33-3-1.33-3.67-4-3.67-4 .92.5 1.75.5 1.75.5A4.74 4.74 0 0 1 1 7c0-1.33.33-2.67 1.33-3.67 3.33 4 8 5.67 10 6A4.67 4.67 0 0 1 12 5c0-2.67 2-4 4-4 1.33 0 2.33.67 3 1.67 1.33-.33 2.33-.67 2.33-.67-.33 1.33-1.33 2-1.33 2.33Z" />
);

export const Instagram = createBrandIcon(
  "Instagram",
  <>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </>
);

export const Linkedin = createBrandIcon(
  "Linkedin",
  <>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </>
);
