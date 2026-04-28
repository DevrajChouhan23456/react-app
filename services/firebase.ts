// Firebase Phone Auth replaced by backend OTP (MSG91/dev mode)
// See store/authStore.ts for the new flow:
//   POST /api/auth/send-otp   → sends OTP via MSG91
//   POST /api/auth/verify-otp → verifies OTP
//
// @react-native-firebase is still used for other features (e.g. push notifications)
// but phone auth no longer goes through Firebase.
export {};
