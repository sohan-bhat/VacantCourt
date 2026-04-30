# VacantCourt

A real-time court occupancy system that uses on-device computer vision to detect whether tennis and basketball courts are in use, and surfaces availability through a web app and interactive map.

**Live demo:** https://vacantcourt.netlify.app

This repo contains the web frontend. The Android detector that powers the live status feed lives at [VacantCourtApp](https://github.com/sohan-bhat/VacantCourtApp).

## Demo
https://github.com/user-attachments/assets/c72ba944-287d-4beb-8583-8a5da9a9024c

## How it works

The system has three parts:

1. **Android detector** ([VacantCourtApp](https://github.com/sohan-bhat/VacantCourtApp)): a Kotlin app running TensorFlow Lite person detection on a phone camera mounted at a court. Detected bounding boxes are checked against pre-defined court zones; when overlap is detected, the court is marked in-use. End-to-end latency is ~2 seconds.
2. **Firebase backend:** Firestore stores court metadata and receives real-time occupancy updates from the detector.
3. **Web app** (this repo): React + TypeScript frontend that reads live status from Firestore and displays courts on a list view and a Leaflet map. Includes geolocation-based proximity sorting, search and filter, and Google Places autocomplete for adding new courts.

## Screenshots

| List view | Map view |
|---|---|
| <img src="public/assets/dashboard.png" width="500" /> | <img src="public/assets/mapview.png" width="500" /> |

| Court details (desktop) | Court details (mobile) |
|---|---|
| <img src="public/assets/courtdetails.png" width="500" /> | <img src="public/assets/mobile.png" width="220" /> |

## Tech stack

- **Frontend:** React (Vite), TypeScript, React Router v6, Material-UI, Leaflet / React-Leaflet
- **Backend:** Firebase Firestore (real-time sync)
- **APIs:** Google Maps JavaScript API (Places Autocomplete), Browser Geolocation API
- **Detector** ([separate repo](https://github.com/sohan-bhat/VacantCourtApp)): Kotlin, TensorFlow Lite, Android CameraX

## Running locally

Requires Node 16+ and a Firebase project (free tier works).

```bash
git clone https://github.com/sohan-bhat/VacantCourt.git
cd VacantCourt
npm install
```

Create `.env.local` with your Firebase and Google Maps keys (see `.env.example`):

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_GOOGLE_MAPS_API_KEY=...
```

Then:

```bash
npm run dev
```

## Status and known limitations

- Detector is a working proof-of-concept; not currently deployed at a physical court.
- Court status can also be set manually for courts without a detector installed.
- Tested on Android 11+ with rear camera; performance varies with lighting and camera angle.

## License

MIT
