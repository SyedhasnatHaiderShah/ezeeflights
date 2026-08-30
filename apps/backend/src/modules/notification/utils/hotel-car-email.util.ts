const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

const formatTime = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateStr;
  }
};

export function buildHotelEmailVariables(payload: Record<string, any>) {
  const checkInDate = formatDate(payload.checkInDate);
  const checkOutDate = formatDate(payload.checkOutDate);

  const displayTotalPrice = payload.displayTotalPrice ?? payload.totalPrice ?? '0.00';
  const displayCurrency = payload.displayCurrency ?? payload.currency ?? 'USD';
  const currencySymbol = payload.currencySymbol ?? (displayCurrency === 'USD' ? '$' : displayCurrency);
  const originalPriceNote = payload.originalPriceNote ?? '';

  return {
    checkInDate,
    checkOutDate,
    displayTotalPrice,
    displayCurrency,
    currencySymbol,
    originalPriceNote,
    hotelName: payload.hotelName ?? 'Hotel',
    guestNames: payload.guestNames ?? 'Guest',
    bookingRef: payload.bookingRef ?? '',
  };
}

export function buildCarEmailVariables(payload: Record<string, any>) {
  const pickupDate = formatDate(payload.pickupDatetime || payload.pickupDate);
  const pickupTime = formatTime(payload.pickupDatetime);
  const dropoffDate = formatDate(payload.dropoffDatetime || payload.dropoffDate);
  const dropoffTime = formatTime(payload.dropoffDatetime);

  const displayTotalPrice = payload.displayTotalPrice ?? payload.totalPrice ?? payload.estimatedTotalAmount ?? '0.00';
  const displayCurrency = payload.displayCurrency ?? payload.currency ?? 'USD';
  const currencySymbol = payload.currencySymbol ?? (displayCurrency === 'USD' ? '$' : displayCurrency);

  const pickupLocationName = payload.pickupLocationName ?? payload.pickupLocation ?? 'Pickup Location';
  const dropoffLocationName = payload.dropoffLocationName ?? payload.dropoffLocation ?? pickupLocationName;

  return {
    pickupDate: pickupTime ? `${pickupDate} at ${pickupTime}` : pickupDate,
    dropoffDate: dropoffTime ? `${dropoffDate} at ${dropoffTime}` : dropoffDate,
    pickUpDate: pickupDate,
    dropOffDate: dropoffDate,
    pickupLocationName,
    dropoffLocationName,
    displayTotalPrice,
    displayCurrency,
    currencySymbol,
    vehicleClass: payload.vehicleClass ?? payload.carName ?? 'Vehicle',
    driverName: payload.driverName ?? 'Driver',
    bookingRef: payload.bookingRef ?? '',
  };
}
