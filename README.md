# Help Radius 🚨
### Location-Based Emergency and Community Assistance Platform

[![CI/CD Pipeline](https://github.com/help-radius/help-radius/actions/workflows/ci.yml/badge.svg)](https://github.com/help-radius/help-radius/actions/workflows/ci.yml)
[![Node Version](https://img.shields.io/badge/node-v20%20LTS-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Ready](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)

**Help Radius** connects individuals in immediate distress or everyday need with nearby verified volunteers and emergency first-responders using GPS geofencing, automatic radius expansion, and privacy-preserving communication.

---

## 🌟 Key Features & Implementation Split

| Feature | Status | Description |
| :--- | :---: | :--- |
| **Emergency SOS (Press & Hold)** | ✅ **Working** | Big Red SOS button with 2s hold protection, 5s cancel countdown, and 112 hotline shortcut. |
| **General Immediate Help** | ✅ **Working** | Tyre punctures, breakdowns, heavy objects with map pin-drop & transparent travel compensation. |
| **Scheduled Help** | ✅ **Working** | Hospital companions, elderly assistance with future date selection, lead times & rescheduling. |
| **Dynamic Radius Expansion** | ✅ **Working** | Background worker expands search (2km → 5km → 10km → 20km) with duplicate notification suppression. |
| **Emergency Contact Alerts** | ✅ **Working** | Dispatches simultaneous alerts to saved contacts (up to 6) independent of distance with delivery badges. |
| **Atomic Helper Acceptance** | ✅ **Working** | Server concurrency lock ensuring only one helper can accept a request. |
| **Real-Time Live Tracking** | ✅ **Working** | Live map with requester & helper markers, connecting route polyline, distance & ETA countdown. |
| **In-App Private Chat** | ✅ **Working** | Text, photo sharing, and **browser MediaRecorder voice notes** with read receipts. Locks upon completion. |
| **In-App Voice Calling** | 🟡 **Prototype** | WebRTC in-app audio call simulation with synthesized ringtone. **Zero phone numbers exposed.** |
| **Helper ID Verification** | 🟡 **Prototype** | Volunteer document verification workflow with Admin approval and Personal Safety certification. |
| **Transparent Pricing** | ✅ **Working** | 3-tier itemized breakdown (Expansion Fee, Travel Comp, Reward). SOS is 100% free & unconditional. |
| **Admin Moderation Panel** | ✅ **Working** | Live metrics, helper approvals, safety certifications, user suspension, and audit trails. |
| **Full Containerization** | ✅ **Working** | Multi-stage production Nginx frontend, Alpine backend, and single-command Docker Compose setup. |

---

## 🏗️ System Architecture

```
Help-Radius/
├── frontend/               # React 18 + Vite + Tailwind CSS + Leaflet Maps
│   ├── src/components/     # SOS Modal, Tracking Map, Voice Recorder, Voice Call Modal
│   ├── src/context/        # AuthContext (Role Switcher), NotificationContext
│   ├── src/pages/          # Dashboard, General, Scheduled, Active Emergency, Inbox, Chat, Admin
│   ├── Dockerfile          # Multi-stage production build with Nginx SPA routing
│   └── nginx.conf          # Gzip compression, API proxy, and security headers
├── backend/                # Node.js + Express REST API
│   ├── src/controllers/    # Auth, Helpers, Requests, Chat, Calls, Admin
│   ├── src/services/       # RadiusEngine, MatchingService, PricingService, SmsService
│   ├── src/models/         # In-Memory & File-Persisted Realtime DataStore
│   ├── test/               # Node Test Runner Unit Tests
│   └── Dockerfile          # Lightweight Alpine Node image with non-root security
├── docs/                   # ARCHITECTURE.md, API.md, SECURITY_PRIVACY.md, TEST_PLAN.md
├── docker-compose.yml      # Production Orchestration
├── docker-compose.dev.yml  # Development Hot-Reload Setup
└── .github/workflows/      # GitHub Actions Automated CI/CD
```

---

## 🚀 Quick Start (Running Locally)

### Option A: Using Docker Compose (Single Command)

```bash
# Start both Frontend and Backend containers with healthchecks:
docker compose up --build
```
- Frontend UI: `http://localhost:8080` (or `http://localhost:5173`)
- Backend API: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

---

### Option B: Running Without Docker

#### 1. Backend Setup
```bash
cd backend
npm install
npm start
# Server starts on port 5000 with background radius expansion engine active
```

#### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Vite dev server starts on http://localhost:5173
```

---

## 👥 Demo Accounts (1-Click Switcher)

A built-in **"Demo As"** switcher in the top navigation bar allows evaluators and teammates to alternate between roles with a single click:

1. **Requester (Priya Sharma)**: Default user who can trigger Emergency SOS, General Help, or Scheduled Help.
2. **Verified Helper (Arjun Verma)**: CPR-certified volunteer who receives nearby alerts in the **Helper Inbox**, accepts requests, and chats/calls.
3. **Administrator (System Admin)**: Accesses `/admin` to review volunteer ID applications, certify helpers for personal safety, suspend users, and view audit logs.

---

## 🧪 Running Unit Tests

```bash
cd backend
npm test
```
Executes all 5 core test suites verifying Haversine calculations, ETA algorithms, Emergency SOS fee exemptions, travel compensation rates, and emergency contact limits.

---

## 🛡️ Privacy & Prototype Notice

- **No Aadhaar Numbers Stored:** As required by data minimization standards, Help Radius does not collect or store raw Aadhaar numbers or scans. Identity verification is simulated for demonstration purposes.
- **Strict Identity Protection:** Neither the requester nor the helper can view each other's phone numbers; all voice calls and messaging are mediated internally.
- **Temporary Location Tracking:** Location coordinates are shared only during an active request and cease immediately upon request completion.
