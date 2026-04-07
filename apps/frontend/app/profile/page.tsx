'use client';

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { ProfileForm } from '@/components/profile/ProfileForm';

export default function ProfilePage() {
  const session = useAuthSession();
  const profile = useQuery({ queryKey: ['profile-me'], queryFn: () => apiFetch<any>('/profile/me'), enabled: !!session.data });

  if (!session.data) return <p className="rounded border bg-amber-50 p-4">Sign in required.</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <ProfileForm
        initial={profile.data?.profile}
        onSave={async (payload) => {
          await apiFetch('/profile/update', { method: 'PUT', body: JSON.stringify(payload) });
          await profile.refetch();
        }}
      />
      <div className="rounded border bg-white p-4">
        <h2 className="font-semibold">Travel History</h2>
        <ul className="space-y-1 text-sm">
          {profile.data?.travelHistory?.map((b: any) => <li key={b.id}>{b.id} · {b.status} · {b.currency} {b.totalAmount}</li>)}
        </ul>
      </div>
    </section>
  );
}
