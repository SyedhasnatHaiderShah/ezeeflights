import { UsersContainer } from '@/components/containers/users-container';

export default function UsersPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Users</h1>
        <p className="mt-1 text-sm text-slate-600">
          Authenticated listing from <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">GET /v1/users</code>
        </p>
      </div>
      <UsersContainer />
    </section>
  );
}
