# FastSwype

**Find Your FYP Partner at FAST — Swipe, Match, Collaborate**

A brutalist-design matching app for FAST University students to find Final Year Project partners. Built with Next.js, Supabase, and Firebase.

**Live:** [https://fast-swype.vercel.app](https://fast-swype.vercel.app)

---

## Features

- **Swipe to Match** — Tinder-style card swiping for FYP partner discovery
- **Unlimited Proposals** — Send as many proposals as you want
- **FAST Students Only** — Email validation with `@nu.edu.pk` / `@lhr.nu.edu.pk` / `@isb.nu.edu.pk`
- **Push Notifications** — Get notified when someone sends you a proposal or accepts yours (works on mobile too!)
- **Smart Filters** — Filter by skills, city, campus, and what you're looking for
- **PWA** — Installable as a Progressive Web App on any device (Android, iOS, Desktop)
- **Brutalist UI** — Bold, unapologetic design with sound effects

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.1.4 (App Router) |
| **UI** | React 19.2.3 + Styled Components + Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL + RLS + Storage) |
| **Auth** | Supabase Auth (Magic Link with FAST email validation) |
| **Notifications** | Firebase Cloud Messaging (FCM) via Web Push |
| **PWA** | @ducanh2912/next-pwa (Workbox service worker) |
| **Animations** | Framer Motion (swipe gestures) |
| **Deployment** | Vercel |
| **Analytics** | Vercel Analytics |

---

## Prerequisites

Before you begin, make sure you have:

