# 🛺 HopIn — Live Student Ride-Pooling Platform

> **A real-time, peer-to-peer campus commute coordination platform built exclusively for verified university students.**

![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Firebase](https://img.shields.io/badge/Firebase-12.19-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## 🌟 Overview

**HopIn** solves the daily campus commute struggle by allowing college students to coordinate shared auto-rickshaws, cabs, and campus shuttles in real time. Students split fares, reduce travel expenses, and travel safely with verified peers from their own institution.

Built as a high-performance **Progressive Web App (PWA)**, HopIn works seamlessly across Android, iOS, tablets, and desktop browsers with instant home-screen installation.

---

## 🚀 Key Features

### 🔐 1. Strict Institutional Domain Gatekeeper
- **Official Google OAuth**: Direct sign-in with the native device Google account selector (`prompt: select_account`).
- **Domain Verification**: Strictly limited to verified college domains (`@bbdu.ac.in`, `@bbdniit.ac.in`, `@bbdnitm.ac.in`).
- **Personal Account Blocker**: Automatically detects and blocks personal `@gmail.com` accounts to maintain student safety.

### 🚗 2. Live Ride Board & Slot Coordination
- **Real-Time Listings**: Post and discover available ride slots to and from campus hubs (Kamta, Matiyari, Charbagh, Gomti Nagar, Polytechnic).
- **Seat Capacity Counters**: Live seat availability indicators with automatic full-status locks.
- **Direction Filters**: Quickly filter between *All Routes*, *To Campus*, and *From Campus*.
- **Realistic Vehicle Physics**: Custom SVG street banner featuring animated vehicle suspension, alloy wheels, road lane motion, and volumetric headlights.

### 🛡️ 3. Safety & 'Girls Only' Ride Filters
- Filter and create exclusive **Girls Only** rides to provide safe travel options for female students.
- Verified identity badges on every host and passenger profile.

### 💬 4. Live Squad Chat
- Real-time coordinated in-ride group chat for confirmed passengers and hosts.
- Instant pickup coordination, live departure countdowns, and host management controls.

### 🎨 5. Profile & Custom Avatars
- Custom profile photo upload with client-side canvas compression (instant load, zero bloat).
- Interactive preset avatar picker with 12+ styles (Cyber Bots, Adventurers, Stylized avatars) and a 1-click **Shuffle 🎲** generator.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, React Router v6
- **Styling**: Tailwind CSS, Lucide React Icons, Glassmorphism UI
- **Backend & Realtime**: Firebase Authentication, Cloud Firestore
- **PWA**: Service Worker, Web App Manifest, Offline Capability
- **Deployment**: Vercel (Configured with SPA routing in `vercel.json`)

---

## 📦 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/hopin-bbd.git
cd hopin-bbd
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

### 4. Build for production
```bash
npm run build
```

---

## 🌐 Deployment to Vercel

1. Import this repository into **[Vercel](https://vercel.com/)**.
2. Vercel will automatically detect Vite and run `npm run build`.
3. Add your generated Vercel domain to **Firebase Console → Authentication → Settings → Authorized domains**.

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
