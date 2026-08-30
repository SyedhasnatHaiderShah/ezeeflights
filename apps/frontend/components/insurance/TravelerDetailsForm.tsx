export interface Traveler {
  name: string;
  dob: string;
  passport: string;
}

export function TravelerDetailsForm({ travelers, onChange }: { travelers: Traveler[]; onChange: (travelers: Traveler[]) => void }) {
  return (
    <div className="space-y-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Traveler details</h3>
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm"
          onClick={() => onChange([...travelers, { name: '', dob: '', passport: '' }])}
        >
          Add traveler
        </button>
      </div>
      {travelers.map((traveler, index) => (
        <div key={index} className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <input className="rounded border px-2 py-1" placeholder="Full name" value={traveler.name} onChange={(e) => onChange(travelers.map((item, i) => i === index ? { ...item, name: e.target.value } : item))} />
          <input className="rounded border px-2 py-1" type="date" value={traveler.dob} onChange={(e) => onChange(travelers.map((item, i) => i === index ? { ...item, dob: e.target.value } : item))} />
          <input className="rounded border px-2 py-1" placeholder="Passport no." value={traveler.passport} onChange={(e) => onChange(travelers.map((item, i) => i === index ? { ...item, passport: e.target.value } : item))} />
        </div>
      ))}
    </div>
  );
}
