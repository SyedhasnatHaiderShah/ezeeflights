'use client';

import { UserList } from '@/components/presentational/user-list';
import { useAuthSession } from '@/lib/hooks/use-auth-session';
import { useUsers } from '@/lib/hooks/use-users';

export function UsersContainer() {
  const session = useAuthSession();
  const { data, isLoading, error, isFetching } = useUsers(Boolean(session.data));

  if (session.isLoading) {
    return <p className="text-sm text-slate-500">Checking session…</p>;
  }

  if (!session.data) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Sign in to load the users list. Tokens stay in HttpOnly cookies on this origin.
      </p>
    );
  }

  if (isLoading) {
    return <p className="text-sm text-slate-500">Loading users…</p>;
  }

  if (error) {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Could not load users. You may need additional permissions or the API may be unavailable.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {isFetching && !isLoading ? (
        <p className="text-xs text-slate-400">Refreshing…</p>
      ) : null}
      <UserList users={data} />
    </div>
  );
}
