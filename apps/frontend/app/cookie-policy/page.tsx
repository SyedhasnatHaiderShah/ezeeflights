"use client";

import * as React from "react";
import SectionLayout, {
  CompanyHeading,
  CompanyList,
  CompanyProse,
  CompanySection,
} from "@/components/sections/SectionLayout";
import { useTranslation } from "react-i18next";
import { formatDomainText } from "@/lib/utils/domain";

export default function CookiePolicyPage() {
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
      title={t("Cookie Policy")}
      subtitle={fd(t("Ezee Flights Cookie Policy - Flights Booking UAE"))}
      twoColumn={false}
    >
      <CompanySection className="space-y-8 p-6 md:p-8">
        <div className="space-y-3">
          <CompanyProse>
            {fd(
              t(
                "At Ezee Flights Travel L.L.C., we are committed to protecting your privacy and ensuring transparency in how we use cookies and similar technologies. This Cookie Policy explains what cookies are, how we use them on Ezee Flights, and how you can manage your preferences.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("What Are Cookies?")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "Cookies are small text files that are stored on your computer or mobile device when you visit a website. These files collect data that helps enhance your browsing experience, such as remembering your login information, preferences, and booking details.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("How We Use Cookies")}</CompanyHeading>
          <CompanyProse>
            {fd(t("At Ezee Flights, we use cookies to:"))}
          </CompanyProse>
          <CompanyList
            items={[
              t("Ensure the website functions properly and securely"),
              t("Improve website performance and loading speed"),
              t("Analyze site traffic and usage patterns"),
              t("Remember your preferences for a more personalized experience"),
              t(
                "Assist with marketing and promotional efforts (e.g., showing relevant flight offers)",
              ),
            ]}
          />
          <CompanyProse>
            {fd(
              t(
                "Cookies help us improve our website and tailor it better to your needs, ensuring a seamless and user-friendly booking experience.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Types of Cookies We Use")}</CompanyHeading>
          <CompanyList
            items={[
              t(
                "Essential Cookies: These are required for the operation of our website, such as enabling secure logins or processing transactions.",
              ),
              t(
                "Performance Cookies: These help us understand how visitors interact with our website by collecting information anonymously.",
              ),
              t(
                "Functionality Cookies: These remember your preferences and settings, such as selected language or region.",
              ),
              t(
                "Marketing Cookies: These may be used to deliver relevant advertisements or offers based on your browsing behavior.",
              ),
            ]}
          />
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Third-Party Cookies")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "Some cookies on our site may be set by third-party services, such as analytics or advertising partners (e.g., Google Analytics). These cookies are governed by the respective privacy policies of those third parties.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "We do not control or access data collected by these external cookies.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Managing Cookies")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "You have the option to manage or disable cookies at any time through your browser settings. However, please note that disabling cookies may affect the functionality and user experience of our website, including the ability to make bookings.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                'To manage your cookie preferences, check your browser\'s "Settings" or "Privacy" section for guidance.',
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Changes to This Policy")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "This Cookie Policy may be updated from time to time to reflect changes in technology, law, or our business practices. We encourage you to revisit this page periodically to stay informed about how we use cookies.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Contact Us")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "If you have any questions or concerns about our Cookie Policy, please contact us at:",
              ),
            )}
          </CompanyProse>
          <CompanyList
            items={[
              fd(t("Phone: +971-58-502-6849")),
              fd(t("Email: sales@ezeeflights.com")),
            ]}
          />
        </div>
      </CompanySection>
    </SectionLayout>
  );
}
