const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "app/flights/booking/page.tsx");
let content = fs.readFileSync(filePath, "utf-8");

const replacements = [
  // Imports
  {
    from: `import { ChevronRight, Plane, Info, ShieldCheck, Clock, User as UserIcon, CalendarDays, ClipboardList, Check, Trash2 } from "lucide-react";`,
    to: `import { ChevronRight, Plane, Info, ShieldCheck, Clock, User as UserIcon, CalendarDays, ClipboardList, Check, Trash2 } from "lucide-react";\nimport { useTranslation } from "react-i18next";`
  },
  {
    from: `export default function BookingPage() {\n  return (\n    <Suspense\n      fallback={`,
    to: `export default function BookingPage() {\n  return (\n    <Suspense\n      fallback={`
  },
  {
    from: `function BookingPageContent() {\n  const searchParams = useSearchParams();`,
    to: `function BookingPageContent() {\n  const { t } = useTranslation();\n  const searchParams = useSearchParams();`
  },

  // Strings
  { from: `>Payment Simulator<`, to: `>{t("Payment Simulator")}<` },
  { from: `Sandbox mode</span>.\n                Simulate a successful payment to continue testing the booking\n                flow.`, to: `Sandbox mode</span>.\n                {t("Simulate a successful payment to continue testing the booking flow.")}` },
  { from: `>Cancel<`, to: `>{t("Cancel")}<` },
  { from: `>Simulate Payment<`, to: `>{t("Simulate Payment")}<` },
  { from: `>Complete your profile<`, to: `>{t("Complete your profile")}<` },
  { from: `>Add your passport and name to speed up booking.<`, to: `>{t("Add your passport and name to speed up booking.")}<` },
  { from: `>Edit Profile<`, to: `>{t("Edit Profile")}<` },
  { from: `>Booking <span className="text-foreground">Confirmed!</span>`, to: `>{t("Booking")} <span className="text-foreground">{t("Confirmed!")}</span>` },
  { from: `>Confirm <span className="text-redmix">Booking</span>`, to: `>{t("Confirm")} <span className="text-redmix">{t("Booking")}</span>` },
  { from: `>Please provide traveler information to complete your booking.<`, to: `>{t("Please provide traveler information to complete your booking.")}<` },
  { from: `Please fill in the details for{" "}`, to: `{t("Please fill in the details for")}{" "}` },
  { from: `traveler{travelers.length !== 1 ? "s" : ""}`, to: `{travelers.length !== 1 ? t("travelers") : t("traveler")}` },
  { from: `>Review Your Details<`, to: `>{t("Review Your Details")}<` },
  { from: `>Please verify your information before submitting to\n                            EzeeFlights.<`, to: `>{t("Please verify your information before submitting to EzeeFlights.")}<` },
  { from: `Passenger Information`, to: `{t("Passenger Information")}` },
  { from: `Selected Flight`, to: `{t("Selected Flight")}` },
  { from: `>Secure with Deposit<`, to: `>{t("Secure with Deposit")}<` },
  { from: `>Instant Confirmation<`, to: `>{t("Instant Confirmation")}<` },
  { from: `>To lock in this standby price, a fully refundable deposit is required. If your bid is not successful within 24 hours, the full amount will be credited back to your account.<`, to: `>{t("To lock in this standby price, a fully refundable deposit is required. If your bid is not successful within 24 hours, the full amount will be credited back to your account.")}<` },
  { from: `>Your booking is being confirmed instantly. No payment is required at this stage. Our EzeeFlights specialists will provide your e-ticket shortly.<`, to: `>{t("Your booking is being confirmed instantly. No payment is required at this stage. Our EzeeFlights specialists will provide your e-ticket shortly.")}<` },
  { from: `"Pay Deposit & Bid" : "Submit Booking"`, to: `t("Pay Deposit & Bid") : t("Submit Booking")` },
  { from: `Processing...`, to: `{t("Processing...")}` },
  { from: `>Ref Number<`, to: `>{t("Ref Number")}<` },
  { from: `>Flight Summary<`, to: `>{t("Flight Summary")}<` },
  { from: `Traveler\n                                  {travelers.length !== 1 ? "s" : ""}`, to: `{travelers.length !== 1 ? t("travelers") : t("traveler")}` },
  { from: `>Passenger Details<`, to: `>{t("Passenger Details")}<` },
  { from: `>Payment Summary<`, to: `>{t("Payment Summary")}<` },
  { from: `>Base Fare<`, to: `>{t("Base Fare")}<` },
  { from: `>Taxes & Fees<`, to: `>{t("Taxes & Fees")}<` },
  { from: `>Total Amount<`, to: `>{t("Total Amount")}<` },
  { from: `>Hotel Add-on Details<`, to: `>{t("Hotel Add-on Details")}<` },
  { from: `>Included in Trip<`, to: `>{t("Included in Trip")}<` },
  { from: `"Remove Hotel Add-on"`, to: `t("Remove Hotel Add-on")` },
  { from: `>Browse More Flights<`, to: `>{t("Browse More Flights")}<` },
  { from: `>View My Trip<`, to: `>{t("View My Trip")}<` }
];

replacements.forEach(r => {
  content = content.replace(r.from, r.to);
});

fs.writeFileSync(filePath, content, "utf-8");
console.log("Successfully updated flights/booking/page.tsx strings.");
