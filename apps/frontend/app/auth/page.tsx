import { redirect } from 'next/navigation';

/** Legacy route: use `/login` for the full auth UI (JWT, cookies, OAuth link). */
export default function AuthLegacyRedirect() {
  redirect('/login');
}
