export interface HotelGuestInput {
  firstName: string;
  middleName?: string;
  lastName: string;
  age: number | string;
}

export function formatHotelGuestFullName(guest: {
  firstName: string;
  middleName?: string;
  lastName: string;
}): string {
  return [guest.firstName, guest.middleName, guest.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" ");
}

/** Guest is complete when first name, last name, and age are provided. */
export function isHotelGuestComplete(guest: HotelGuestInput): boolean {
  const firstName = guest.firstName?.trim();
  const lastName = guest.lastName?.trim();
  const ageNum = Number(guest.age);

  return Boolean(
    firstName &&
      lastName &&
      !Number.isNaN(ageNum) &&
      ageNum >= 0 &&
      ageNum <= 120,
  );
}
