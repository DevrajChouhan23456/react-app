# Setup & Run Guide

## ⚠️ IMPORTANT: Always run commands from project ROOT

```
D:\react app\react-app>   ← correct
D:\react app\react-app\android>  ← WRONG — will cause ConfigError
```

## 1. Install dependencies

```bash
cd "D:\react app\react-app"
npm install
```

## 2. Prebuild (generates native android/ folder fresh)

```bash
npx expo prebuild --clean
```

## 3. Run on Android device/emulator

```bash
npx expo run:android
```

## Firebase Phone Auth — SHA Fingerprint Required

1. Get your SHA-1:
```bash
cd android
.\gradlew signingReport
```
Look for the SHA1 line under `Variant: debug`.

2. Add SHA-1 to Firebase Console:
   - Firebase Console → Project Settings → Your Apps → Android app
   - Click "Add fingerprint" → paste SHA-1 → Save
   - Download updated `google-services.json`
   - Replace `android/app/google-services.json`
   - Re-run: `npx expo prebuild --clean && npx expo run:android`

3. Enable Phone Auth:
   - Firebase Console → Authentication → Sign-in method → Phone → Enable

## Package removed
- Removed `firebase` (Web SDK) — use only `@react-native-firebase` for native builds
- `@react-native-firebase/app` + `@react-native-firebase/auth` handle everything natively
