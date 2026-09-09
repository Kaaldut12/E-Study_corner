# 📚 E-Study Corner (v2.2 Production & Governance Release)

> A High-Performance, Full-Stack E-Learning & Academic Governance Platform built for **National Institute of Technology & Advanced Studies** — featuring role-based access control, coursework file upload/download streaming, automated attendance tracking with faculty overrides, multi-tier leave management, universal student action governance, dynamic multi-theme glassmorphic styling, and zero-dependency integration testing.

[![CI Pipeline](https://github.com/Kaaldut12/E-Study_corder/actions/workflows/ci.yml/badge.svg)](https://github.com/Kaaldut12/E-Study_corder/actions)
![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![React Version](https://img.shields.io/badge/react-19-blue)
![Vite Version](https://img.shields.io/badge/vite-7-purple)
![Express Version](https://img.shields.io/badge/express-5.x-lightgrey)
![Tests](https://img.shields.io/badge/tests-53%2B%20passed-success)

---

## 🌟 What's New in v2.2

1. **Coursework File Upload & Download System**:
   - Instructors attach homework and assignment reference files (`.pdf`, `.docx`, `.zip`, `.png`, `.jpg`).
   - Students upload completed coursework solutions with live client-side progress bars.
   - Secure server-side streaming download pipeline (`/api/student/assignments/download/:filename` and `/api/teacher/submissions/:id/file`) with path traversal guards and MIME detection.

2. **Real-Time Attendance Engine & Daily Check-In**:
   - One-click **"Mark as Attendance"** widget on student and faculty dashboards with interactive flame streak counters (`🔥 Xd`).
   - Real-time monthly attendance rate computation and historical calendar logs.
   - **Faculty & Admin Attendance Overrides**: Instructors and administrators can record or update student attendance for any date (`Present`, `Absent`, `Excused`) with official administrative remarks.

3. **Multi-Tier Campus Leave Management**:
   - Students apply for academic, medical, or casual leave (`/student/leave`).
   - Faculty members apply for official leaves (`/teacher/leave`).
   - Dedicated review hubs with live filters (`Pending`, `Approved`, `Rejected`), search query capabilities, and custom decision remarks for Teachers and Administrators.

4. **Universal Student Action Governance Hub**:
   - Unified 4-tab Governance Console in `ManageStudents.jsx` accessible by both **Teachers** (`/teacher/students`) and **Administrators** (`/admin/students`):
     1. 🏖️ **Leaves**: Audit and approve/reject student leave requests.
     2. 📝 **Coursework**: Preview submissions, download solution files, and grade with numeric scores and qualitative feedback.
     3. 📅 **Attendance**: View streaks, rates, and record manual date/status overrides.
     4. 💬 **Doubts (Q&A)**: Review student academic queries and publish official solutions.
   - Deep-linking from the Admin User Directory (`/admin/users`) via direct **`⚡ Manage Actions`** shortcuts.

5. **Ultra-Modern UI & Layout Architecture**:
   - **True Fixed Sidebar**: Permanently anchored on desktop (`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)]`) with `lg:pl-64` content offset and internal scrollbar, ensuring zero page-scroll displacement.
   - **Dynamic 4-Color Theme Engine**: Real-time switching between Indigo, Emerald, Amber, and Rose with dynamic CSS variables, ambient gradient blobs, and glassmorphic cards.
   - **Modern Typography**: Google Fonts `Outfit` (headings) and `Inter` (body and data tables).

---

## 🏗️ Architectural Overview

E-Study Corner adopts an **Independent Multi-Tier Application** architecture:

```
E-Study_corder/
│
├── Backend/                    # Standalone Express 5 & Node.js Backend Application
│   ├── controllers/            # Auth, Admin, Teacher, Student, Attendance, Leaves
│   ├── models/                 # Mongoose schemas with high-performance indexes
│   │   ├── User.js, Course.js, Assignment.js, Submission.js,
│   │   ├── Attendance.js, Leave.js, TeacherQuestion.js, etc.
│   ├── routes/                 # Express 5 route definitions with role middleware
│   │   ├── authRoutes.js, studentRoutes.js, teacherRoutes.js,
│   │   ├── adminRoutes.js, attendanceRoutes.js, leaveRoutes.js
│   ├── src/
│   │   ├── config/             # Environment (env.js) & DB connection (db.js)
│   │   ├── constants/          # Role permissions & access control matrix
│   │   ├── middleware/         # Auth, Role guards, Validation, Rate limiter
│   │   ├── services/           # DataStore hybrid engine, emailService, file storage
│   │   └── utils/              # Bcrypt hashing, SHA-256 OTP hashing
│   ├── test/                   # 53+ Automated integration tests
│   ├── index.js                # Express app entry & CORS configuration
│   └── package.json            # Isolated backend dependencies
│
├── Frontend/                   # Standalone React 19 + Vite 7 SPA
│   ├── src/
│   │   ├── components/         # Reusable UI widgets, Navbars, SidebarLayout, Modals
│   │   │   ├── common/         # AttendanceWidget, SidebarLayout, ErrorBoundary
│   │   │   └── Navbar.jsx      # Sticky top-0 z-50 navigation bar with theme picker
│   │   ├── contexts/           # AuthContext & Theme state
│   │   ├── pages/              # Role-partitioned page components
│   │   │   ├── Student/        # StudentDashboard, ViewAssignments, SubmitAssignment,
│   │   │   │                   # ApplyLeave, AICoach, Quizzes, Courses, Progress
│   │   │   ├── Teacher/        # TeacherDashboard, ManageStudents, CreateAssignment,
│   │   │   │                   # ViewSubmissions, TeacherLeaves, TeacherQuestions
│   │   │   ├── Admin/          # AdminDashboard, UserManagement, LeaveManagement,
│   │   │   │                   # PlatformAnalytics, NotificationManagement, SystemHealth
│   │   │   └── Auth/           # LoginForm, Register, ResetPassword
│   │   ├── services/           # Centralized Axios API abstraction layer
│   │   ├── utils/              # fileDownload.js (streaming downloader)
│   │   └── index.css           # Modern design system tokens, animations & themes
│   ├── package.json            # Isolated frontend dependencies
│   └── vite.config.js          # Vite 7 build configuration
│
├── docs/                       # Complete project documentation repository
│   ├── 01_Project-Overview/    # Vision, core features, roadmap
│   ├── 02_Product-Requirements/# PRD, user stories, user roles matrix
│   ├── 03_UI-UX/               # Design system, themes, navigation structure
│   ├── 04_System-Architecture/ # Architecture diagrams, dataflow
│   ├── 08_API-Documentation/   # Comprehensive REST API specifications
│   ├── 09_Features/            # Feature deep dives (Leaves, Attendance, Governance)
│   └── 10_Admin-Panel/         # Admin command center & user governance
├── docker-compose.yml          # Containerized orchestration
└── README.md                   # System documentation
```

---

## 🔐 Security & Hardening

1. **Role-Based Access Control (RBAC)**: Enforced via `requireRole(['student', 'teacher', 'admin', 'superadmin'])` with automatic hierarchical privileges for superadmins.
2. **Double-Hashed Passwords & OTPs**:
   - User passwords encrypted via `bcryptjs` with auto-hashing pre-save hooks.
   - 6-digit password reset OTPs hashed with `SHA-256` prior to database storage, preventing memory/database inspection attacks.
3. **Whitelisted User Modifications**: `updateUser` strictly blocks unauthorized privilege elevation and role escalation.
4. **Restricted CORS Policy**: Production requests restricted to configured origins (`ALLOWED_ORIGINS`).
5. **Safe File Uploads & Streaming**: File uploads validate MIME types and file extensions, while downloads stream through sanitized path resolvers preventing directory traversal.

---

## 🧪 Automated Testing Suite (`node:test`)

The backend includes 53+ automated integration tests executing directly on Node's native test runner (zero external testing dependencies, executes in under 3 seconds):

```bash
# Run all backend test suites from repository root:
npm run test:backend

# Or from the Backend directory:
cd Backend
npm test
```

### Test Suites Included:
- **`test/auth.test.js`**: Registration, login, duplicate email prevention, role escalation barriers, token verification, and OTP reset flows.
- **`test/student.test.js`**: Course discovery, enrollment verification, lesson progress tracking, streak counting, quiz evaluation without answer leaks, weak-topic diagnostics, and notes CRUD.
- **`test/teacher.test.js`**: Authorization guards, dashboard metrics, course/lesson/quiz/assignment creation, out-of-range grade rejection, and academic doubts resolution.
- **`test/admin.test.js`**: Platform analytics, user directory management, status toggling (active/suspended), superadmin safeguards, and helpdesk triage.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 20.x`
- **npm**: `>= 10.x`
- **MongoDB**: `>= 6.x` (or built-in hybrid data store for zero-setup local testing)

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
```bash
# Start Backend dev server (http://localhost:3001)
npm run dev:backend

# Start Frontend dev server (http://localhost:5173)
npm run dev:frontend
```

---

## 🔑 Default Platform Accounts

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **Super Admin** | `superadmin@estudy.com` | `SuperAdmin@123` | Platform-wide master governance, full role & permission configuration |
| **Admin** | `admin@estudy.com` | `Admin@123` | Institutional dashboard, student action governance, leave approvals, user audits |
| **Teacher** | `teacher@estudy.com` | `Admin@123` | Course authoring, student action console, coursework grading, leave review |
| **Student** | `student@estudy.com` | `Admin@123` | Course learning, coursework submission & downloads, daily check-in, leave application |

---

## 🎨 Design System & Theme Engine

Switch between 4 themes dynamically via the top navigation bar:
- 🟣 **Indigo** *(Default)*: Slate / Indigo / Electric Violet modern aesthetic
- 🟢 **Emerald**: Cybernetic Teal / Emerald / Cyan high-contrast palette
- 🟠 **Amber**: Solar Amber / Gold / Warm dark mode
- 🌹 **Rose**: Neon Rose / Crimson / Magenta vibrant dark mode

---

## 📄 License
ISC License — E-Study Corner Platform
