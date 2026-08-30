'use client';

import { ShieldCheck, Calendar, Plane } from 'lucide-react';
import { MobileBottomNav } from '@/components/sections/MobileBottomNav';
import { MobileStatusBarSpacer } from '@/components/shared/MobileStatusBarSpacer';

export function MobileBookings() {
  const bookings = [
    {
      id: 'EZE-12345',
      type: 'Flight',
      title: 'Dubai to London',
      date: 'Dec 15, 2026',
      status: 'Confirmed',
      price: '$450',
    },
    {
      id: 'EZE-67890',
      type: 'Hotel',
      title: 'The Savoy, London',
      date: 'Dec 15 - 20, 2026',
      status: 'Pending',
      price: '$1,200',
    }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <MobileStatusBarSpacer />
      
      <header className="px-6 py-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">My Trips</h1>
        <p className="text-sm font-medium text-slate-500">Manage your active and past bookings</p>
      </header>

      <main className="flex-1 space-y-6 px-6 pb-32">
        <div className="flex gap-2">
          <button className="rounded-full bg-brand-red px-4 py-2 text-xs font-bold text-white shadow-lg shadow-brand-red/20">Upcoming</button>
          <button className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-400">Past</button>
          <button className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 dark:bg-slate-900 dark:text-slate-400">Cancelled</button>
        </div>

        <div className="space-y-4">
          {bookings.map((booking) => (
            <div 
              key={booking.id}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition-all active:scale-[0.98] dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800">
                    {booking.type === 'Flight' ? <Plane className="h-5 w-5 text-blue-500" /> : <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{booking.type}</p>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">{booking.title}</h4>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                  booking.status === 'Confirmed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                }`}>
                  {booking.status}
                </span>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Calendar className="h-3.5 w-3.5" />
                    {booking.date}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Amount</p>
                  <p className="text-sm font-black text-brand-red">{booking.price}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl bg-brand-blue p-6 text-white">
          <h5 className="font-bold">Need help with a trip?</h5>
          <p className="mt-1 text-xs text-white/70">Our support team is available 24/7 to assist you with cancellations or changes.</p>
          <button className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold backdrop-blur-md">Contact Support</button>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
