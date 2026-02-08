# FastSwype

**Find Your FYP Partner at FAST — Swipe, Match, Collaborate**

A brutalist-design matching app for FAST University students to find Final Year Project partners. Built with Next.js, Supabase, Firebase, and Capacitor for Android.

**Live:** [https://fast-swype.vercel.app](https://fast-swype.vercel.app)

---

## Features

- **Swipe to Match** — Tinder-style card swiping for FYP partner discovery
- **2 FREE Proposals** — Try before you buy, then unlock unlimited for PKR 250
- **FAST Students Only** — Email validation with `@nu.edu.pk` / `@lhr.nu.edu.pk` / `@isb.nu.edu.pk`
- **Push Notifications** — Get notified when someone sends you a proposal or accepts yours
- **Smart Filters** — Filter by skills, city, campus, and what you're looking for
- **Android APK** — Native Android app via Capacitor (auto-updates from Vercel)
- **PWA Support** — Installable as a Progressive Web App on any device
- **Brutalist UI** — Bold, unapologetic design with sound effects

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16.1.4 (App Router) |
| **UI** | React 19.2.3 + Styled Components + Tailwind CSS 4 |
| **Database** | Supabase (PostgreSQL + RLS + Storage) |
| **Auth** | Supabase Auth (Magic Link with FAST email validation) |
| **Notifications** | Firebase Cloud Messaging (FCM) |
| **Android** | Capacitor 8 (WebView shell pointing to Vercel) |
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

For Android APK builds, you also need:

- **JDK 21** — `winget install Microsoft.OpenJDK.21`
- **Android SDK** — Command-line tools + platform 34+ and build-tools

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

# Firebase (get from Firebase Console > Project Settings > General)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Firebase Push (get VAPID from Firebase Console > Cloud Messaging > Web Push certificates)
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your-vapid-key
FIREBASE_SERVER_KEY=your-fcm-legacy-server-key

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
3. Add a **Web App** → copy config to `.env.local`
4. Go to **Cloud Messaging** tab → Generate **Web Push certificate** → copy VAPID key
5. Get **Server Key** (legacy) from Cloud Messaging → copy to `FIREBASE_SERVER_KEY`

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

## Android APK Build

The Android app is a **Capacitor WebView** that loads your live Vercel URL. This means:
- **Zero code duplication** — the APK runs your web app
- **Auto-updates** — deploy to Vercel and the APK automatically gets the latest version
- **Native push notifications** — via `@capacitor/push-notifications`

### Prerequisites

```bash
# Install JDK 21 (required by Capacitor 8)
winget install Microsoft.OpenJDK.21

# Set environment variables (Windows)
# JAVA_HOME = C:\Program Files\Microsoft\jdk-21.0.x.x-hotspot
# ANDROID_HOME = %LOCALAPPDATA%\Android\Sdk
```

Install Android SDK command-line tools:

```bash
# Download Android cmdline-tools
curl -L -o cmdline-tools.zip https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip

# Extract to %LOCALAPPDATA%\Android\Sdk\cmdline-tools\latest\

# Accept licenses
sdkmanager --licenses

# Install required packages
sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0"
```

### Build APK

```bash
# 1. Sync Capacitor with Android project
npx cap sync android

# 2. Build debug APK
cd android
.\gradlew.bat assembleDebug
cd ..

# 3. Copy APK to public folder for download
copy android\app\build\outputs\apk\debug\app-debug.apk public\fastswype.apk

# 4. Commit and deploy
git add public/fastswype.apk
git commit -m "update APK"
git push
```

The APK will be downloadable at `https://fast-swype.vercel.app/fastswype.apk`.

### Build Release APK (Signed)

For a signed release build:

```bash
cd android

# Generate signing key (first time only)
keytool -genkey -v -keystore fastswype-release.keystore -alias fastswype -keyalg RSA -keysize 2048 -validity 10000

# Build release APK
.\gradlew.bat assembleRelease
cd ..
```

You'll need to configure signing in `android/app/build.gradle`:

```groovy
android {
    signingConfigs {
        release {
            storeFile file('fastswype-release.keystore')
            storePassword 'your-password'
            keyAlias 'fastswype'
            keyPassword 'your-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Firebase for Android (Native Push)

To enable native push notifications in the APK:

1. Go to Firebase Console → Project Settings → **Add App → Android**
2. Package name: `com.fastswype.app`
3. Download `google-services.json`
4. Place it in `android/app/google-services.json`
5. Rebuild the APK

### NPM Scripts (Convenience)

```bash
npm run cap:sync       # Sync web assets with Android
npm run cap:build      # Build debug APK
npm run cap:copy-apk   # Copy APK to public/fastswype.apk
```

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
│   ├── download/           # Android APK download page
│   └── api/
│       └── send-notification/ # FCM push notification endpoint
│
├── components/             # React components
│   ├── SwipeCard.tsx       # Tinder-style swipe card (framer-motion)
│   ├── NotificationHandler.tsx # Push notification prompt + toast
│   ├── DownloadApp.tsx     # Platform-aware APK download
│   ├── PWAUpdater.tsx      # Auto-update detection
│   ├── PaymentModal.tsx    # Payment verification flow
│   └── ...
│
├── lib/                    # Utilities and services
│   ├── supabase/           # Supabase client + API helpers
│   ├── firebase.ts         # Firebase initialization (dynamic imports)
│   ├── notifications.ts    # FCM web notifications
│   ├── capacitor-push.ts   # Native Android push via Capacitor
│   ├── notify.ts           # Trigger notifications from client
│   ├── platform.ts         # Platform detection (Android/iOS/Desktop)
│   ├── auth-context.tsx    # Auth provider (Supabase session)
│   └── ...
│
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── firebase-messaging-sw.js # Background notification handler
│   ├── fastswype.apk       # Android APK for download
│   ├── icons/              # PWA icons (72-512px)
│   └── .well-known/        # Digital Asset Links
│
├── android/                # Capacitor Android project (gitignored)
├── capacitor.config.ts     # Capacitor configuration
├── scripts/                # Build scripts (icons, screenshots, SW)
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
2. Swipe right → sends proposal (up to 2 free, then requires payment)
3. Swipe left → skip
4. Recipient gets push notification
5. Recipient can accept/reject on `/proposals`
6. On accept → both users see each other's contact info

### Push Notification Flow
- **Web (Browser):** Firebase Cloud Messaging via web push + service worker
- **Android (APK):** Native push via `@capacitor/push-notifications` → FCM
- **Both paths** save the FCM token to Supabase `profiles.fcm_token`
- Notifications triggered client-side via `/api/send-notification` endpoint

### Payment Flow
1. User sends PKR 250 to IBAN (shown in PaymentModal)
2. Uploads screenshot + transaction ID
3. Admin verifies in Supabase dashboard
4. User gets unlimited proposals

---

## Environment Variables Reference

| Variable | Required | Where | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Client + Server | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client + Server | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server only | Supabase service role (admin) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Client | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Client | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Client + Server | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | Client | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | Client | FCM sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Client | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Yes | Client | Web push VAPID key |
| `FIREBASE_SERVER_KEY` | Yes | Server only | FCM legacy server key |
| `NOTIFICATION_API_KEY` | Yes | Server only | Protects notification endpoint |
| `NEXT_PUBLIC_NOTIFICATION_API_KEY` | Yes | Client | Must match `NOTIFICATION_API_KEY` |
| `NEXT_PUBLIC_SITE_URL` | Yes | Client | Your deployment URL |
| `NEXT_PUBLIC_IBAN_NUMBER` | Optional | Client | Payment IBAN number |
| `NEXT_PUBLIC_PAYMENT_WHATSAPP` | Optional | Client | WhatsApp for payment support |

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

### APK shows white screen
Make sure `capacitor.config.ts` has the correct `server.url` pointing to your Vercel deployment.

### Gradle build fails with "invalid source release: 21"
You need JDK 21, not JDK 17. Install it with:
```bash
winget install Microsoft.OpenJDK.21
```
And set `JAVA_HOME` to the JDK 21 path.

### Push notifications not working
1. Check if `fcm_token` column exists in Supabase `profiles` table (run `supabase/migrations/add_fcm_token.sql`)
2. Check if `FIREBASE_SERVER_KEY` is set in Vercel env vars
3. Check if `NOTIFICATION_API_KEY` and `NEXT_PUBLIC_NOTIFICATION_API_KEY` match

---

## Creator

Built by a broke FAST student trying to get a new laptop.

**Connect with me**: [bento.me/shahmpooh](https://bento.me/shahmpooh)

## License

This project is open source and available under the MIT License.
