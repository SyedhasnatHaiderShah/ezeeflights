type SessionLike = {
  roles?: string[] | string;
  permissions?: string[] | string;
  legacyRole?: string;
  role?: string;
} | null | undefined;

const ADMIN_LEGACY_ROLES = new Set(["ADMIN", "SUB-ADMIN"]);
const ADMIN_ROLE_SLUGS = new Set(["admin", "sub-admin", "sub_admin"]);

function normalizeList(value?: string[] | string): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

/** Matches backend `isUserAdmin` — ADMIN / SUB-ADMIN legacy roles. */
export function isLegacyAdminRole(role?: string | null): boolean {
  const normalized = String(role ?? "")
    .trim()
    .toUpperCase();
  return ADMIN_LEGACY_ROLES.has(normalized);
}

/** True when the session/profile has admin access. */
export function isAdminUser(session: SessionLike): boolean {
  if (!session) return false;

  if (isLegacyAdminRole(session.legacyRole) || isLegacyAdminRole(session.role)) {
    return true;
  }

  const roles = normalizeList(session.roles).map((r) => r.toLowerCase());
  if (roles.some((r) => ADMIN_ROLE_SLUGS.has(r))) {
    return true;
  }

  const permissions = normalizeList(session.permissions).map((p) => p.toLowerCase());
  return permissions.some((p) => p === "admin.users" || p.startsWith("admin."));
}

/** Normalize paths for bottom-nav active state (handles trailing slashes). */
export function isNavPathActive(
  pathname: string | null,
  href: string,
): boolean {
  if (!pathname) return false;
  const current = pathname.replace(/\/$/, "") || "/";
  const target = href.replace(/\/$/, "") || "/";
  if (current === target) return true;
  return target !== "/" && current.startsWith(`${target}/`);
}
