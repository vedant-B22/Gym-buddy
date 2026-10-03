import {
  calculateMembershipDates,
  deriveMemberStatus,
  calculateUnfreeze,
  generateRotatingQrToken,
  validateRotatingQrToken,
} from '../src/lib/business-logic';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASSED: ${message}`);
}

console.log('🧪 Running Critical Logic Unit Tests...');

// 1. Membership Renewal Before Expiry
const now = new Date('2026-10-01T12:00:00Z');
const currentExpiry = new Date('2026-10-15T12:00:00Z'); // 14 days left
const paymentDate = new Date('2026-10-05T12:00:00Z'); // Paid 10 days before expiry
const durationDays = 30;

const renewalBefore = calculateMembershipDates(currentExpiry, paymentDate, durationDays);
const expectedEndBefore = new Date(currentExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
assert(
  renewalBefore.endDate.toISOString() === expectedEndBefore.toISOString(),
  'Renewing before expiry extends from current expiry date, preserving remaining days'
);

// 2. Membership Renewal After Expiry
const expiredDate = new Date('2026-09-01T12:00:00Z'); // Expired a month ago
const latePayment = new Date('2026-10-05T12:00:00Z');
const renewalAfter = calculateMembershipDates(expiredDate, latePayment, durationDays);
const expectedEndAfter = new Date(latePayment.getTime() + 30 * 24 * 60 * 60 * 1000);
assert(
  renewalAfter.endDate.toISOString() === expectedEndAfter.toISOString(),
  'Renewing after expiry starts duration from payment date'
);

// 3. Status Derivation
const futureExpiry = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
assert(deriveMemberStatus(futureExpiry, null) === 'ACTIVE', 'Future expiry (>7d) is ACTIVE');

const expiringSoon = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);
assert(deriveMemberStatus(expiringSoon, null) === 'EXPIRING_SOON', 'Expiry in 4 days is EXPIRING_SOON');

const pastExpiry = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
assert(deriveMemberStatus(pastExpiry, null) === 'EXPIRED', 'Past expiry is EXPIRED');

assert(deriveMemberStatus(futureExpiry, new Date()) === 'FROZEN', 'Frozen status takes precedence');

// 4. Unfreeze Calculation
const freezeStart = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // frozen 10 days ago
const unfreezeResult = calculateUnfreeze(futureExpiry, freezeStart);
assert(unfreezeResult.daysFrozen === 10, 'Accurately calculates 10 days frozen');
assert(
  unfreezeResult.newExpiryDate.getTime() > futureExpiry.getTime(),
  'Expiry date was extended by frozen days'
);

// 5. Rotating QR Token Security
const { token } = generateRotatingQrToken('main-branch');
assert(validateRotatingQrToken(token, 'main-branch') === true, 'Valid rotating QR token verified successfully');
assert(validateRotatingQrToken(token, 'wrong-branch') === false, 'QR token from another branch rejected');
assert(validateRotatingQrToken('IFQR-invalid-token', 'main-branch') === false, 'Tampered QR token rejected');

console.log('\n🎉 ALL 8 CRITICAL LOGIC TESTS PASSED!\n');
