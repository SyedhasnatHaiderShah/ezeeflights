'use client';

import { googleOAuthUrl } from '@/lib/api/auth-api';

export function OAuthButtons() {
  return (
    <div className="space-y-2 border-t border-slate-200 pt-4">
      <p className="text-center text-xs text-slate-500">Or continue with</p>
      <a
        className="block w-full rounded border border-slate-300 py-2 text-center text-sm font-medium text-slate-800 hover:bg-slate-50"
        href={googleOAuthUrl()}
      >
        Continue with Google
      </a>
      <p className="text-center text-xs text-slate-500">
        After Google, you are sent back to this app to finish sign-in (one-time code exchange).
      </p>
    </div>
  );
}
