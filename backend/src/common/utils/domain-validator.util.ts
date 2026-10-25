import * as dns from 'dns';
import { promisify } from 'util';

const resolveMx = promisify(dns.resolveMx);

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  '10minutemail.com',
  'tempmail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'getairmail.com',
  'sharklasers.com',
  'trashmail.com',
]);

/**
 * Checks if a domain is a known disposable or spam provider.
 */
export function isDisposableDomain(domain: string): boolean {
  const normalized = domain.toLowerCase().trim();
  return DISPOSABLE_DOMAINS.has(normalized);
}

/**
 * Verifies if a domain has valid MX (Mail Exchange) DNS records.
 */
export async function hasValidMxRecords(domain: string): Promise<boolean> {
  try {
    const records = await resolveMx(domain.trim());
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false;
  }
}
