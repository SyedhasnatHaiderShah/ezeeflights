import type { UserDto } from '@/lib/api/users';

export function UserList({ users }: { users: UserDto[] | undefined }) {
  if (!users?.length) {
    return <p className="text-sm text-slate-500">No users yet.</p>;
  }

  return (
    <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
      {users.map((u) => (
        <li key={u.id} className="px-4 py-3">
          <span className="font-medium text-slate-900">{u.name}</span>
          <span className="text-slate-600"> — {u.email}</span>
          {u.role ? <span className="ml-2 text-xs text-slate-400">({u.role})</span> : null}
        </li>
      ))}
    </ul>
  );
}
