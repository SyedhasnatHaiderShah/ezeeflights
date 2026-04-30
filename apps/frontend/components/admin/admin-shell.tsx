'use client';

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data: session, isLoading } = useAuthSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        router.replace('/auth/login');
      } else if (!session.roles.includes('ADMIN')) {
        setIsAuthorized(false);
      } else {
        setIsAuthorized(true);
      }
    }
  }, [session, isLoading, router]);

  if (isLoading || isAuthorized === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-red" />
          <p className="text-slate-500 font-medium tracking-tight">Verifying admin credentials...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized === false) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
        <div className="mb-6 rounded-full bg-red-50 p-6 text-red-600">
          <ShieldAlert className="h-16 w-16" />
        </div>
        <h1 className="mb-2 text-3xl font-black text-slate-900 tracking-tight">Access Denied</h1>
        <p className="mb-8 max-w-md text-slate-500 text-lg">
          You do not have the required permissions to access the administrative panel. 
          Please contact the system administrator if you believe this is an error.
        </p>
        <Button 
          onClick={() => router.push('/')}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-3 rounded-2xl transition-all"
        >
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      <div className="rounded-[2.5rem] bg-white border border-slate-100 p-8 shadow-xl shadow-slate-200/40">
        {children}
      </div>
    </div>
  );
}
