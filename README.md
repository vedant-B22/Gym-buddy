# Iron Forge Fitness — Gym Management & Tracking PWA 🏋️‍♂️

A production-ready, mobile-first Progressive Web App (PWA) designed for gym owners, coaches, receptionists, and lifters. Built for Indian gyms (INR `₹`, IST timezone `Asia/Kolkata`, DD/MM/YYYY formatting, front-desk UPI/Cash manual billing with digital PDF receipts and WhatsApp sharing).

---

## ⚡ Tech Stack & Architecture Justification

| Layer | Chosen Technology | Engineering Rationale |
|---|---|---|
| **Frontend** | **Next.js 14 App Router + React 18 + Tailwind CSS** | Server Components for instant marketing SEO and fast admin tables; Client Components for offline PWA state, Web Audio rest timer, and canvas confetti. |
| **Backend & API** | **Next.js Route Handlers (Edge & Node.js Runtime)** | Single unified codebase, zero separate API server to maintain, instant TypeScript type sharing across frontend and backend. |
| **Database & ORM** | **SQLite with WAL Mode + Prisma ORM 5.22.0** | Zero cloud database bills, runs completely locally with sub-millisecond query latency. Fully portable to PostgreSQL when scaling to multi-branch. |
| **PWA & Offline** | **Custom Service Worker + IndexedDB Queue + Web Manifest** | Members can log heavy lifts with zero network reception in gym basements; changes queue locally and auto-sync immediately on reconnect. |
| **Audio & Haptics** | **Web Audio API (Synthesized Beep) + `navigator.vibrate`** | Zero external audio asset loading; synthetic square-wave buzzer ensures rest timer alarms trigger reliably on iOS & Android. |
| **Auth & Security** | **JWT with httpOnly Cookie + RBAC + HMAC-SHA256 QR** | Role-based authorization across 5 tiers (Owner, Manager, Trainer, Receptionist, Member). Attendance uses dynamic 30s rotating cryptographic tokens to prevent photo screenshot sharing. |
| **Invoicing** | **jsPDF & jsPDF-AutoTable** | Dynamic client/server branded 18% GST tax invoice generation with 1-click WhatsApp web direct dispatch (`wa.me`). |

---

## 📱 Three Integrated Surfaces

### 1. Surface 1: Public Marketing Website (`/`)
- **Brand Positioning**: High-energy, dark-themed branding for *Iron Forge Fitness* (Indiranagar, Bengaluru).
- **Hero & Trust**: 12,000+ sq ft floor, Eleiko Olympic drop platforms, 4.9★ Google rating, live crowd capacity indicator.
- **Dynamic Pricing**: Monthly Classic, Quarterly Transformation, and Annual VIP tiers with feature checkmarks.
- **Classes & Trainers**: Weekly group timetable (Metabolic HIIT, Powerlifting, Yoga) with coach profiles.
- **Transformation Showcase**: Real member before/after fat loss and strength statistics.
- **Free 1-Day Trial Form**: Submits directly to the Admin Leads CRM pipeline.
- **SEO & Contact**: `LocalBusiness` JSON-LD schema, interactive Google Map, and floating WhatsApp click-to-chat.

### 2. Surface 2: Member PWA (`/app`)
- **Offline Workout Tracker (`/app/workout/active`)**:
  - Live elapsed stopwatch with exercise sets steppers (weight in kg, reps).
  - Brzycki 1RM estimation & real-time Personal Record (PR) celebration with canvas confetti.
  - Configurable rest timer (30s, 60s, 90s, 120s) with synthesized Web Audio beep and haptic vibration.
  - IndexedDB offline queueing with auto-sync when network returns.
- **Exercise Library (`/app/exercises`)**: 105+ searchable movements categorized by muscle group (Chest, Back, Legs, Shoulders, Arms, Core) and equipment (Barbell, Dumbbell, Cable, Machine, Bodyweight).
- **Body Metrics & Progress (`/app/progress`)**: SVG weight trend line charts, chest/waist/arm measurements, and before/after transformation photo slider.
- **Indian Nutrition & Water Logger (`/app/nutrition`)**: 40+ curated Indian foods database (Paneer, Roti, Dal, Chicken Tikka, Idli, Whey Protein) with daily macro calorie/protein/carb/fat bars and hydration stepper.
- **Dynamic Attendance Pass (`/app/attendance`)**: Member personal QR code and scanner simulation for front desk check-in.
- **Leaderboard & Community (`/app/leaderboard`, `/app/badges`, `/app/referrals`)**: Monthly workout consistency ranks, milestone badges, and member referral codes.

