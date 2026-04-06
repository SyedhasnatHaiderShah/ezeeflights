import Link from 'next/link';
import { RegisterContainer } from '@/components/auth/register-container';

export default function RegisterPage() {
  return (
    <section className="mx-auto max-w-md space-y-6 rounded-xl bg-white p-6 shadow">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Create account</h1>
        <p className="mt-1 text-sm text-slate-600">You will be assigned the customer role with default trip and booking permissions.</p>
      </div>
      <RegisterContainer />
      <p className="text-center text-sm text-slate-600">
        Already registered?{' '}
        <Link className="font-medium text-blue-600 hover:underline" href="/login">
          Sign in
        </Link>
      </p>
    </section>
  );
}
