/**
 * Header Enrichment (HE) Resolver Helper
 * Inspects incoming HTTP headers to auto-detect subscriber MSISDN
 */
export function resolveMsisdnFromHeaders(headers, detectionHeaders = []) {
  const headerKeysToCheck = detectionHeaders.length > 0 
    ? detectionHeaders 
    : ['x-msisdn', 'x-network-info', 'x-up-calling-line-id', 'msisdn', 'http-x-msisdn'];

  for (const rawKey of headerKeysToCheck) {
    const key = rawKey.toLowerCase();
    const val = headers[key];
    if (val && typeof val === 'string' && val.trim().length >= 8) {
      // Normalize number: extract digits
      const cleaned = val.replace(/[^\d+]/g, '');
      if (cleaned.length >= 8) {
        return cleaned;
      }
    }
  }

  // Development dummy fallback (if header explicitly simulated in test)
  if (headers['x-mock-msisdn']) {
    return headers['x-mock-msisdn'];
  }

  return null;
}
