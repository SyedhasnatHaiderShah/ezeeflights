import type { InquiryTraveler } from "@/lib/api/inquiries";
import {
  buildTravelerSlots,
  countFilledDobMismatches,
  validateDobForSlot,
  type TravelerSlot,
} from "@/lib/validation/flight-passenger";

const REQUIRED_FIELDS: { key: keyof InquiryTraveler; label: string }[] = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "dob", label: "Date of Birth" },
  { key: "gender", label: "Gender" },
];

function isEmpty(value: string | undefined): boolean {
  return !value?.trim();
}

/** Returns toast copy listing each traveler's missing or invalid fields. */
export function getTravelerValidationError(
  travelers: InquiryTraveler[],
  options?: {
    slots?: TravelerSlot[];
    departDate?: string | null;
    slotLabel?: (slot: TravelerSlot) => string;
  },
): {
  valid: boolean;
  title?: string;
  description?: string;
} {
  const lines: string[] = [];
  const slots =
    options?.slots ??
    buildTravelerSlots(
      Math.max(travelers.length, 1),
      0,
      0,
    );
  const labelFor = options?.slotLabel ?? ((s) => `Traveler ${s.globalIndex + 1}`);

  slots.forEach((slot) => {
    const traveler = travelers[slot.globalIndex];
    if (!traveler) return;

    const prefix = labelFor(slot);

    const missing = REQUIRED_FIELDS.filter(({ key }) =>
      isEmpty(traveler[key] as string | undefined),
    ).map(({ label }) => label);

    if (missing.length > 0) {
      lines.push(`${prefix}: ${missing.join(", ")}`);
      return;
    }

    const dobCheck = validateDobForSlot(
      traveler.dob,
      slot.type,
      options?.departDate,
    );
    if (!dobCheck.valid && dobCheck.message) {
      lines.push(`${prefix}: ${dobCheck.message}`);
    }
  });

  if (lines.length === 0) {
    return { valid: true };
  }

  const mismatchCount = options?.slots
    ? countFilledDobMismatches(travelers, slots, options.departDate)
    : 0;

  return {
    valid: false,
    title: "Incomplete traveler details",
    description:
      mismatchCount > 0
        ? `Please fix date of birth for each passenger type (adults 12+, children 2–11, infants under 2):\n${lines.map((l) => `• ${l}`).join("\n")}`
        : `Please complete the following:\n${lines.map((l) => `• ${l}`).join("\n")}`,
  };
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validates booking-level contact details (collected once, not per traveler). */
export function getContactValidationError(
  email: string,
  phone: string,
): {
  valid: boolean;
  title?: string;
  description?: string;
} {
  const missing: string[] = [];
  if (isEmpty(email)) missing.push("Email");
  if (isEmpty(phone)) missing.push("Phone Number");

  if (missing.length > 0) {
    return {
      valid: false,
      title: "Contact details required",
      description: `Please provide: ${missing.join(", ")}`,
    };
  }

  if (!EMAIL_PATTERN.test(email.trim())) {
    return {
      valid: false,
      title: "Invalid email",
      description: "Please enter a valid email address.",
    };
  }

  const digits = phone.replace(/\D/g, "");
  if (digits.length < 7) {
    return {
      valid: false,
      title: "Invalid phone number",
      description: "Please enter a valid phone number.",
    };
  }

  return { valid: true };
}
