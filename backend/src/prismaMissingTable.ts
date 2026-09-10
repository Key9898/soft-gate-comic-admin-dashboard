export function isMissingTableError(err: unknown): boolean {
  return Boolean(
    err && typeof err === 'object' && 'code' in err && (err as { code: unknown }).code === 'P2021',
  );
}
