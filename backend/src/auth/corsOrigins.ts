export type EnvMap = Record<string, string | undefined>;

export const DEFAULT_CORS_ORIGIN = 'http://localhost:5173';

function read(env: EnvMap, key: string): string {
  return (env[key] ?? '').trim();
}

export function parseCorsOrigins(env: EnvMap = process.env): string[] {
  const raw = read(env, 'CORS_ORIGINS');
  const tokens = (raw || DEFAULT_CORS_ORIGIN)
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .filter((part) => part !== '*' && !part.includes('*'));
  return tokens.length > 0 ? tokens : [DEFAULT_CORS_ORIGIN];
}

export function isOriginAllowed(origin: string, env: EnvMap = process.env): boolean {
  return parseCorsOrigins(env).includes(origin);
}
