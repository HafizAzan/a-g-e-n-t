const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string): boolean {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;
  return EMAIL_REGEX.test(normalized);
}

export function getEmailSkipReason(email: string): string | null {
  const normalized = normalizeEmail(email);
  if (!normalized) return "Empty email address.";
  if (!isValidEmail(normalized)) return "Invalid email address.";
  return null;
}
