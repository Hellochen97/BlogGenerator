export function parseAllowedEmailDomains(value?: string): string[] {
  if (!value) return [];

  return value
    .split(',')
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean);
}

export function getEmailDomain(email?: string | null): string | null {
  if (!email || !email.includes('@')) return null;
  return email.split('@').pop()?.toLowerCase() ?? null;
}

export function isAllowedEmailDomain(email?: string | null, allowedDomains = parseAllowedEmailDomains(import.meta.env.VITE_ALLOWED_EMAIL_DOMAINS)): boolean {
  if (allowedDomains.length === 0) return true;

  const domain = getEmailDomain(email);
  return Boolean(domain && allowedDomains.includes(domain));
}
