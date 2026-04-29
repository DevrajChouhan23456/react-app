// Firebase app is auto-initialized by @react-native-firebase via google-services.json
// Import firestore/auth directly from their packages — no explicit init needed.

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export { firestore, auth };

// Convenience alias so old `db` references resolve
export const db = firestore();
