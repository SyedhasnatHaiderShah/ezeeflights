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

export default function TermsAndConditionsPage() {
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
      title={t("Terms and conditions")}
      subtitle={fd(t("Ezee Flights Terms & Condition - Flights Booking UAE"))}
      twoColumn={false}
    >
      <CompanySection className="space-y-8 p-6 md:p-8">
        <div className="space-y-3">
          <CompanyProse>
            {fd(
              t(
                "Welcome to Ezee Flights Travel L.L.C. We are pleased to have you visit our website Ezee Flights. These Terms and Conditions outline the rules and guidelines that govern your use of our platform and services. We encourage you to read this information carefully to understand your rights and responsibilities while using our website. By continuing to browse or make bookings through our site, you acknowledge that you have read, understood, and agreed to the following terms.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Website Ownership and Purpose")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "This website is owned and managed by EZEE FLIGHTS TRAVEL L.L.C., a registered entity in the United Arab Emirates. We specialize in offering affordable international flight ticket bookings from the UAE to destinations around the world.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "Our goal is to provide a smooth, secure, and budget-friendly travel booking experience for all our valued customers.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>
            {t("Jurisdiction and Applicable Law")}
          </CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "The United Arab Emirates is our country of domicile, and all transactions, operations, and services provided through this website are subject to the laws of the UAE.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "Any purchase, dispute, or claim related to the use of this website shall be governed and interpreted in accordance with the laws of the UAE.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Eligibility to Use the Website")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "Our services are designed for individuals who are 18 years of age or older. We kindly request that individuals under 18 years of age refrain from registering, making transactions, or using our services. If you are under 18, we recommend using the site under the guidance of a parent or guardian.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Payment Terms")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "We accept payments via Visa and MasterCard debit and credit cards in AED (United Arab Emirates Dirham).",
              ),
            )}
          </CompanyProse>
          <CompanyList
            items={[
              t(
                "The price and currency displayed on the checkout page will be the same as what appears on your transaction receipt.",
              ),
              t(
                "The amount charged to your card will be reflected in your own card's currency based on your bank's conversion rates.",
              ),
              t(
                "All transactions are processed securely through trusted payment gateways to ensure your safety and privacy.",
              ),
            ].map((item) => fd(item))}
          />
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Sanctioned Countries")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "As per regulatory compliance, Ezee Flights does not offer services to, or conduct transactions with, countries and individuals sanctioned by the OFAC (Office of Foreign Assets Control). This policy helps us maintain international trade and security standards.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>
            {t("User Account and Confidentiality")}
          </CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "When creating an account on our website, we kindly request that you provide accurate information and keep your login credentials secure.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "Customers are responsible for maintaining the confidentiality of their account details and are encouraged to notify us immediately if any unauthorized activity is suspected. This helps us protect your personal data and booking history.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Record Keeping")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "We recommend that cardholders retain a copy of all transaction records, booking confirmations, and a copy of these Terms and Conditions for future reference. Our policies are readily accessible on our website for your convenience.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>
            {t("Pricing, Availability, and Updates")}
          </CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "All prices listed on our website are subject to availability and may change without prior notice due to airline or market fluctuations.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "While we strive to maintain accuracy across our listings, there may be instances where pricing errors or availability issues occur. In such cases, we will inform you promptly and work with you to confirm or cancel the booking, based on your preference.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Intellectual Property Rights")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "All content, design elements, and intellectual property found on Ezee Flights, including logos, images, text, and software, are the property of Ezee Flights Travel L.L.C. Unauthorized reproduction or use of any content is not permitted without prior written consent.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Limitation of Liability")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "While we make every effort to provide reliable and seamless service, Ezee Flights is not liable for any direct or indirect loss or inconvenience caused due to system issues, third-party service interruptions, or unforeseen circumstances beyond our control.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Get in Touch")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "If you have any questions, feedback, or concerns regarding these Terms and Conditions, our customer care team is here to help. Please contact us at:",
              ),
            )}
          </CompanyProse>
          <CompanyList
            items={[
              fd(t("Phone: +971-58-502-6849 (24×7 Available)")),
              fd(t("Email: sales@ezeeflights.com")),
            ]}
          />
        </div>
      </CompanySection>
    </SectionLayout>
  );
}
