"use client";

import * as React from "react";
import SectionLayout, {
  CompanyHeading,
  CompanyProse,
  CompanySection,
} from "@/components/sections/SectionLayout";
import { useTranslation } from "react-i18next";
import { formatDomainText } from "@/lib/utils/domain";

export default function AboutUsPage() {
  const { t } = useTranslation();
  const [hostname, setHostname] = React.useState("");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setHostname(window.location.hostname);
    }
  }, []);

  const fd = (text: string) => formatDomainText(text, hostname, t);

  return (
    <SectionLayout
      title={t("About Us")}
      subtitle={fd(t("About Ezee Flights - Flights Booking USA"))}
      twoColumn={false}
    >
      <div className="h-full">
        <CompanySection className="space-y-4">
          <CompanyProse>
            {fd(
              t(
                "Ezee Flights and Ezeewellness operate under the same umbrella, delivering reliable travel services including affordable international flights and personalised itineraries.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "Ezee Flights - your gateway to seamless travel experiences! With a thriving base of 500 satisfied clients, Ezee Flights takes pride in delivering unparalleled service, making your travel dreams a reality.",
              ),
            )}
          </CompanyProse>

          <CompanyProse>
            {fd(
              t(
                "At Ezee Flights, we prioritise your journey above all else. Our dedicated team ensures that every aspect of your trip, from booking to landing, is effortlessly handled, providing convenience and peace of mind.",
              ),
            )}
          </CompanyProse>

          <div className="pt-2 space-y-3">
            <CompanyHeading className="mb-2">
              {fd(t("Why choose Ezee Flights?"))}
            </CompanyHeading>
            <CompanyProse>
              {fd(
                t(
                  "We specialise in crafting bespoke travel itineraries tailored to your preferences. Whether it's a luxurious getaway, a budget-friendly adventure, or a corporate trip, our personalised approach ensures that every journey is unique and unforgettable.",
                ),
              )}
            </CompanyProse>
            <CompanyProse>
              {fd(
                t(
                  "With our extensive network of partners and cutting-edge technology, finding the best deals on flights, accommodations, and experiences is expertise. At Ezee Flights, we don't just plan trips; we curate experiences that exceed expectations.",
                ),
              )}
            </CompanyProse>
          </div>

          <CompanyProse>
            {fd(
              t(
                "Experience travel with ease and confidence. Let Ezee Flights be your trusted companion in exploring the world. Join our league of satisfied clients and discover the true meaning of hassle-free travel.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "Explore, discover, and embark on your next adventure with Ezee Flights. Travel made simple, memorable, and truly remarkable.",
              ),
            )}
          </CompanyProse>
        </CompanySection>
      </div>
    </SectionLayout>
  );
}
