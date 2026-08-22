# 🧳 Wanderloom — Personalized Multi-City Travel Planner

> *Weave your cities, dates, and dreams into one seamless journey.*

Built for the **Odoo Hackathon** — Problem Statement: **GlobeTrotter — Empowering Personalized Travel Planning**

---

## ✨ Overview

Wanderloom is an end-to-end travel planning platform that lets users design multi-city trips, assign dates and activities to each stop, auto-calculate budgets, visualize the full journey on a calendar/timeline, and share the finished itinerary with friends or the public.

Planning a trip today is scattered across spreadsheets, notes apps, and a dozen browser tabs. Wanderloom brings city discovery, activity planning, budgeting, and visualization into a single, structured, collaborative workspace — so travel planning feels as exciting as the trip itself.

---

## 🎯 Problem Statement

Design and build a complete travel planning application where users can:

- Create customized multi-city itineraries
- Assign travel dates, activities, and budgets
- Discover activities and destinations through search
- Receive cost breakdowns and visual calendars
- Share their plans publicly or with friends

Full PS reference: see `docs/problem-statement.pdf` in this repo.

---

## 🖼️ Mockup / Design Reference

Wireframes and screen flow (as provided by Odoo, adapted for our build):
🔗 [Excalidraw Mockup](https://app.excalidraw.com/l/65VNwvy7c4X/6CzbTgEeSr1)

*(Add your own annotated screenshots / Figma link here once your UI is ready.)*

---

## 🚀 Core Features

| # | Screen | What it does |
|---|--------|---------------|
| 1 | **Login / Signup** | Email-password auth, forgot password, basic validation |
| 2 | **Dashboard** | Upcoming trips, recommended destinations, budget highlights, "Plan New Trip" |
| 3 | **Create Trip** | Trip name, start/end dates, description, optional cover photo |
| 4 | **My Trips** | Card view of all trips with edit/view/delete actions |
| 5 | **Itinerary Builder** | Add stops, assign cities/dates, attach activities, reorder cities |
| 6 | **Itinerary View** | Day-wise / city-wise structured breakdown of the full plan |
| 7 | **City Search** | Search cities by name, country, cost index, popularity |
| 8 | **Activity Search** | Filter activities by type, cost, and duration |
| 9 | **Budget & Cost Breakdown** | Transport / stay / activity / meal split, charts, overbudget alerts |
| 10 | **Calendar / Timeline View** | Drag-to-reorder, expandable day view |
| 11 | **Shared/Public Itinerary** | Public read-only link, "Copy Trip," social share |
| 12 | **Profile / Settings** | Edit profile, preferences, saved destinations, delete account |
| 13 | **Admin Dashboard** *(optional/stretch)* | Trip trends, top cities, engagement stats |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT-based email/password auth |
| Charts | Recharts (budget breakdowns) |
| Deployment | Vercel (frontend) + Render/Railway (backend + DB) |

> Swap any row above to match what your team actually ships — keep this table in sync with reality before submission.

---

## 🗄️ Database Design (High-Level)

Core entities:

- **User** — id, name, email, password_hash, preferences
- **Trip** — id, user_id, name, start_date, end_date, description, cover_photo
- **Stop** — id, trip_id, city_id, start_date, end_date, order_index
- **City** — id, name, country, cost_index, popularity
- **Activity** — id, city_id, name, type, cost, duration, description
- **TripActivity** — id, stop_id, activity_id, scheduled_time, cost
- **Budget** — derived/aggregated from TripActivity + Stop (transport, stay, meals, activities)

*(Attach your actual ER diagram image here — `docs/er-diagram.png`.)*

---

## 📂 Project Structure

```
wanderloom/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── App.jsx
│   └── package.json
├── server/                  # Node/Express backend
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── models/          # Prisma schema
│   │   └── index.js
│   └── package.json
├── docs/
│   ├── problem-statement.pdf
│   └── er-diagram.png
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js ≥ 18
- PostgreSQL ≥ 14
- npm or yarn

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/wanderloom.git
cd wanderloom

# Backend
cd server
npm install
cp .env.example .env   # add your DATABASE_URL and JWT_SECRET
npx prisma migrate dev
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev
```

App will be available at `http://localhost:5173` (frontend) and `http://localhost:5000` (API).

---



---

## 📌 Future Scope

- AI-based itinerary suggestions based on budget/interest
- Real-time collaborative trip editing
- Integration with live flight/hotel price APIs
- Offline mode for on-trip access

---

## 📄 License

This project was built for the Odoo Hackathon and is intended for evaluation purposes.
