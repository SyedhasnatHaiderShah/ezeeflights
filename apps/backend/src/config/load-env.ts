import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

/**
 * Load env for the backend package regardless of process.cwd() (repo root vs apps/backend).
 * Monorepo root .env loads first; apps/backend/.env overrides (authoritative).
 */
export function loadBackendEnv(): void {
  const backendEnv = path.resolve(__dirname, "../../.env");
  const rootEnv = path.resolve(__dirname, "../../../.env");

  if (fs.existsSync(rootEnv)) {
    dotenv.config({ path: rootEnv });
  }
  if (fs.existsSync(backendEnv)) {
    dotenv.config({ path: backendEnv, override: true });
    return;
  }
  dotenv.config({ path: path.resolve(process.cwd(), ".env"), override: true });
}

export function backendEnvPaths(): string[] {
  const backendEnv = path.resolve(__dirname, "../../.env");
  const rootEnv = path.resolve(__dirname, "../../../.env");
  const paths: string[] = [];
  if (fs.existsSync(backendEnv)) paths.push(backendEnv);
  if (fs.existsSync(rootEnv)) paths.push(rootEnv);
  return paths.length > 0 ? paths : [".env"];
}
