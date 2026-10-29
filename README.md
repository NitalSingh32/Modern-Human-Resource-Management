# StaffSync – Modern Human Resource Management Solution

A modern, responsive, full-stack Human Resource Management System (HRMS) built on the MERN architecture with enterprise role-based access control, live attendance punch clock, multi-tier leave approval workflows, employee directory CRUD, corporate notice bulletin, and skill training programs.

---

## 🌟 Key Features

### 1. Role-Based Access Control (RBAC)
- **HR Administrator (`admin`)**:
  - Full workforce oversight dashboard (total employees, present today, absent today, pending leaves).
  - Complete Employee management: Add, edit, search, filter, and delete employees.
  - Department and designation management with operating budget tracking.
  - Organization-wide attendance log with CSV timesheet export.
  - Leave approval / rejection workflows with automated balance deduction.
  - Company announcement broadcast board with priority tags (`Urgent`, `Important`, `Normal`) and pinning.
  - Training and development program creation and cohort assignment.
  - Executive workforce analytics & charts (attendance velocity, department distribution, leave utilization).

- **Manager (`manager`)**:
  - Manager leadership hub with direct reports headcount, team attendance, and pending team leaves.
  - Team roster directory with job titles and contact info.
  - Review and approve or reject team leave requests with manager feedback notes.
  - Monitor daily team attendance logs.
  - Create and manage team training programs and track participant progress.

- **Employee (`employee`)**:
  - Personal workspace dashboard with live punch terminal.
  - Daily check-in and check-out with automatic work hours computation and location tag.
  - Personal attendance history log.
  - Leave quota balances (Paid PTO, Sick Leave, Casual Leave).
  - Submit leave requests with automatic day calculation and validation against remaining balance.
  - Track leave approval status (`Pending`, `Approved`, `Rejected`) and reviewer notes.
  - Interactive training progress tracker with celebration animations.
  - View permitted profile information and update contact/emergency info.

---

## 🔑 Pre-seeded Demo Accounts

StaffSync includes three ready-to-test accounts pre-configured with bcrypt password hashes. On the login screen, you can also use the **1-Click Demo Profiles** or top-bar role switcher to instantly switch perspectives:

| Role | Email | Password | Default Persona |
| :--- | :--- | :--- | :--- |
| **HR Administrator** | `admin@staffsync.io` | `admin123` | Sarah Jenkins (Head of People & Culture) |
| **Manager** | `manager@staffsync.io` | `manager123` | Marcus Vance (VP of Engineering) |
| **Employee** | `employee@staffsync.io` | `employee123` | Elena Rostova (Senior Frontend Engineer) |

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Recharts (analytics & visualization), Canvas-Confetti
- **Backend**: Node.js & Express 4.21, REST APIs, JSON Web Tokens (JWT)
- **Database & ODM**: MongoDB & Mongoose 9.1 with duplicate attendance compound index and schema models
- **Security**: bcrypt password hashing, Bearer JWT authorization middleware, backend role verification

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- MongoDB (optional, running locally at `mongodb://localhost:27017/staffsync` or MongoDB Atlas)

### Setup Steps

1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd staffsync
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` to customize settings:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/staffsync
   JWT_SECRET=staffsync_enterprise_jwt_super_secret_key_2026_secure
   ```
   *Note: If MongoDB is not running locally, StaffSync's embedded MERN data engine automatically initializes in-memory with pre-seeded data, ensuring full functionality immediately.*

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The app will run at `http://localhost:3000`.

5. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

---

## 📂 Project Structure

```
├── server.ts                  # Express full-stack entry point & Vite middleware
├── server/
│   ├── config/                # Database configuration
│   ├── models/                # Mongoose Models (User, Employee, Attendance, etc.)
│   ├── middleware/            # JWT authentication & role-based access guards
│   ├── routes/                # RESTful API endpoints (/api/*)
│   ├── services/dataStore.ts  # Unified data engine with Mongoose ODM & fallback
│   ├── seedData.ts            # Realistic workforce seed generator
│   └── types.ts               # Server TypeScript interfaces
├── src/
│   ├── components/
│   │   ├── common/            # StatsCard, Badge, Modal, DatabaseStatusModal
│   │   └── layout/            # Sidebar, Navbar, AppLayout
│   ├── context/               # AuthContext (JWT, Login, Logout, Role Demo Switch)
│   ├── pages/                 # Role dashboards, Employees, Attendance, Leaves, etc.
│   ├── services/api.ts        # Typed API client with token interceptors
│   ├── types.ts               # Frontend TypeScript interfaces
│   ├── App.tsx                # Client router & role permissions
│   ├── main.tsx               # React entry point
│   └── index.css              # Tailwind styling & typography
└── README.md
```

---

## 🔒 Security & Data Integrity

- **Backend Role Enforcement**: Routes are guarded using `requireRole(['admin'])` or `requireRole(['admin', 'manager'])`. Unauthorized actions yield `403 Forbidden`.
- **Attendance Anti-Duplicate Rule**: A user cannot log multiple check-ins on the same calendar day.
- **Leave Balance Safeguard**: Leave applications verify that the requested duration does not exceed the employee's remaining quota for that leave type.
