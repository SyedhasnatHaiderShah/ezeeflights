import type { InquiryTraveler } from "@/lib/api/inquiries";
import type { PassengerCategory, TravelerSlot } from "@/lib/validation/flight-passenger";

/**
 * Pre-fills booking traveler forms for local QA.
 * - On by default in `next dev` (NODE_ENV=development)
 * - Off in production unless NEXT_PUBLIC_MOCK_TRAVELERS=true
 * - Disable locally: NEXT_PUBLIC_MOCK_TRAVELERS=false in .env.local
 */
export const MOCK_TRAVELERS_ENABLED =
  process.env.NEXT_PUBLIC_MOCK_TRAVELERS === "true" ||
  (process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_MOCK_TRAVELERS !== "false");

type MockProfile = {
  firstName: string;
  middleName?: string;
  lastName: string;
  dob: string;
  nationality: string;
  gender: string;
};

/** DOBs valid for departure ~2026: adults 12+, children 2–11, infants under 2 */
const ADULT_PROFILES: MockProfile[] = [
  {
    firstName: "Alex",
    middleName: "M",
    lastName: "Khan",
    dob: "1988-03-12",
    nationality: "Pakistan",
    gender: "MALE",
  },
  {
    firstName: "Sara",
    middleName: "J",
    lastName: "Ahmed",
    dob: "1992-07-22",
    nationality: "Pakistan",
    gender: "FEMALE",
  },
  {
    firstName: "Omar",
    lastName: "Hassan",
    dob: "1985-11-05",
    nationality: "United Arab Emirates",
    gender: "MALE",
  },
];

const CHILD_PROFILES: MockProfile[] = [
  {
    firstName: "Zain",
    lastName: "Khan",
    dob: "2016-09-14",
    nationality: "Pakistan",
    gender: "MALE",
  },
  {
    firstName: "Maya",
    lastName: "Ahmed",
    dob: "2019-04-02",
    nationality: "Pakistan",
    gender: "FEMALE",
  },
];

const INFANT_PROFILES: MockProfile[] = [
  {
    firstName: "Noah",
    lastName: "Khan",
    dob: "2025-02-10",
    nationality: "Pakistan",
    gender: "MALE",
  },
  {
    firstName: "Lina",
    lastName: "Ahmed",
    dob: "2025-08-01",
    nationality: "Pakistan",
    gender: "FEMALE",
  },
];

const BLANK_TRAVELER: InquiryTraveler = {
  firstName: "",
  middleName: "",
  lastName: "",
  dob: "",
  nationality: "",
  gender: "",
};

function profileForType(
  type: PassengerCategory,
  indexInType: number,
): MockProfile {
  const pool =
    type === "adult"
      ? ADULT_PROFILES
      : type === "child"
        ? CHILD_PROFILES
        : INFANT_PROFILES;
  return pool[(indexInType - 1) % pool.length];
}

/** New or empty traveler row — uses mock data when MOCK_TRAVELERS_ENABLED. */
export function createTravelerForSlot(slot?: TravelerSlot): InquiryTraveler {
  if (!MOCK_TRAVELERS_ENABLED) {
    return { ...BLANK_TRAVELER };
  }
  if (!slot) {
    return { ...ADULT_PROFILES[0] };
  }
  return { ...profileForType(slot.type, slot.indexInType) };
}

export function emptyTraveler(slot?: TravelerSlot): InquiryTraveler {
  return createTravelerForSlot(slot);
}

export function isBlankTraveler(t: InquiryTraveler | undefined): boolean {
  if (!t) return true;
  return (
    !t.firstName?.trim() &&
    !t.lastName?.trim() &&
    !t.dob?.trim() &&
    !t.gender?.trim()
  );
}

/** Optional mock contact for booking step QA */
export const MOCK_CONTACT = {
  email: "booking.test@ezeeflights.com",
  phone: "+923001234567",
};
