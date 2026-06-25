export function formatLocation(wedding: {
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}): string {
  if (wedding.location) return wedding.location;
  const parts = [wedding.city, wedding.state, wedding.country].filter(Boolean);
  return parts.join(', ') || '';
}
