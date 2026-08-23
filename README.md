# ?? Society Maintenance Tracker

A production-ready full-stack web platform built for residential apartment societies to streamline complaint management, audit history tracking, overdue escalation, community notice board broadcasting, email alerts, and administrative analytics.

---

## ?? Project Overview

Residential apartment societies handle a constant stream of maintenance requests (plumbing leaks, electrical outages, elevator faults, security issues, clubhouse upkeep). Without a centralized system, admins struggle to identify overdue issues or recurring patterns, and residents have zero visibility into complaint progress.

**Society Maintenance Tracker** solves this with:
- **Resident Portal:** Lodge complaints with category, description, and photo attachments; track real-time resolution progress and view full chronological audit history.
- **Admin Control Desk:** Filter complaints by status, category, date, and priority; update statuses with audit notes; configure overdue SLA thresholds; and view rich operational analytics.
- **Overdue Engine:** Unresolved tickets exceeding society-configured thresholds (e.g., 3 days) are flagged and automatically surfaced to the top of the admin queue.
- **Community Notice Board:** Publish announcements with categories; pin important notices to the top and automatically dispatch broadcast emails to all residents.
- **Email Notifications:** Automated email delivery on status transitions and important notice broadcasts with development preview links.

---

## ?? Use of AI Agent & Pair Programming

> **Disclosure:** This project was architected, developed, and documented in collaboration with **Antigravity (Google DeepMind's Advanced Agentic Coding Assistant)**.

### How the AI Agent was Leveraged:
1. **System & Data Architecture:** Designing the granular `ComplaintHistory` audit trail model to ensure append-only event logging for every status and priority transition.
2. **Dynamic Overdue SLA Engine:** Formulating real-time computed overdue detection based on custom society threshold settings without requiring fragile background cron jobs for local runs.
3. **Full-Stack Implementation:** Generating modular TypeScript/Node.js Express backend APIs, Prisma ORM schemas, and modern React 18 + Tailwind CSS + Lucide + Recharts frontend interfaces.
4. **Resilient Notification Subsystem:** Implementing Nodemailer with automatic Ethereal Mail fallback so email previews can be inspected instantly in development without requiring external API credentials.
5. **Realistic Seeding:** Generating pre-configured test fixtures (Admin, multiple Residents, overdue tickets, in-progress tickets with rich history logs, and pinned notices).

---

## ??? Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts (analytics), Axios, Date-fns.
- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Multer (photo uploads), Nodemailer (email integration), bcryptjs, jsonwebtoken.
- **Database:** SQLite (default for zero-configuration local execution) / PostgreSQL ready.

---

## ?? Quick Start Guide

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+)

### 1. Clone & Setup
```bash
cd society-maintenance-tracker

# Install backend dependencies
cd backend
npm install

# Setup database & seed sample data
npx prisma db push
npm run seed

# Start backend server (runs on http://localhost:5000)
npm run dev
```

### 2. Start Frontend
Open a new terminal window:
```bash
cd society-maintenance-tracker/frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## ?? Demo Credentials

The database comes pre-seeded with realistic data for immediate evaluation:

| Role | Email | Password | Flat / Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@society.com` | `admin123` | Society Desk Admin |
| **Resident 1** | `john.doe@society.com` | `resident123` | Flat A-302 |
| **Resident 2** | `sarah.smith@society.com` | `resident123` | Flat B-504 |
| **Resident 3** | `rohit.sharma@society.com` | `resident123` | Flat C-101 |

*(Tip: You can also use the 1-click **"? Quick Demo Credentials"** buttons on the Login page!)*

---

## ?? Database Schema (Prisma)

