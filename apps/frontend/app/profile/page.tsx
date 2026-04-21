'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { Footer } from '@/components/sections/Footer';
import { Header } from '@/components/sections/Header';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { TravelerList } from '@/components/profile/TravelerList';
import { Switch } from '@/components/ui/switch';

export default function ProfilePage() {
  const session = useAuthSession();
  const [activeTab, setActiveTab] = useState('personal');
  const profile = useQuery({ queryKey: ['profile-me'], queryFn: () => apiFetch<any>('/profile/me'), enabled: !!session.data });

  if (!session.data) return <div className="min-h-screen bg-background flex flex-col"><Header /><main className="flex-grow flex items-center justify-center"><p className="rounded-xl border bg-amber-50 p-6">Sign in required to view your profile.</p></main><Footer /></div>;
  if (profile.isLoading) return <div className="min-h-screen bg-background flex flex-col"><Header /><main className="max-w-6xl mx-auto w-full py-12 px-4 space-y-4"><Skeleton className="h-44 w-full rounded-2xl" /><Skeleton className="h-[420px] w-full rounded-2xl" /></main><Footer /></div>;

  const p = profile.data?.profile ?? {};
  const name = p.firstName ? `${p.firstName} ${p.lastName || ''}`.trim() : `${session.data.firstName || ''} ${session.data.lastName || ''}`.trim() || 'Traveler';
  const email = p.email || session.data.email || '';

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden h-fit rounded-2xl border bg-card p-5 lg:block">
          <button className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-redmix text-2xl font-bold text-white">{name.charAt(0)}</button>
          <h2 className="mt-4 text-center text-xl font-bold">{name}</h2>
          <p className="text-center text-sm text-muted-foreground">{email}</p>
          <p className="mx-auto mt-3 w-fit rounded-full bg-brand-yellow px-3 py-1 text-xs font-semibold text-brand-dark-blue">Gold Member</p>
          <p className="mt-2 text-center text-xs text-muted-foreground">Member since 2023</p>
          <nav className="mt-5 space-y-1 text-sm">
            {[['personal','Personal Info'],['travelers','My Travelers'],['payment','Payment Methods'],['notifications','Notifications'],['security','Security']].map(([key,label]) => (
              <button key={key} onClick={() => setActiveTab(key)} className={`w-full rounded-lg px-3 py-2 text-left ${activeTab===key?'bg-redmix/10 text-redmix':'hover:bg-muted'}`}>{label}</button>
            ))}
          </nav>
        </aside>

        <section className="rounded-2xl border bg-card p-4 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-5 h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0 lg:hidden">
              <TabsTrigger value="personal">Personal</TabsTrigger><TabsTrigger value="travelers">Travelers</TabsTrigger><TabsTrigger value="payment">Payment</TabsTrigger><TabsTrigger value="notifications">Notifications</TabsTrigger><TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>
            <TabsContent value="personal"><ProfileForm initial={p} onSave={(payload) => apiFetch('/profile/me', { method: 'PATCH', body: JSON.stringify(payload) })} /></TabsContent>
            <TabsContent value="travelers"><div className="space-y-4"><div className="flex items-center justify-between"><h3 className="text-lg font-semibold">My Travelers</h3><button className="rounded-lg bg-redmix px-3 py-2 text-sm text-white">Add Traveler</button></div><TravelerList travelers={p.travelers ?? []} onDelete={(id) => apiFetch(`/travelers/${id}`, { method: 'DELETE' })} /></div></TabsContent>
            <TabsContent value="payment"><div className="grid gap-3 sm:grid-cols-2">{[{n:'4242',e:'12/28'},{n:'1881',e:'04/27'}].map((c) => <div key={c.n} className="rounded-xl border p-4"><p className="text-sm">💳 •••• {c.n}</p><p className="text-xs text-muted-foreground">Exp {c.e}</p></div>)}<button className="rounded-xl border border-dashed p-4 text-sm text-redmix">+ Add Card</button></div></TabsContent>
            <TabsContent value="notifications"><div className="grid gap-4 sm:grid-cols-2">{['Flight updates','Price alerts','Promotional offers','Email','SMS','Push'].map((label) => <label key={label} className="flex items-center justify-between rounded-xl border p-3 text-sm"><span>{label}</span><Switch defaultChecked /></label>)}</div></TabsContent>
            <TabsContent value="security"><div className="space-y-4"><h3 className="text-lg font-semibold">Change password</h3><div className="grid gap-3"><input className="rounded-lg border p-2" placeholder="Current password" type="password" /><input className="rounded-lg border p-2" placeholder="New password" type="password" /></div><label className="flex items-center justify-between rounded-xl border p-3"><span className="text-sm">Two-factor authentication</span><Switch /></label><div className="rounded-xl border p-3"><p className="font-medium">Active sessions</p><table className="mt-2 w-full text-sm"><tbody><tr className="border-t"><td className="py-2">Chrome • New York</td><td className="py-2 text-right">Current</td></tr><tr className="border-t"><td className="py-2">iPhone • Dubai</td><td className="py-2 text-right"><button className="text-redmix">Revoke</button></td></tr></tbody></table></div></div></TabsContent>
          </Tabs>
        </section>
      </main>
      <Footer />
    </div>
  );
}
