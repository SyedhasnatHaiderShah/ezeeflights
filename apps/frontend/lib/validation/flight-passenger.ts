import { differenceInYears, parseISO, isValid } from "date-fns";
import type { InquiryTraveler } from "@/lib/api/inquiries";

export type PassengerCategory = "adult" | "child" | "infant";

export type TravelerSlot = {
  type: PassengerCategory;
  /** 1-based index within that category, e.g. Adult 2 */
  indexInType: number;
  /** Global index in travelers array */
  globalIndex: number;
};

export const PASSENGER_AGE_RULES = {
  adult: { min: 12, label: "12+ years", ptc: "ADT" as const },
  child: { min: 2, max: 11, label: "2–11 years", ptc: "CHD" as const },
  infant: { max: 1, label: "Under 2 years", ptc: "INF" as const },
};

export function buildTravelerSlots(
  adults: number,
  children: number,
  infants: number,
): TravelerSlot[] {
  const slots: TravelerSlot[] = [];
  let globalIndex = 0;

  for (let i = 0; i < adults; i++) {
    slots.push({ type: "adult", indexInType: i + 1, globalIndex: globalIndex++ });
  }
  for (let i = 0; i < children; i++) {
    slots.push({ type: "child", indexInType: i + 1, globalIndex: globalIndex++ });
  }
  for (let i = 0; i < infants; i++) {
    slots.push({ type: "infant", indexInType: i + 1, globalIndex: globalIndex++ });
  }

  return slots;
}

export function getDepartReferenceDate(departDate?: string | null): Date {
  if (departDate) {
    const parsed = parseISO(departDate.includes("T") ? departDate : `${departDate}T12:00:00`);
    if (isValid(parsed)) return parsed;
  }
  return new Date();
}

export function getAgeAtTravel(dob: string, departDate?: string | null): number | null {
  if (!dob?.trim()) return null;
  const birth = parseISO(dob);
  if (!isValid(birth)) return null;
  const ref = getDepartReferenceDate(departDate);
  const age = differenceInYears(ref, birth);
  return Number.isFinite(age) ? Math.max(0, age) : null;
}

export function classifyPassengerByAge(age: number): PassengerCategory {
  if (age < 2) return "infant";
  if (age < 12) return "child";
  return "adult";
}

export function categoryMatchesAge(
  category: PassengerCategory,
  age: number,
): boolean {
  if (category === "infant") return age < 2;
  if (category === "child") return age >= 2 && age < 12;
  return age >= 12;
}

export function getSlotLabel(
  slot: TravelerSlot,
  t: (key: string, opts?: { defaultValue?: string }) => string,
): string {
  const typeLabels: Record<PassengerCategory, string> = {
    adult: t("Adult"),
    child: t("Child"),
    infant: t("Infant"),
  };
  return `${typeLabels[slot.type]} ${slot.indexInType}`;
}

export function getSlotAgeHint(
  slot: TravelerSlot,
  t: (key: string) => string,
): string {
  return t(PASSENGER_AGE_RULES[slot.type].label);
}

export type DobSlotValidation = {
  valid: boolean;
  age: number | null;
  classified: PassengerCategory | null;
  message?: string;
};

export function validateDobForSlot(
  dob: string | undefined,
  slotType: PassengerCategory,
  departDate?: string | null,
): DobSlotValidation {
  if (!dob?.trim()) {
    return { valid: true, age: null, classified: null };
  }

  const age = getAgeAtTravel(dob, departDate);
  if (age === null) {
    return {
      valid: false,
      age: null,
      classified: null,
      message: "Enter a valid date of birth.",
    };
  }

  const classified = classifyPassengerByAge(age);
  if (categoryMatchesAge(slotType, age)) {
    return { valid: true, age, classified };
  }

  const expected = PASSENGER_AGE_RULES[slotType].label;
  const actual = PASSENGER_AGE_RULES[classified].label;

  if (slotType === "infant" && classified !== "infant") {
    return {
      valid: false,
      age,
      classified,
      message: `Age ${age} at travel is not under 2 years. This traveler will count as a ${classified === "child" ? "child" : "adult"}, not an infant.`,
    };
  }
  if (slotType === "child" && classified !== "child") {
    return {
      valid: false,
      age,
      classified,
      message: `Age ${age} at travel does not match child (2–11 years). Expected ${actual}, not ${expected}.`,
    };
  }
  if (slotType === "adult" && classified !== "adult") {
    return {
      valid: false,
      age,
      classified,
      message: `Age ${age} at travel is under 12. This traveler will count as a ${classified === "infant" ? "infant" : "child"}, not an adult.`,
    };
  }

  return { valid: true, age, classified };
}

/** Suggest URL passenger counts after reclassifying one traveler by actual age. */
export function suggestCountsAfterReclassification(
  current: { adults: number; children: number; infants: number },
  slotType: PassengerCategory,
  classified: PassengerCategory,
): { adults: number; children: number; infants: number } {
  const next = { ...current };
  if (slotType === classified) return next;

  if (slotType === "infant") next.infants = Math.max(0, next.infants - 1);
  if (slotType === "child") next.children = Math.max(0, next.children - 1);
  if (slotType === "adult") {
    if (next.adults <= 1) {
      return current;
    }
    next.adults -= 1;
  }

  if (classified === "infant") next.infants += 1;
  if (classified === "child") next.children += 1;
  if (classified === "adult") next.adults += 1;

  if (next.adults < 1) next.adults = 1;
  if (next.infants > next.adults) {
    next.infants = next.adults;
  }

  return next;
}

export function remapTravelersForCounts(
  prevTravelers: InquiryTraveler[],
  oldSlots: TravelerSlot[],
  adults: number,
  children: number,
  infants: number,
  emptyTraveler: (slot: TravelerSlot) => InquiryTraveler,
): InquiryTraveler[] {
  const buckets: Record<PassengerCategory, InquiryTraveler[]> = {
    adult: [],
    child: [],
    infant: [],
  };

  oldSlots.forEach((slot, i) => {
    const row = prevTravelers[i];
    if (row) buckets[slot.type].push(row);
  });

  const newSlots = buildTravelerSlots(adults, children, infants);
  return newSlots.map((slot) => buckets[slot.type].shift() ?? emptyTraveler(slot));
}

export function countFilledDobMismatches(
  travelers: InquiryTraveler[],
  slots: TravelerSlot[],
  departDate?: string | null,
): number {
  return slots.reduce((n, slot) => {
    const traveler = travelers[slot.globalIndex];
    if (!traveler?.dob?.trim()) return n;
    const v = validateDobForSlot(traveler.dob, slot.type, departDate);
    return n + (v.valid ? 0 : 1);
  }, 0);
}
