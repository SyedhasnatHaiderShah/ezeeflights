"use client";

import React from "react";
import SectionLayout, { CompanySection } from "@/components/sections/SectionLayout";
import { useTranslation } from "react-i18next";
import { MapPin, Phone } from "lucide-react";
import Image from "next/image";

interface Office {
  country: string;
  city: string;
  flagType: "image" | "svg";
  flagSrc?: string;
  flagSvg?: React.ReactNode;
  address: string[];
  phone: string;
  availability: string;
}

const officesData: Office[] = [
  {
    country: "United States",
    city: "San Francisco Office",
    flagType: "image",
    flagSrc: "/usa.png",
    address: [
      "945 Taraval Street,",
      "San Francisco, CA 94116,",
      "United States of America"
    ],
    phone: "+1-888-604-0198",
    availability: "24×7 Available"
  },
  {
    country: "United Arab Emirates",
    city: "Dubai Office",
    flagType: "image",
    flagSrc: "/ae.png",
    address: [
      "17th Floor 1703,",
      "Venture Zone Business Center,",
      "Fahidi Heights,",
      "Khalid Bin Al Waleed Street,",
      "Bur Dubai 44320, UAE"
    ],
    phone: "+971-04-254-3652",
    availability: "24×7 Available"
  },
  {
    country: "United Kingdom",
    city: "London Office",
    flagType: "image",
    flagSrc: "/uk.png",
    address: [
      "Office 874,",
      "182-184 High Street North,",
      "East Ham,",
      "London E6 2JA,",
      "United Kingdom"
    ],
    phone: "+44 02079938662",
    availability: "24×7 Available"
  },
  {
    country: "Canada",
    city: "Regional Offices",
    flagType: "image",
    flagSrc: "/ca.png",
    address: [
      "Suite 301, 6700 Century Ave, Mississauga, ON L5N 1V8, Canada",
      "500 St George Street Moncton, E1C 1Y3 Canada",
      "125 9 Avenue SE Calgary, Alberta T2G 0P6 Canada"
    ],
    phone: "+1-888-604-0198",
    availability: "24×7 Available"
  },
  {
    country: "India",
    city: "New Delhi Office",
    flagType: "image",
    flagSrc: "/india-flag.png",
    address: [
      "20A, 2nd Floor,",
      "Shivaji Marg Road,",
      "Moti Nagar, Najafgarh,",
      "New Delhi, Delhi 110015,",
      "India"
    ],
    phone: "+91-9289288689",
    availability: "24×7 Available"
  },
  {
    country: "Estonia",
    city: "Tallinn Office",
    flagType: "svg",
    flagSvg: (
      <svg viewBox="0 0 3 2" className="h-full w-full object-cover">
        <rect width="3" height="2" fill="#fff" />
        <rect width="3" height="0.67" fill="#0072B2" />
        <rect y="0.67" width="3" height="0.67" fill="#000" />
      </svg>
    ),
    address: [
      "Juhkentali 8,",
      "Kesklinna District,",
      "City of Tallinn,",
      "Harju County 10132,",
      "Estonia"
    ],
    phone: "+37-258830230",
    availability: "24×7 Available"
  },
  {
    country: "Turkey",
    city: "Istanbul Office",
    flagType: "image",
    flagSrc: "/turkey-flag.png",
    address: [
      "İÇERENKÖY MAH.,",
      "ÜSKÜDAR-İÇERENKÖY YOLU CAD.,",
      "ÖZIŞ OFIS ATAŞEHIR NO: 21,",
      "İÇ KAPI NO: 6,",
      "ATAŞEHİR / İSTANBUL"
    ],
    phone: "+90-5339475736",
    availability: "24×7 Available"
  },
  {
    country: "South Africa",
    city: "Trichardt Office",
    flagType: "svg",
    flagSvg: (
      <svg viewBox="0 0 9 6" className="h-full w-full object-cover">
        <path fill="#002395" d="M0 0h9v6H0z" />
        <path fill="#fff" d="M0 0h9v3H0z" />
        <path fill="#E23D28" d="M0 0h9v2H0z" />
        <path fill="#fff" d="M0 0l3 2h6v2H3z" />
        <path fill="#007C3C" d="M0 0l3 2h6v2H3L0 6z" />
        <path fill="#FFB612" d="M0 0l2.25 1.5L0 3z" />
        <path fill="#000" d="M0 0.45l1.57 1.05L0 2.55z" />
      </svg>
    ),
    address: [
      "4 Bekker Street,",
      "Trichardt,",
      "Mpumalanga 2300,",
      "South Africa"
    ],
    phone: "+1-8009358563",
    availability: "24×7 Available"
  }
];

export default function GlobalOfficesPage() {
  const { t } = useTranslation();

  return (
    <SectionLayout
      title={t("Our Global Offices")}
      subtitle={t("Reach out to our international support teams anytime — available 24×7.")}
      twoColumn={false}
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {officesData.map((office, idx) => (
          <CompanySection
            key={idx}
            className="flex flex-col justify-between p-5 md:p-6 transition-all duration-300 hover:shadow-md hover:border-redmix/20"
          >
            <div>
              {/* Flag & Country Info */}
              <div className="flex items-center gap-3 border-b border-border/50 pb-4 mb-4">
                <div className="h-8 w-12 shrink-0 overflow-hidden rounded-md border border-border shadow-sm flex items-center justify-center">
                  {office.flagType === "image" && office.flagSrc ? (
                    <Image
                      src={office.flagSrc}
                      alt={`${office.country} Flag`}
                      width={48}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    office.flagSvg
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground leading-tight">
                    {t(office.country)}
                  </h3>
                  <p className="text-[10px] text-muted-foreground">
                    {t(office.city)}
                  </p>
                </div>
              </div>

              {/* Address List */}
              <div className="flex gap-3 text-xs leading-relaxed text-foreground/80 mb-4">
                <MapPin className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="space-y-1">
                  {office.address.map((line, lineIdx) => (
                    <p key={lineIdx}>{t(line)}</p>
                  ))}
                </div>
              </div>
            </div>

            {/* Phone & Availability */}
            <div className="pt-4 border-t border-border/50">
              <div className="flex items-center gap-3 text-xs">
                <Phone className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                <div>
                  <a
                    href={`tel:${office.phone.replace(/[^0-9+]/g, "")}`}
                    className="font-bold text-foreground hover:text-redmix hover:underline transition-all"
                  >
                    {office.phone}
                  </a>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {t(office.availability)}
                  </p>
                </div>
              </div>
            </div>
          </CompanySection>
        ))}
      </div>
    </SectionLayout>
  );
}
