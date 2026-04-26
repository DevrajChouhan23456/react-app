// @react-native-firebase — native SDK, no reCAPTCHA verifier needed
// Works with expo prebuild + expo run:android
import auth from '@react-native-firebase/auth';
import app from '@react-native-firebase/app';

export const firebaseAuth = auth();
export default app();
