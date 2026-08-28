export const DEMO_PASSWORD_RESET_OTP = '000000';

export function isDemoOtp(value: string): boolean {
  return value.trim() === DEMO_PASSWORD_RESET_OTP;
}
