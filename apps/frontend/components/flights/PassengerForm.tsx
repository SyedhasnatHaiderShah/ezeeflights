'use client';

interface Passenger {
  fullName: string;
  passportNumber: string;
  seatNumber: string;
  type: 'ADULT' | 'CHILD' | 'INFANT';
}

export function PassengerForm({ passengers, setPassengers }: { passengers: Passenger[]; setPassengers: (p: Passenger[]) => void }) {
  return (
    <div className="space-y-3">
      {passengers.map((passenger, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 rounded border p-3 md:grid-cols-4">
          <input className="rounded border p-2" placeholder="Full Name" value={passenger.fullName}
            onChange={(e) => setPassengers(passengers.map((x, i) => i === index ? { ...x, fullName: e.target.value } : x))} />
          <input className="rounded border p-2" placeholder="Passport" value={passenger.passportNumber}
            onChange={(e) => setPassengers(passengers.map((x, i) => i === index ? { ...x, passportNumber: e.target.value } : x))} />
          <input className="rounded border p-2" placeholder="Seat" value={passenger.seatNumber}
            onChange={(e) => setPassengers(passengers.map((x, i) => i === index ? { ...x, seatNumber: e.target.value.toUpperCase() } : x))} />
          <select className="rounded border p-2" value={passenger.type}
            onChange={(e) => setPassengers(passengers.map((x, i) => i === index ? { ...x, type: e.target.value as Passenger['type'] } : x))}>
            <option>ADULT</option><option>CHILD</option><option>INFANT</option>
          </select>
        </div>
      ))}
    </div>
  );
}
