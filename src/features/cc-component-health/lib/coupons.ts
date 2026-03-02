export const MOCK_COUPON_CODE = "RIDE-RENEW-10";

export function isCouponEligible(remainingPercent: number): boolean {
  return remainingPercent <= 0.05;
}
