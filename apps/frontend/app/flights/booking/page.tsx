'use client';

import { Check, Plane, Armchair, Package, LayoutGrid, CreditCard, ChevronRight, User as UserIcon, Info, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PassengerForm } from '@/components/flights/PassengerForm';
import { AncillarySelector } from '@/components/flights/SeatMap/AncillarySelector';
import { SeatMap } from '@/components/flights/SeatMap/SeatMap';
import { apiFetch } from '@/lib/api/client';
import { useBookingFlowStore } from '@/lib/store/booking-flow-store';
import { cn } from '@/lib/utils';
import { Header } from '@/components/sections/Header';
import { Progress } from '@/components/ui/Progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';

const steps = [
  { label: 'Travelers', icon: UserIcon },
  { label: 'Seats', icon: Armchair },
  { label: 'Extras', icon: Package },
  { label: 'Review', icon: LayoutGrid },
  { label: 'Payment', icon: CreditCard },
];

export default function BookingPage() {
  const router = useRouter();
  const selectedFlightIds = useBookingFlowStore((state) => state.selectedFlightIds);
  const setPassengersInStore = useBookingFlowStore((state) => state.setPassengers);
  const setBookingId = useBookingFlowStore((state) => state.setBookingId);
  const setSeat = useBookingFlowStore((state) => state.setSeat);
  const selectedSeats = useBookingFlowStore((state) => state.selectedSeats);
  const ancillaries = useBookingFlowStore((state) => state.ancillaries);
  const setAncillaries = useBookingFlowStore((state) => state.setAncillaries);

  const [passengers, setPassengers] = useState<{ fullName: string; passportNumber: string; seatNumber: string; type: 'ADULT' | 'CHILD' | 'INFANT' }[]>([{ fullName: '', passportNumber: '', seatNumber: '', type: 'ADULT' }]);
  const [bookingIdState, setBookingIdState] = useState<string>('');
  const [step, setStep] = useState(0);
  const [activePassengerIndex, setActivePassengerIndex] = useState(0);
  const [seatMap, setSeatMap] = useState<any | null>(null);
  const [ancillaryOptions, setAncillaryOptions] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [flightDetails, setFlightDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const firstFlight = selectedFlightIds[0];
  const seatTotal = useMemo(() => Object.values(selectedSeats).reduce((sum, v) => sum + v.price, 0), [selectedSeats]);
  const ancillaryTotal = useMemo(() => ancillaries.reduce((sum, a) => sum + a.quantity * a.unitPrice, 0), [ancillaries]);
  const progressValue = ((step + 1) / steps.length) * 100;

  useEffect(() => {
    if (selectedFlightIds.length === 0) {
      router.replace('/flights/search');
      return;
    }
    apiFetch(`/flights/${selectedFlightIds[0]}`).then(setFlightDetails).catch(() => setFlightDetails(null));
  }, [router, selectedFlightIds]);

  const nextStep = async () => {
    try {
        setError('');
        if (step === 0) {
            if (passengers.some(p => !p.fullName || !p.passportNumber)) throw new Error('Please fill all traveler details');
            setPassengersInStore(passengers);
            
            // Remove seatNumber if empty to avoid backend validation errors
            const cleanedPassengers = passengers.map(({ seatNumber, ...p }) => ({
                ...p,
                seatNumber: seatNumber || undefined
            }));

            const booking = await apiFetch<{ id: string }>('/bookings', {
                method: 'POST',
                body: JSON.stringify({ flightIds: selectedFlightIds, passengers: cleanedPassengers, paymentStatus: 'PENDING' }),
            });
            setBookingId(booking.id);
            setBookingIdState(booking.id);
            setSeatMap(await apiFetch<any>(`/flights/${firstFlight}/seat-map`));
        } else if (step === 1) {
            if (passengers.some((_, idx) => !selectedSeats[idx]?.seatCode)) throw new Error('Select seats for all passengers');
            for (const [idx, seat] of Object.entries(selectedSeats)) {
                const m = /^([0-9]+)([A-Z])$/.exec(seat.seatCode);
                if (!m) continue;
                await apiFetch(`/bookings/${bookingIdState}/seats`, {
                    method: 'POST',
                    body: JSON.stringify({ flightId: firstFlight, row: Number(m[1]), col: m[2], passengerIndex: Number(idx) }),
                });
            }
            setAncillaryOptions(await apiFetch<any[]>(`/flights/${firstFlight}/ancillaries`));
        } else if (step === 2) {
            await apiFetch(`/bookings/${bookingIdState}/ancillaries`, {
                method: 'POST',
                body: JSON.stringify({ items: ancillaries.map(x => ({ ancillaryId: x.ancillaryId, passengerIndex: x.passengerIndex, quantity: x.quantity })) }),
            });
        } else if (step === 4) {
            // AUTHORIZE PAYMENT
            const payment = await apiFetch<{ status: string; paymentId: string }>('/payments/initiate', {
                method: 'POST',
                body: JSON.stringify({
                    bookingId: bookingIdState,
                    provider: 'MOCK',
                    amount: flightDetails?.baseFare || 450,
                    currency: 'USD',
                    successUrl: window.location.origin + '/flights/booking/success',
                    failureUrl: window.location.origin + '/flights/booking/failure',
                }),
            });

            if (payment.status === 'SUCCESS' || (payment as any).redirectUrl) {
                // Success! Proceed to Step 5 (Confirmation)
                setStep(5);
                setLoading(false);
                return;
            }
            throw new Error('Payment authorization failed');
        }
        setStep(prev => prev + 1);
    } catch (e: any) {
        if (e.message?.includes('401') || e.status === 401) {
            setError('Your session has expired. Please log in again to continue your booking.');
        } else {
            setError(e.message || 'An unexpected error occurred. Please try again.');
        }
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white selection:bg-brand-red/30">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <img src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2000&auto=format&fit=crop" className="h-full w-full object-cover opacity-20 ken-burns" alt="sky" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-slate-950" />
      </div>

      <Header transparent />

      <main className="relative z-10 mx-auto max-w-[1400px] px-6 pt-32 pb-20">
        {/* Radix-based Progress & Modern Header */}
        <div className="mb-12 flex flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <h1 className="text-4xl font-black tracking-tight md:text-5xl lg:text-6xl uppercase italic">
                    {step === 5 ? 'Booking' : 'Checkout'} <span className="bg-gradient-to-r from-brand-red to-brand-yellow bg-clip-text text-transparent">{step === 5 ? 'Confirmed' : 'Process'}</span>
                </h1>
                {step < 5 && (
                    <p className="mt-2 text-white/40 font-medium">Step {step + 1} of {steps.length}: {steps[step].label}</p>
                )}
            </motion.div>

            {step < 5 && (
                <div className="w-full max-w-3xl px-4">
                    <Progress value={Math.min(progressValue, 100)} className="h-2 bg-white/5 border border-white/10" />
                    <div className="mt-6 flex justify-between">
                        {steps.map((s, i) => (
                            <div key={s.label} className={cn(
                                "flex flex-col items-center gap-2 transition-all duration-500",
                                i <= step ? "text-white" : "text-white/20"
                            )}>
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-xl border transition-all",
                                    i < step ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" :
                                    i === step ? "bg-brand-red border-brand-red text-white shadow-[0_0_20px_rgba(239,68,68,0.3)] scale-110" :
                                    "bg-white/5 border-white/10"
                                )}>
                                    {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Main Form Area with Framer Motion transitions */}
          <div className="space-y-8">
            <AnimatePresence mode="wait">
                <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                    {error && (
                        <div className="mb-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400 backdrop-blur-xl flex items-center gap-3">
                            <Info className="h-5 w-5" /> {error}
                        </div>
                    )}

                    {step === 0 && <PassengerForm passengers={passengers} setPassengers={setPassengers} />}

                    {step === 1 && seatMap && (
                        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
                            <h2 className="mb-6 text-2xl font-bold italic uppercase tracking-wider">Select Seating</h2>
                            <div className="mb-10 flex flex-wrap gap-2">
                                {passengers.map((p, i) => (
                                    <Button key={i} variant={activePassengerIndex === i ? "default" : "outline"} onClick={() => setActivePassengerIndex(i)} className={cn("rounded-full h-10 px-6", activePassengerIndex === i && "bg-brand-red")}>
                                        P{i+1}: {p.fullName || '---'}
                                    </Button>
                                ))}
                            </div>
                            <SeatMap seatMapData={seatMap.seatMapData} selectedSeat={selectedSeats[activePassengerIndex]?.seatCode} passengerIndex={activePassengerIndex} onSelect={(code, price) => setSeat(activePassengerIndex, code, price)} />
                        </div>
                    )}

                    {step === 2 && (
                        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
                            <h2 className="mb-6 text-2xl font-bold italic uppercase tracking-wider">Enhancements</h2>
                            <AncillarySelector passengers={passengers.length} options={ancillaryOptions} selected={ancillaries} onChange={setAncillaries} />
                        </div>
                    )}

                    {step === 3 && (
                        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl space-y-8">
                            <h2 className="text-2xl font-bold italic uppercase tracking-wider">Final Verification</h2>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Travelers</p>
                                    <p className="text-2xl font-black">{passengers.length}</p>
                                </div>
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Seats</p>
                                    <p className="text-2xl font-black">{Object.keys(selectedSeats).length}</p>
                                </div>
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-5 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Add-ons</p>
                                    <p className="text-2xl font-black">{ancillaries.length}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-12 backdrop-blur-3xl shadow-2xl text-center">
                            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <Check className="h-12 w-12" />
                            </div>
                            <h2 className="text-4xl font-black italic uppercase mb-4 tracking-tighter">Everything Set!</h2>
                            <p className="text-white/50 text-lg mb-10">Verify the summary and complete your secure payment.</p>
                            <Button 
                                onClick={nextStep} 
                                disabled={loading}
                                size="lg" 
                                className="w-full h-16 rounded-2xl bg-gradient-to-r from-brand-red to-brand-yellow text-xl font-black shadow-[0_10px_40px_rgba(239,68,68,0.3)] hover:brightness-110 transition-all"
                            >
                                {loading ? 'Authorizing...' : 'AUTHORIZE PAYMENT'}
                            </Button>
                        </div>
                    )}

                    {step === 5 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-12 md:p-20 border border-white/10 shadow-2xl text-center"
                        >
                            <div className="mb-8 flex justify-center">
                                <div className="h-32 w-32 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                                    <Check className="h-16 w-16 text-emerald-400" />
                                </div>
                            </div>
                            
                            <h2 className="text-5xl font-black text-white mb-6 tracking-tighter italic">BOOKING SECURED!</h2>
                            <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                                Welcome aboard. Your journey to <span className="text-white font-bold">{flightDetails?.destination}</span> has been confirmed.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 text-left max-w-2xl mx-auto">
                                <div className="bg-white/5 rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Reference</span>
                                    <span className="text-2xl font-black italic text-emerald-400">EZ-{bookingIdState?.substring(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="bg-white/5 rounded-3xl p-8 border border-white/5 hover:border-white/20 transition-all">
                                    <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-2">Total Paid</span>
                                    <span className="text-2xl font-black italic text-brand-yellow">${(Number(flightDetails?.baseFare || 0) * 1.12 + ancillaryTotal + seatTotal).toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 justify-center">
                                <Button
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                    className="px-10 py-8 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase italic tracking-widest transition-all border border-white/10"
                                >
                                    Manage My Trip
                                </Button>
                                <Button
                                    onClick={() => router.push('/')}
                                    className="px-10 py-8 bg-gradient-to-r from-brand-red to-brand-yellow text-white rounded-2xl font-black uppercase italic tracking-widest hover:shadow-[0_0_50px_rgba(255,50,50,0.4)] transition-all"
                                >
                                    Plan Next Adventure
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)} className="text-white/40 hover:text-white">
                    ← Back to Previous
                </Button>
                {step < 4 && (
                    <Button onClick={nextStep} className="h-14 px-10 rounded-2xl bg-brand-red font-bold shadow-xl shadow-brand-red/20 hover:scale-105 transition-transform">
                        {step === 3 ? 'Review Summary' : 'Save & Continue'} <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                )}
            </div>
          </div>

          {/* Sidebar Summary with Radix Accordion */}
          <aside className="space-y-6">
            <div className="sticky top-32 rounded-[2.5rem] border border-white/10 bg-white/10 p-8 backdrop-blur-3xl shadow-2xl">
              <h3 className="mb-6 text-xl font-black uppercase italic tracking-widest text-white/80">Flight Summary</h3>
              
              <div className="mb-8 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
                <img src={`https://www.kayak.com/rimg/provider-logos/airlines/v/${flightDetails?.airlineCode || 'XX'}.png`} className="h-10 w-10 object-contain" alt="airline" />
                <div>
                    <p className="font-black text-lg">{flightDetails?.origin || '---'} ✈ {flightDetails?.destination || '---'}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">{flightDetails?.departureAt ? new Date(flightDetails.departureAt).toLocaleDateString() : 'Loading...'}</p>
                </div>
              </div>

              <Accordion type="single" collapsible className="w-full space-y-2">
                <AccordionItem value="fare" className="border-b-0">
                  <AccordionTrigger className="text-sm text-white/60 hover:no-underline py-2">View Price Details</AccordionTrigger>
                  <AccordionContent className="text-sm space-y-3 pt-2 text-white/40">
                    <div className="flex justify-between"><span>Base Fare ({passengers.length}x)</span><span>${(Number(flightDetails?.baseFare || 0)).toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Taxes & Service Fees</span><span>${(Number(flightDetails?.baseFare || 0) * 0.12).toFixed(2)}</span></div>
                    {seatTotal > 0 && <div className="flex justify-between"><span>Reserved Seating</span><span>${seatTotal.toFixed(2)}</span></div>}
                    {ancillaryTotal > 0 && <div className="flex justify-between"><span>Added Services</span><span>${ancillaryTotal.toFixed(2)}</span></div>}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Grand Total</p>
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black italic tracking-tighter text-brand-red">
                        ${(Number(flightDetails?.baseFare || 0) * 1.12 + ancillaryTotal + seatTotal).toFixed(2)}
                    </span>
                    <span className="text-white/20 font-bold uppercase text-xs">USD</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-2">
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 text-[9px] text-white/40 text-center border border-white/5">
                    <ShieldCheckIcon className="h-4 w-4 mb-1 text-emerald-500" /> Secure SSL
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-white/5 text-[9px] text-white/40 text-center border border-white/5">
                    <ZapIcon className="h-4 w-4 mb-1 text-brand-yellow" /> Instant PNR
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function ShieldCheckIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>;
}

function ZapIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.71 13.43 3.42a1 1 0 0 1 1.64 1.05l-2.01 7.24a1 1 0 0 0 .96 1.29H19.5a1 1 0 0 1 .79 1.6l-9.43 11.3a1 1 0 0 1-1.64-1.05l2.01-7.24a1 1 0 0 0-.96-1.29H4.5a1 1 0 0 1-.79-1.6z"/></svg>;
}
