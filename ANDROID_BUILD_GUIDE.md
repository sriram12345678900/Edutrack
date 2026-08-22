# 📱 EduTrack Android App Build & Deployment Guide

EduTrack includes built-in Capacitor and Progressive Web App (PWA) configuration to run directly on Android devices with offline caching and native mobile capabilities.

---

## 🚀 Quick Option 1: Install Instantly as Android PWA (Zero Setup)
EduTrack is configured with a Web App Manifest (`public/manifest.json`) and an Offline Service Worker (`public/sw.js`).

1. Open EduTrack in **Chrome on your Android device**.
2. Tap the **Three Dots Menu (⋮)** in the top right.
3. Tap **"Install App"** or **"Add to Home Screen"**.
4. EduTrack will install as a standalone Android app with its own icon, splash screen, offline caching, and full-screen immersive view.

---

## 🛠️ Quick Option 2: Build Native Android APK (`.apk`) with Capacitor

### Step 1: Install Capacitor Dependencies
Run the following command in the project root:
```bash
npm install @capacitor/core @capacitor/android @capacitor/cli --save
```

### Step 2: Build the Next.js Web Assets
```bash
npm run build
```

### Step 3: Initialize the Android Platform
```bash
npx cap add android
```

### Step 4: Sync Web Assets to Android Project
```bash
npx cap sync
```

### Step 5: Open in Android Studio & Generate APK
```bash
npx cap open android
```
- In **Android Studio**, click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
- Locate your generated `.apk` file in `android/app/build/outputs/apk/debug/app-debug.apk`.
- Transfer to any Android phone or tablet to install!

---

## 🌟 Included Next-Gen Features in EduTrack

1. 🌐 **Global Doubt & Query Forum (`/community`)**: Worldwide student-to-student and teacher Q&A hub with AI co-pilot breakdowns, KaTeX math rendering, and XP bounties.
2. 🎙️ **AI Voice Viva Simulator (`/viva`)**: Speech synthesis and real-time voice recognition for oral practical exam preparation with conceptual scoring.
3. 🧠 **Feynman Technique Lab (`/feynman`)**: Reverse-learning module where students teach an inquisitive AI novice ("Leo") to master deep intuition without jargon.
4. 🎧 **AI Audio Podcast Generator (`/podcast`)**: Dual-host conversational podcast creator with speed adjustment and synchronized live transcript highlighting.
5. ⚔️ **Live Multiplayer Quiz Arena (`/arena`)**: Competitive battle royale with PIN codes, power-ups (*50-50, Time Freeze, 2x Multiplier*), live leaderboards, and victory podiums.
6. 🌳 **Subject Skill Trees (`/skill-tree`)**: RPG talent progression map for Physics, Chemistry, Biology, and Math with prerequisite tracking.
7. ⚡ **Interactive Science Simulations (`/simulations`)**: HTML5 Canvas labs for Ray Optics & Lenses, Projectile Motion Trajectories, and Ohm's Law Circuits.
8. 📄 **1-Click Printable Board Exam Generator (`/exam-generator`)**: Generates official CBSE/ICSE blueprint question papers (Sections A–E) and step-by-step marking schemes with 1-click PDF print.
9. 👨‍👩‍👧 **Parent Notification & Weekly AI Digest (`/parent`)**: Automated progress digest with 1-click WhatsApp and Email share formatting plus in-app alerts.
10. 📦 **Offline PWA & Service Worker (`/sw.js`)**: Background pre-caching of core learning modules for offline revision without internet.
