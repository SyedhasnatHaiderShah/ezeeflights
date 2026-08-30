"use client";

import SectionLayout, {
  CompanyHeading,
  CompanyList,
  CompanyProse,
  CompanySection,
} from "@/components/sections/SectionLayout";
import { useTranslation } from "react-i18next";

export default function TransactionAndRefundPolicyPage() {
  const { t } = useTranslation();

  return (
    <SectionLayout
      title={t("Transaction & Refund Policy")}
      subtitle={t(
        "Ezee Flights Transaction & Refund Policy - Flights Booking UAE",
      )}
      twoColumn={false}
    >
      <CompanySection className="space-y-8 p-6 md:p-8">
        <div className="space-y-3">
          <CompanyProse>
            {t(
              "At Ezee Flights Travel L.L.C., we believe in providing a transparent and reliable experience for all our customers. This section outlines our policies regarding payment confirmations, cancellations, refunds, and pricing details.",
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Payment Confirmation")}</CompanyHeading>
          <CompanyProse>
            {t(
              "Once a payment is successfully completed, a confirmation notice will be sent to the customer via email within 24 hours of receipt.",
            )}
          </CompanyProse>
          <CompanyProse>
            {t(
              "Please ensure that the email address provided at the time of booking is accurate and accessible. If you do not receive your confirmation within the stated timeframe, we recommend checking your spam or junk folder, or contacting our customer support team at sales@ezeeflights.com for assistance.",
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Refund Policy")}</CompanyHeading>
          <CompanyProse>
            {t(
              "We understand that changes in travel plans may occur. Our refund process is designed to be clear and efficient.",
            )}
          </CompanyProse>
          <CompanyList
            items={[
              t(
                "Refunds will be processed only through the original mode of payment.",
              ),
              t(
                "The time required to complete a refund depends on the issuing bank of the credit card and may take between 10 to 45 days.",
              ),
              t(
                "Refund eligibility is subject to airline fare rules and ticket conditions at the time of booking.",
              ),
            ]}
          />
          <CompanyProse>
            {t(
              "Please note that certain promotional or discounted fares may be non-refundable. In such cases, this condition will be clearly displayed during the booking process.",
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Cancellation Policy")}</CompanyHeading>
          <CompanyProse>
            {t(
              "Customers may cancel their order or requested service within 24 hours of the booking, provided the flight ticket has not yet been issued or confirmed.",
            )}
          </CompanyProse>
          <CompanyList
            items={[
              t(
                "Cancellations must be requested in writing or through our customer support.",
              ),
              t(
                "Refunds will be processed to the original payment method and may take up to 45 days to reflect in the customer's account, depending on their issuing bank.",
              ),
            ]}
          />
          <CompanyProse>
            {t(
              "In cases where the ticket is non-refundable or non-cancellable, this will be clearly mentioned before completing the purchase to ensure informed decisions and avoid disputes.",
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Pricing and Description")}</CompanyHeading>
          <CompanyProse>
            {t(
              "All fares listed on Ezee Flights are displayed in AED (United Arab Emirates Dirham) and are inclusive of applicable taxes and service charges, unless stated otherwise.",
            )}
          </CompanyProse>
          <CompanyList
            items={[
              t(
                "The price and currency shown on the checkout page will match the final amount printed on the transaction receipt.",
              ),
              t(
                "The amount charged to your card will appear in your card's currency based on your bank's exchange rate.",
              ),
            ]}
          />
          <CompanyProse>
            {t(
              "We strive to maintain accurate and up-to-date information on flight availability, descriptions, and pricing. However, should any errors occur, we reserve the right to correct them and will notify you as needed before confirming your booking.",
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyProse className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm">
            {t(
              "Note: In compliance with international regulations, we do not accept payments from or allow bookings to the following sanctioned countries: Iran, Cuba, North Korea, Sudan, South Sudan, Ukraine, Syria, Russian Federation, Myanmar, and Yemen. These countries have been removed from the checkout page dropdown list.",
            )}
          </CompanyProse>
          <CompanyProse>
            {t(
              "If you have any questions about our payment, cancellation, refund, or pricing policies, please contact us at sales@ezeeflights.com. We are here to help you have a smooth travel experience.",
            )}
          </CompanyProse>
        </div>

        <div className="space-y-3">
          <CompanyHeading>{t("Contact Us")}</CompanyHeading>
          <CompanyList
            items={[
              t(
                "For questions or concerns regarding this Transaction & Refund Policy or your personal data, please contact:",
              ),
              t("Phone: +971-58-502-6849"),
            ]}
          />
        </div>
      </CompanySection>
    </SectionLayout>
  );
}
