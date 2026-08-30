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

export default function PrivacyPolicyPage() {
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
      title={t("Privacy Policy")}
      subtitle={fd(t("Ezee Flights Privacy Policy - Flights Booking UAE"))}
      twoColumn={false}
    >
      <CompanySection className="space-y-8 p-6 md:p-8">
        <div className="space-y-3">
          <CompanyProse>
            {fd(
              t(
                "At Ezee Flights Travel L.L.C., we value your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains how we handle, process, and protect your data when you visit or make transactions on Ezee Flights.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "By using our website, you agree to the practices described in this policy.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Information Security")}</CompanyHeading>
          <CompanyProse>
            {fd(t("We want to assure our customers that:"))}
          </CompanyProse>
          <CompanyList
            items={[
              t(
                "All credit/debit card details and personally identifiable information will NOT be stored, sold, shared, rented, or leased to any third parties.",
              ),
              t(
                "Ezee Flights will not pass any debit/credit card details to third parties.",
              ),
            ].map((item) => fd(item))}
          />
          <CompanyProse>
            {fd(
              t(
                "We take appropriate measures to safeguard your personal and payment information using a combination of secure technologies, encrypted protocols, firewalls, and access controls. Our payment systems are compliant with industry standards to ensure your data remains confidential and protected.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "However, while we strive to implement high levels of data security, we cannot guarantee the security of any information that is disclosed online. Users are advised to take all necessary precautions when accessing or submitting personal data over the internet.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Third-Party Websites")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "Our website may contain links to other websites for your convenience and reference. Please note that Ezee Flights is not responsible for the privacy practices or content of these external sites. If you choose to provide personal information to any third-party site, different rules regarding their collection and use of your information may apply.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "We recommend that you review the privacy policies of any external websites you visit. If you have questions about how they use your data, you should contact them directly.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Updates to This Policy")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "The Website Policies and Terms & Conditions may be updated or changed occasionally to align with evolving legal, technical, or business requirements.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "We encourage our customers to frequently review this section of the website to stay informed of any updates.",
              ),
            )}
          </CompanyProse>
          <CompanyProse>
            {fd(
              t(
                "Modifications will become effective on the date they are published on Ezee Flights.",
              ),
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Contact Us")}</CompanyHeading>
          <CompanyProse>
            {fd(
              t(
                "For questions or concerns regarding this Privacy Policy or your personal data, please contact:",
              ),
            )}
          </CompanyProse>
          <CompanyList
            items={[
              fd(t("Ezeeflights.ae")),
              fd(t("Email: privacy@ezeeflights.com")),
              fd(t("Phone: +971-58-502-6849")),
            ]}
          />
        </div>
      </CompanySection>
    </SectionLayout>
  );
}