```
+-------------------------------------------------------------+
¦                            User                             ¦
+-------------------------------------------------------------¦
¦ id (UUID, PK)                                               ¦
¦ name, email (Unique), password (Bcrypt Hash)                ¦
¦ role (RESIDENT | ADMIN)                                     ¦
¦ flatNumber, phone, createdAt, updatedAt                     ¦
+-------------------------------------------------------------+
                       ¦ 1:N
       +-------------------------------+
       ?                               ?
+---------------------------+   +---------------------------+
¦         Complaint         ¦   ¦          Notice           ¦
+---------------------------¦   +---------------------------¦
¦ id (UUID, PK)             ¦   ¦ id (UUID, PK)             ¦
¦ title, description        ¦   ¦ title, content            ¦
¦ category, flatNumber      ¦   ¦ category                  ¦
¦ photoUrl (Optional)       ¦   ¦ isImportant (Pinned)      ¦
¦ status (OPEN|IN_PROG|RES) ¦   ¦ authorId (FK -> User)     ¦
¦ priority (LOW|MED|HIGH)   ¦   ¦ createdAt, updatedAt      ¦
¦ residentId (FK -> User)   ¦   +---------------------------+
¦ createdAt, resolvedAt     ¦
+---------------------------+
               ¦ 1:N
               ?
+---------------------------+
¦     ComplaintHistory      ¦
+---------------------------¦
¦ id (UUID, PK)             ¦
¦ complaintId (FK -> Compl) ¦
¦ actorId (FK -> User)      ¦
¦ fromStatus, toStatus      ¦
¦ fromPriority, toPriority  ¦
¦ note, action, createdAt   ¦
+---------------------------+
```

---

## ?? REST API Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new resident account.
- `POST /api/auth/login` - Authenticate resident or admin; returns JWT token.
- `GET /api/auth/me` - Fetch authenticated user profile.

### Complaints (`/api/complaints`)
- `POST /api/complaints` - Resident creates complaint (supports `multipart/form-data` with photo).
- `GET /api/complaints/my` - Resident retrieves all their complaints with history.
- `GET /api/complaints` - Admin retrieves complaints with filters (`status`, `category`, `priority`, `isOverdue`, `search`, `startDate`, `endDate`).
- `GET /api/complaints/:id` - Fetch complaint detail with full history log.
- `PATCH /api/complaints/:id/status` - Admin updates complaint status (`OPEN`, `IN_PROGRESS`, `RESOLVED`) with note; triggers email.
- `PATCH /api/complaints/:id/priority` - Admin updates priority (`LOW`, `MEDIUM`, `HIGH`).

### Notices (`/api/notices`)
- `GET /api/notices` - Retrieve all notices (important pinned first).
- `POST /api/notices` - Admin publishes announcement (if `isImportant: true`, triggers resident broadcast email).
- `DELETE /api/notices/:id` - Admin removes notice.

### Dashboard & Analytics (`/api/dashboard`)
- `GET /api/dashboard/metrics` - Admin metrics: total, open, in-progress, resolved, overdue count, breakdown charts, and recent activity log.

### Settings (`/api/settings`)
- `GET /api/settings` - Retrieve system configuration (e.g., `overdueThresholdDays`).
- `PUT /api/settings` - Admin updates overdue threshold days.

---

## ?? Environment Configuration (`.env.example`)

```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-jwt-society-key-change-in-prod"
JWT_EXPIRES_IN="7d"

# Overdue threshold in days for complaints (Default: 3)
DEFAULT_OVERDUE_DAYS=3

# SMTP / Email Configuration (Optional - falls back to Ethereal / Preview URLs)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM="Society Admin <no-reply@societyportal.com>"
```

---

## ?? Deployment Instructions

### Deploy to Render / Railway / Supabase
1. **Database:** Create a PostgreSQL database on Supabase / Railway.
2. In `backend/prisma/schema.prisma`, update provider to `postgresql` and set `DATABASE_URL`.
3. Run `npx prisma db push && npm run seed`.
4. Deploy `backend` as Node.js web service.
5. Deploy `frontend` to **Vercel** or **Netlify** with `VITE_API_URL` pointing to backend URL.
