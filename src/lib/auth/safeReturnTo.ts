export type ReturnFrom = {
  pathname?: string;
  search?: string;
} | null;

export function safeReturnTo(from?: ReturnFrom): string {
  const pathname = from?.pathname ?? '';
  const search = from?.search ?? '';
  if (!pathname.startsWith('/') || pathname.startsWith('//') || pathname.includes('\\')) {
    return '/';
  }
  const lower = pathname.toLowerCase();
  if (lower.includes('http:') || lower.includes('https:')) {
    return '/';
  }
  return `${pathname}${search}`;
}
