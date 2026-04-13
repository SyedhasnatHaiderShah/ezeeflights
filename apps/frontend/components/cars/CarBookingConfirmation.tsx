export function CarBookingConfirmation({ confirmationCode }: { confirmationCode: string }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
      <h3 className="text-lg font-semibold text-emerald-700">Booking confirmed</h3>
      <p className="text-sm text-emerald-800">Confirmation code: {confirmationCode}</p>
    </div>
  );
}
