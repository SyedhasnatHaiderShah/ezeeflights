import Link from 'next/link';
import { LoginContainer } from '@/components/auth/login-container';

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md space-y-6 rounded-xl bg-white p-6 shadow">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Sessions use HttpOnly cookies on this site. State-changing API calls require a CSRF header (primed on load).
        </p>
      </div>
      <LoginContainer />
      <p className="text-center text-sm text-slate-600">
        No account?{' '}
        <Link className="font-medium text-blue-600 hover:underline" href="/register">
          Register
        </Link>
      </p>
    </section>
  );
}
