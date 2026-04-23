# Dal Bafla 🫕 - Food Delivery App

A Swiggy-like food delivery app for **Gau Stories Dal Bafla** business in Bhopal, built with **React Native + Expo**.

## Tech Stack

- **React Native** with Expo SDK 51
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **Zustand** for state management
- **Axios** for API calls
- **React Navigation** (Bottom Tabs + Native Stack)

## Features

- 🏠 Home screen with offers, bestsellers & categories
- 📋 Full menu with categories (Dal Bafla, Thali, Extras, Sweets, Drinks)
- 🛒 Cart with add-ons, quantity control
- 💳 Checkout with address + COD / online payment
- 😋 Live order tracking (Placed → Preparing → Delivered)
- 👤 Profile with order history
- 🏷️ Promo codes & offers

## Getting Started

```bash
# Install dependencies
npm install

# Start the app
npx expo start
```

Then press `a` for Android or `i` for iOS.

## Folder Structure

```
├── app/                    # Expo Router screens
│   ├── (tabs)/             # Bottom tab screens
│   │   ├── index.tsx       # Home screen
│   │   ├── menu.tsx        # Menu screen
│   │   ├── cart.tsx        # Cart screen
│   │   └── profile.tsx     # Profile screen
│   ├── product/[id].tsx    # Product detail screen
│   ├── checkout.tsx        # Checkout screen
│   ├── order-tracking.tsx  # Order tracking screen
│   └── _layout.tsx         # Root layout
├── components/             # Reusable UI components
├── constants/              # Theme, colors, mock data
├── store/                  # Zustand state stores
└── services/               # API service layer
```

## Business

**Gau Stories** | Dal Bafla | Bhopal, Madhya Pradesh
