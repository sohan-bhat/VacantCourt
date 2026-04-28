# VacantCourt

A real-time court occupancy system that uses on-device computer vision to detect whether tennis and basketball courts are in use, and surfaces availability through a web app and interactive map.

**Live demo:** https://vacantcourt.netlify.app

This repo contains the web frontend. The Android detector that powers the live status feed lives at [VacantCourtApp](https://github.com/sohan-bhat/VacantCourtApp).

## How it works

The system has three parts:

1. **Android detector** ([VacantCourtApp](https://github.com/sohan-bhat/VacantCourtApp)) — a Kotlin app running TensorFlow Lite person detection on a phone camera mounted at a court. Detected bounding boxes are checked against pre-defined court zones; when overlap is detected, the court is marked in-use. End-to-end latency is ~2 seconds.
2. **Firebase backend** — Firestore stores court metadata and receives real-time occupancy updates from the detector.
3. **Web app** (this repo) — React + TypeScript frontend that reads live status from Firestore and displays courts on a list view and a Leaflet map. Includes geolocation-based proximity sorting, search and filter, and Google Places autocomplete for adding new courts.

## Screenshots

| List view | Map view |
|---|---|
| ![List view](public/assets/dashboard.png) | ![Map view](public/assets/mapview.png) |

| Court details (desktop) | Court details (mobile) |
|---|---|
| ![Desktop](public/assets/courtdetails.png) | <img src="public/assets/mobile.png" width="200" /> |

## Tech stack

- **Frontend:** React (Vite), TypeScript, React Router v6, Material-UI, Leaflet / React-Leaflet
- **Backend:** Firebase Firestore (real-time sync)
- **APIs:** Google Maps JavaScript API (Places Autocomplete), Browser Geolocation API
- **Detector** ([separate repo](https://github.com/sohan-bhat/VacantCourtApp)): Kotlin, TensorFlow Lite, Android CameraX

## Running locally

Requires Node 16+ and a Firebase project (free tier works).

```bash
