export function joinGuestFullName(guest: {
  firstName: string;
  middleName?: string;
  lastName: string;
}): string {
  return [guest.firstName, guest.middleName, guest.lastName]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(' ');
}
