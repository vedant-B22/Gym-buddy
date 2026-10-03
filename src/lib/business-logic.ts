import crypto from 'crypto';

const QR_SECRET = process.env.QR_SECRET || 'iron-forge-rotating-qr-secret-key';

export interface MembershipDateResult {
  startDate: Date;
  endDate: Date;
  status: 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'FROZEN';
}

/**
 * Calculates start and end dates based on business rules:
 * - If currently active and renewing before expiry, duration is added to currentExpiryDate.
 * - If currently expired or new member, duration starts from paymentDate.
 */
export function calculateMembershipDates(
  currentExpiryDate: Date | null | undefined,
  paymentDate: Date,
  durationDays: number
): MembershipDateResult {
  const now = new Date();
  const paymentTime = new Date(paymentDate);

  let startDate: Date;
  let endDate: Date;

  if (currentExpiryDate && new Date(currentExpiryDate) > paymentTime) {
    // Renewing before expiry: preserve remaining days and extend from current expiry
    startDate = new Date(currentExpiryDate);
    endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  } else {
    // Expired or brand new: start from payment date
    startDate = paymentTime;
    endDate = new Date(paymentTime.getTime() + durationDays * 24 * 60 * 60 * 1000);
  }

  const status = deriveMemberStatus(endDate, null);
  return { startDate, endDate, status };
}

/**
 * Derives a member's current status based on expiry and freeze state
 */
export function deriveMemberStatus(
  expiryDate: Date | null | undefined,
  frozenAt: Date | null | undefined
): 'ACTIVE' | 'EXPIRING_SOON' | 'EXPIRED' | 'FROZEN' {
  if (frozenAt) {
    return 'FROZEN';
  }

  if (!expiryDate) {
    return 'EXPIRED';
  }

  const now = new Date();
  const expiry = new Date(expiryDate);
  const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'EXPIRED';
  }
  if (diffDays <= 7) {
    return 'EXPIRING_SOON';
  }
  return 'ACTIVE';
}

/**
 * Unfreezes membership and extends expiry date by the frozen duration
 */
export function calculateUnfreeze(
  currentExpiryDate: Date,
  frozenAt: Date
): { newExpiryDate: Date; daysFrozen: number } {
  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - new Date(frozenAt).getTime());
  const daysFrozen = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const newExpiryDate = new Date(new Date(currentExpiryDate).getTime() + daysFrozen * 24 * 60 * 60 * 1000);
  return { newExpiryDate, daysFrozen };
}

/**
 * Generates a signed, rotating QR token valid for 45 seconds to prevent screenshot sharing.
 */
export function generateRotatingQrToken(branchId = 'main-branch'): { token: string; expiresAt: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const windowStep = Math.floor(timestamp / 30); // 30-second rotation window
  const payload = `${branchId}:${windowStep}`;
  const hash = crypto.createHmac('sha256', QR_SECRET).update(payload).digest('hex').substring(0, 16);
  const token = `IFQR-${windowStep}-${hash}`;
  const expiresAt = (windowStep + 1) * 30 * 1000;
  return { token, expiresAt };
}

/**
 * Validates whether the scanned rotating QR token is currently valid
 */
export function validateRotatingQrToken(token: string, branchId = 'main-branch'): boolean {
  if (!token || !token.startsWith('IFQR-')) return false;
  const parts = token.split('-');
  if (parts.length !== 3) return false;

  const windowStep = parseInt(parts[1], 10);
  const hash = parts[2];
  if (isNaN(windowStep)) return false;

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentStep = Math.floor(currentTimestamp / 30);

  // Allow current window or previous 30s window (grace period for network latency)
  if (Math.abs(currentStep - windowStep) > 1) {
    return false;
  }

  const expectedPayload = `${branchId}:${windowStep}`;
  const expectedHash = crypto.createHmac('sha256', QR_SECRET).update(expectedPayload).digest('hex').substring(0, 16);

  return hash === expectedHash;
}

/**
 * Formats currency in Indian Rupee format (₹)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Formats date as DD/MM/YYYY
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'N/A';
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}
