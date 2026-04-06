import Link from 'next/link';
import { TwoFactorContainer } from '@/components/auth/two-factor-container';

export default function TwoFactorPage() {
  return (
    <section className="mx-auto max-w-md space-y-6 rounded-xl bg-white p-6 shadow">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Two-factor verification</h1>
        <p className="mt-1 text-sm text-slate-600">Complete sign-in after password verification.</p>
      </div>
      <TwoFactorContainer />
      <p className="text-center text-sm text-slate-600">
        <Link className="text-blue-600 hover:underline" href="/login">
          Back to login
        </Link>
      </p>
    </section>
  );
}
