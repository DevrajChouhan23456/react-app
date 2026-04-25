# React Native Web Setup Guide

Run your Dal Bafla app in **any browser** (Chrome, Edge, Comet, Firefox)

---

## 1. Install web packages

```bash
git pull origin main
npm install
npx expo install react-native-web react-dom @expo/metro-runtime
```

---

## 2. Start web version

```bash
npx expo start --web
```

Then open in your browser:
```
http://localhost:8081
```

---

## 3. What it looks like in browser

On desktop browsers, the app shows as a **mobile-sized window (390px)**
centered on screen with a shadow — exactly like a phone preview.

On mobile browsers, it fills the full screen.

---

## 4. Build for web deployment

```bash
npx expo export --platform web
```

This creates a `dist/` folder you can deploy to:
- Vercel (free): `vercel --prod`
- Netlify (free): drag & drop `dist/` folder
- GitHub Pages (free)

---

## 5. Known limitations in web

| Feature | Web Support |
|---------|------------|
| Menu, Cart, Checkout | ✅ Full support |
| Navigation | ✅ Full support |
| Zustand state | ✅ Full support |
| AsyncStorage | ✅ Works (localStorage) |
| Supabase Auth | ✅ Works |
| Razorpay WebView | ⚠️ Limited (use Razorpay.js directly for web) |
| Push Notifications | ⚠️ Use web push instead |
| Camera/Location | ⚠️ Needs browser permission |

---

## 6. PWA (installable web app)

Your app is configured as a **Progressive Web App (PWA)**.
Users can install it from the browser — works like a real app!

On Chrome/Comet: address bar → Install icon → Add to home screen

---

## Test checklist in browser

- [ ] Home screen loads with menu items
- [ ] Categories filter works
- [ ] Add item to cart
- [ ] Cart total updates
- [ ] Checkout screen opens
- [ ] Payment method selector works
- [ ] Profile screen shows
- [ ] Dark/light mode toggle