- **Node.js** 18+ and **npm**
- **Git**
- A **Supabase** project ([supabase.com](https://supabase.com))
- A **Firebase** project ([console.firebase.google.com](https://console.firebase.google.com))
- **Vercel** account for deployment ([vercel.com](https://vercel.com))

---

## Getting Started

### 1. Clone and Install

```bash
git clone https://github.com/shahmeer-irfan/fast-swype.git
cd fast-swype
npm install --legacy-peer-deps
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Firebase Push (FCM HTTP v1 API)
# Get VAPID key from Firebase Console > Cloud Messaging > Web Push certificates
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
# Base64-encoded service account JSON for FCM v1 API
FIREBASE_SERVICE_ACCOUNT_BASE64=your-base64-encoded-service-account-json

# Notification API protection (make up a random string, must match on both)
NOTIFICATION_API_KEY=your-random-secret
NEXT_PUBLIC_NOTIFICATION_API_KEY=your-random-secret

# Site
NEXT_PUBLIC_SITE_URL=https://fast-swype.vercel.app

# Payment (optional)
NEXT_PUBLIC_IBAN_NUMBER=your-iban
NEXT_PUBLIC_PAYMENT_WHATSAPP=your-whatsapp-number
```

### 3. Supabase Setup

Run the SQL schema in your Supabase SQL Editor:

```bash
# Main schema (tables, RLS policies, functions, triggers)
supabase/schema.sql

# Add FCM token column to profiles
supabase/migrations/add_fcm_token.sql
```

The schema creates:
- `profiles` table (user data, skills, campus, payment status, fcm_token)
- `proposals` table (from_user, to_user, message, status)
- `swipes` table (who swiped whom)
- `payments` table (payment verification)
- RLS policies for all tables
- Trigger to auto-create profile on signup
- Functions for proposal limits

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com) → Create Project
2. Enable **Cloud Messaging** (FCM)
3. Add a **Web App** → config is already in `lib/firebase.ts`
4. Go to **Cloud Messaging** tab → Generate **Web Push certificate** → copy VAPID key to `NEXT_PUBLIC_FIREBASE_VAPID_KEY`
5. Go to **Project Settings → Service Accounts** → Generate **new private key** (JSON)
6. Base64-encode the JSON: `base64 -w0 service-account.json` → copy to `FIREBASE_SERVICE_ACCOUNT_BASE64`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

> **Note:** PWA and service worker are disabled in development mode.

### 6. Build for Production

```bash
npm run build    # Runs generate-firebase-sw.js first, then next build --webpack
npm start        # Start production server locally
```

> The build uses `--webpack` flag because `@ducanh2912/next-pwa` doesn't support Turbopack.

---

## Deployment (Vercel)

### 1. Connect to Vercel

```bash
npm i -g vercel
vercel
```

Or connect your GitHub repo to Vercel at [vercel.com/new](https://vercel.com/new).

### 2. Set Environment Variables

In your Vercel project dashboard → **Settings → Environment Variables**, add all the variables from `.env.local`.

### 3. Deploy

```bash
git push origin main   # Auto-deploys on push
```

Or manually:

```bash
vercel --prod
```

---

---

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (PWA meta, notifications, analytics)
│   ├── page.tsx            # Landing page
│   ├── login/              # Auth page (magic link login)
│   ├── swipe/              # Main swipe interface
│   ├── proposals/          # Proposals list + detail view
│   ├── profile/            # Profile view + edit
│   └── api/
│       └── send-notification/ # FCM push notification endpoint
│
├── components/             # React components
│   ├── SwipeCard.tsx       # Tinder-style swipe card (framer-motion)
│   ├── NotificationHandler.tsx # Push notification prompt + toast
│   ├── PWAUpdater.tsx      # Auto-update detection
│   └── ...
│
├── lib/                    # Utilities and services
│   ├── supabase/           # Supabase client + API helpers
│   ├── firebase.ts         # Firebase web SDK initialization
│   ├── web-push.ts         # Web push registration & foreground listener
│   ├── notify.ts           # Trigger notifications from client
│   ├── auth-context.tsx    # Auth provider (Supabase session)
│   └── ...
│
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── firebase-messaging-sw.js # Background push notification handler
│   ├── icons/              # PWA icons (72-512px)
│   └── .well-known/        # Asset links
│
├── scripts/                # Build scripts (icons, screenshots)
└── supabase/               # SQL migrations and schema
```

---

## How It Works

### Authentication Flow
1. User enters FAST email (`@nu.edu.pk`, `@lhr.nu.edu.pk`, etc.)
2. Supabase sends magic link email
3. User clicks link → redirected to `/auth/callback` → session created
4. Profile auto-created via database trigger

### Swipe & Proposal Flow
1. User sees profiles one at a time on `/swipe`
2. Swipe right → sends proposal
3. Swipe left → skip
4. Recipient gets push notification
5. Recipient can accept/reject on `/proposals`
6. On accept → both users see each other's contact info

### Push Notification Flow
- Firebase Cloud Messaging (FCM) via web push + service worker
- Works on both desktop browsers and mobile PWA installations
- FCM token saved to Supabase `profiles.fcm_token`
- Server sends via FCM HTTP v1 API with OAuth2 service account auth
- Notifications triggered client-side via `/api/send-notification` endpoint

---

## Environment Variables Reference

| Variable | Required | Where | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client + Server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only | Supabase service role (admin) |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Yes | Client | Web push VAPID key |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Yes | Server only | Base64-encoded Firebase service account JSON |
| `NOTIFICATION_API_KEY` | Yes | Server only | Protects notification endpoint |
| `NEXT_PUBLIC_NOTIFICATION_API_KEY` | Yes | Client | Must match `NOTIFICATION_API_KEY` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Client | Your deployment URL |


---

## Troubleshooting

### Build fails with Turbopack error
The build uses `--webpack` flag. Make sure your `package.json` has:
```json
"build": "next build --webpack"
```

### Firebase imports fail
All Firebase imports use dynamic `await import()` to avoid Turbopack module resolution issues. Don't change them to static imports.

### Service worker not updating
The PWAUpdater component handles this automatically. For manual refresh: clear browser cache or open DevTools → Application → Service Workers → Update.

### Push notifications not working
1. Check if `fcm_token` column exists in Supabase `profiles` table (run `supabase/migrations/add_fcm_token.sql`)
2. Check if `FIREBASE_SERVICE_ACCOUNT_BASE64` is set in Vercel env vars
3. Check if `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is set (get from Firebase Console → Cloud Messaging → Web Push certificates)
4. Check if `NOTIFICATION_API_KEY` and `NEXT_PUBLIC_NOTIFICATION_API_KEY` match
5. Make sure browser notifications permission is granted

---

## Creator

Built by a broke FAST student trying to get a new laptop.

**Connect with me**: [bento.me/shahmpooh](https://bento.me/shahmpooh)

## License

This project is open source and available under the MIT License.
