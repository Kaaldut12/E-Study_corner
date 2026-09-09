# 📚 E-Study Corner (v2.1 Architecture & Stability Release)

> A High-Performance, Production-Hardened E-Learning Platform built for **National Institute of Technology & Advanced Studies** — featuring role-based access control, zero-dependency testing, centralized service layers, and multi-tier security defenses.

[![CI Pipeline](https://github.com/Kaaldut12/E-Study_corder/actions/workflows/ci.yml/badge.svg)](https://github.com/Kaaldut12/E-Study_corder/actions)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![React Version](https://img.shields.io/badge/react-19-blue)
![Express Version](https://img.shields.io/badge/express-5.x-lightgrey)
![Tests](https://img.shields.io/badge/tests-53%20passed-success)

---

## 🏗️ Architectural Overview (v2.1)

E-Study Corner v2.1 adopts an **Independent Multi-Tier Application** architecture:
- **Root Repository**: Clean orchestration layer without nested monorepo workspace conflicts.
- **Backend Application (`/Backend`)**: Independent Node.js / Express 5 API with its own isolated `package-lock.json`, native `node:test` runner, Mongoose database indexes, and hardened security guards.
- **Frontend Application (`/Frontend`)**: Independent React 19 + Vite 7 SPA with centralized Axios API abstraction services, Tailwind CSS styling, dynamic theme engine, and zero direct HTTP leaks from UI components.

```
E-Study_corder/
│
├── Backend/                    # Standalone Backend Application
│   ├── controllers/            # Auth, Admin, Teacher, Student controllers
│   ├── models/                 # Mongoose schemas with high-performance indexes
│   ├── routes/                 # Express 5 route definitions with role middleware
│   ├── src/
│   │   ├── config/             # Environment (env.js) & DB connection (db.js)
│   │   ├── constants/          # Role permissions & access matrix
│   │   ├── middleware/         # Auth, Role guards, Rate limiter, Security headers
│   │   ├── services/           # DataStore hybrid engine, email service
│   │   └── utils/              # Bcrypt hashing, SHA-256 OTP hashing
│   ├── test/                   # 53 Automated tests across 4 workflow suites
│   ├── index.js                # Express app entry & CORS configuration
│   ├── package.json            # Isolated dependencies
│   └── package-lock.json       # Clean lockfile (no zombie dependencies)
│
├── Frontend/                   # Standalone Frontend Application
│   ├── src/
│   │   ├── services/           # Centralized API service layer (api.js, auth, admin, etc.)
│   │   ├── pages/              # Role-partitioned pages (Student, Teacher, Admin, Auth)
│   │   ├── components/         # Reusable UI widgets, Navbars, Modals
│   │   ├── contexts/           # AuthContext & ThemeContext
│   │   └── index.css           # Modern design system tokens & themes
│   ├── package.json            # Isolated dependencies
│   └── package-lock.json       # Clean lockfile
│
├── .github/workflows/ci.yml    # Independent CI/CD build, lint & test matrix
├── vercel.json                 # Cloud build orchestration
└── README.md                   # System documentation
```

---

## 🔐 Security & Hardening Features

1. **Strict Field Whitelisting**: `updateUser` strictly whitelists allowable profile modifications, blocking role escalation and unauthorized privilege elevation.
2. **Double-Hashed Passwords & OTPs**:
   - Passwords always hashed via `bcryptjs` with auto-encryption pre-save hooks and fallback protections.
   - 6-digit password reset OTPs are securely hashed using `SHA-256` before storage, preventing memory/database OTP inspection attacks.
3. **Restricted CORS Policy**:
   - Wildcard origins eliminated.
   - Production requests are restricted strictly to configured domains (`ALLOWED_ORIGINS`) and verified project domains (`e-study-corner*.vercel.app`).
4. **Zero Fake Numbers**: All diagnostics, overall scores, weak topics, and analytics are calculated directly from verified quiz attempts and submissions without `Math.random()` or hardcoded estimates.
5. **Database Indexing**: High-frequency queries (student enrollments, bookmarks, quiz attempts, progress, and teacher questions) are indexed across MongoDB collections for $O(1)$/$O(\log N)$ retrieval speeds.

---

## 🧪 Automated Testing Suite (`node:test`)

The backend includes 53 comprehensive integration tests utilizing Node's native test runner (zero external test dependencies required, sub-4 second execution time):

```bash
# Run all backend test suites
npm run test:backend

# Or from the Backend directory:
cd Backend
npm test
```

### Test Suites Included:
- **`test/auth.test.js`** (11 tests): Student self-registration, privilege escalation prevention, duplicate checks, login authentication, invalid credential rejection, token validation, and password reset OTP workflows.
- **`test/student.test.js`** (15 tests): Course discovery, enrollment verification, lesson completion tracking, streak calculation, quiz attempts scoring without question leaks, real weak-topic diagnostics, personal notes CRUD, and bookmark toggling.
- **`test/teacher.test.js`** (12 tests): Teacher authorization guards, dashboard metrics, course/lesson/quiz/assignment creation, score validation (rejecting negative scores and out-of-range points), and answering academic doubts.
- **`test/admin.test.js`** (15 tests): Admin authorization barriers, aggregate dashboard counters, platform analytics, user whitelisting, active/suspended status toggling, superadmin protection, support ticket resolution, and study material management.

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 20.x`
- MongoDB `>= 6.x` (or use built-in hybrid memory store for local testing)

### 1. Installation
Install dependencies for both projects:
```bash
# Install backend dependencies
npm run install:backend

# Install frontend dependencies
npm run install:frontend
```

### 2. Configure Environment Variables
Create `Backend/.env`:
```env
PORT=3001
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/e-study-corner
JWT_SECRET=your-secure-jwt-secret-min-32-chars-long
JWT_EXPIRATION=24h
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

Create `Frontend/.env`:
```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Running Development Servers
You can run services independently or via root orchestration scripts:
```bash
# Start Backend dev server (http://localhost:3001)
npm run dev:backend

# Start Frontend dev server (http://localhost:5173)
npm run dev:frontend
```

### 4. Database Seeder
Seed initial courses, lessons, quizzes, assignments, and test accounts:
```bash
npm run seed:backend
```

---

## 🔐 Default Platform Accounts

| Role | Email | Password | Permissions & Capabilities |
|---|---|---|---|
| **Super Admin** | `superadmin@estudy.com` | `SuperAdmin@123` | Master governance, role elevation, platform-wide purge |
| **Admin** | `admin@estudy.com` | `Admin@123` | Department management, study material, ticket resolution |
| **Teacher** | `teacher@estudy.com` | `Admin@123` | Course authoring, assignment grading, doubt resolutions |
| **Student** | `student@estudy.com` | `Admin@123` | Course learning, quiz exams, note-taking, submissions |

---

## 🎨 Design System & Theme Engine

Switch between curated themes in real-time via the top navigation bar:
- 🟣 **Indigo** *(Default)*: Slate / Indigo / Violet modern aesthetic
- 🟢 **Emerald**: Emerald / Teal / Cyan high-contrast palette
- 🟠 **Amber**: Amber / Orange / Warm dark mode
- 🌹 **Rose**: Rose / Fuchsia / Magenta vibrant dark mode

---

## 📄 License
ISC License — E-Study Corner Portal
