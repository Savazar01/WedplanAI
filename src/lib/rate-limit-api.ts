import { NextResponse } from 'next/server';
import { checkRateLimit } from './rate-limit';

export function rateLimitedResponse() {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    { status: 429, headers: { 'Retry-After': '60' } }
  );
}

export function applyApiRateLimit(key: string, tier: 'public' | 'api' = 'api'): NextResponse | null {
  const result = checkRateLimit(key, tier);
  if (!result.success) return rateLimitedResponse();
  return null;
}