### 3. Surface 3: Owner & Staff Admin Dashboard (`/admin`)
- **Executive Analytics (`/admin`)**: Real-time crowd capacity gauge, peak hours heatmap, revenue KPIs, and absentee churn radar.
- **Member Directory (`/admin/members`, `/admin/members/[id]`)**: Member codes (`IF-1001`), plan status, 1-click membership freeze/unfreeze with automatic validity extension, manual date extension, and CSV export.
- **Front-Desk Billing (`/admin/payments`)**:
  - Strictly manual front-desk billing (Cash or UPI). Zero payment gateway transaction fees.
  - Auto-computes membership expiration: preserves remaining days if renewed early; starts from payment date if renewed after expiry.
  - Generates branded PDF tax invoices with 18% GST breakdown.
  - Instant WhatsApp invoice share button.
- **Reception Attendance & Kiosk (`/admin/attendance`)**:
  - Live rotating QR screen updating every 30 seconds with HMAC tokens.
  - Manual 1-click staff check-in search.
  - Absentee churn alerts (members inactive for 7+ days) with WhatsApp check-in CTA.
- **Leads & CRM Pipeline (`/admin/leads`)**: Kanban pipeline (New, Contacted, Trial Scheduled, Trial Done, Converted, Lost) with 1-click "Convert to Member" action.
- **Equipment & Stock (`/admin/inventory`)**: Gym floor machines, service cycle reminders, maintenance logs, and cafe/supplement stock counters.
- **Expenses & Reports (`/admin/reports`)**: Profit & Loss overview, expense categorization (Rent, Salaries, Electricity, Maintenance), and monthly cashflow summary.
- **Gym Settings (`/admin/settings`)**: Commercial details, GSTIN, floor capacity alerts, accent theme switcher (Emerald, Orange, Crimson), and audit trail.

---

## 🔑 Demo Access & Role Credentials

All demo accounts are pre-seeded in the database with the default password: **`password123`**

You can also use the **sticky Demo Bar** at the top of the screen to switch between any role with 1 click without logging out.

| Role | Email | Mobile Number | Purpose & Access Level |
|---|---|---|---|
| **Owner** | `owner@gymbuddy.com` | `9876543210` | Full administrative control, P&L reports, pricing plans, settings |
| **Manager** | `manager@gymbuddy.com` | `9876543211` | Staff oversight, memberships, lead conversion, expenses |
| **Trainer** | `trainer@gymbuddy.com` | `9876543212` | Workout plans, exercise library, member progress, classes |
| **Receptionist** | `reception@gymbuddy.com` | `9876543213` | Front-desk check-in kiosk, manual cash/UPI receipts, lead enquiries |
| **Member** | `arjun@gmail.com` | `9811122331` | Member app: workout tracking, PR records, nutrition, attendance pass |

---

## 🚀 Getting Started

### 1. Installation & Setup
```bash
# Clone and install dependencies
git clone <repo-url>
cd "Gym Buddy"
npm install

# Run database migrations and seed sample data
npx prisma generate
npx prisma db push
npm run seed
```

### 2. Run Critical Business Logic Tests
```bash
npm test
```
*Executes unit test suite covering:*
- Early membership renewal preserving remaining days.
- Lapsed membership renewal starting from payment date.
- Membership state derivations (`ACTIVE`, `EXPIRING_SOON`, `EXPIRED`, `FROZEN`).
- Frozen days duration extension logic.
- HMAC rotating QR verification with branch authorization and ±1 window drift tolerance.

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public website, [http://localhost:3000/app](http://localhost:3000/app) for the member app, or [http://localhost:3000/admin](http://localhost:3000/admin) for the staff portal.

### 4. Production Build
```bash
npm run build
npm run start
```

---

## 📜 Business Rules & Strict Constraints
1. **Zero Online Payment Gateway**: Built intentionally for Indian independent gyms where front-desk manual cash or UPI transfers (Google Pay, PhonePe, Paytm) avoid payment gateway transaction fees and chargebacks.
2. **Indian Rupee Formatting**: All monetary figures formatted as `₹12,499` with English (India) locale standards.
3. **Date Standards**: Standard `DD/MM/YYYY` presentation across invoices, attendance logs, and membership schedules.
4. **PWA Standalone Mode**: Configured with `display: "standalone"`, SVG icons, custom manifest, and service worker offline fallback (`/offline`).
