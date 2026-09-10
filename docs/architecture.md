# 🏛️ System Architecture — E-Study Corner

## Overview

E-Study Corner is an enterprise-grade, full-stack Academic Learning Management and Governance Platform. It is engineered with a clean separation of concerns across presentation, API routing, business controllers, services, and data persistence layers.

---

## 1. High-Level System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                │
│           React 19 SPA + Vite 7 + Tailwind CSS v4 (@theme)               │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                        HTTPS / JSON REST API / JWT
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                        EXPRESS 5 API GATEWAY                            │
│                                                                         │
│  [Middleware Pipeline]                                                  │
│   ├── Security Headers (HSTS, CSP, X-Frame-Options, COOP, CORP)        │
│   ├── Sliding-Window Rate Limiter (240 req/min API, 60/5min Auth)       │
│   ├── Input Script Sanitizer (XSS Mitigation)                           │
│   ├── CORS Origin Validator (Vercel previews + local domain matching)  │
│   └── Database Readiness & Strict 503 Guard                            │
│                                                                         │
│  [Controller & Routing Tier]                                            │
│   ├── Auth Controller       → Login, Register, OTP Password Reset       │
│   ├── Student Controller    → Courses, Lessons, Quizzes, Notes, Doubts │
│   ├── Teacher Controller    → Course Authoring, Submissions, Grading    │
│   ├── Admin Controller      → User Directory, Broadcasts, Diagnostics  │
│   ├── Attendance Controller → Daily Check-In, Streaks, Overrides        │
│   ├── Leave Controller      → Multi-Tier Campus Leave Approvals        │
│   └── File Controller       → Secure Streamed Assignment Uploads        │
│                                                                         │
│  [Service & Data Layer]                                                 │
│   ├── dataStore.js          → Unified Repository & Data Access Service  │
│   ├── emailService.js       → Password Reset OTP Notification Pipeline  │
│   └── password.js           → Bcrypt Hashing, Verification & Migration  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                Mongoose 9 / ODM
                                     │
┌────────────────────────────────────▼────────────────────────────────────┐
│                            PERSISTENCE                                  │
│   MongoDB Replica Set (14 Indexed Schemas: User, Course, Assignment,    │
│   Submission, Attendance, Leave, Quiz, Question, QuizAttempt, etc.)     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layered Responsibilities

### Presentation Layer (`Frontend/`)
- Built with **React 19** and **Vite 7** for rapid compilation and hot module replacement.
- State is compartmentalized using React Context (`AuthContext`) for user session and role data, alongside localized state hooks (`useState`, `useCallback`, `useEffect`).
- Component architecture is split into reusable layouts (`SidebarLayout`), shared feedback widgets (`SkeletonLoader`), and role-partitioned views (`pages/Student`, `pages/Teacher`, `pages/Admin`).

### API Gateway Layer (`Backend/`)
- Powered by **Express 5**.
- Central entry point `Backend/index.js` mounts canonical routes under `/api/*` and applies defense-in-depth middleware before dispatching requests to controllers.
- Validates token claims and enforces role access (`verifyToken`, `requireRole`).

### Business Logic & Controller Layer (`Backend/controllers/`)
- Controllers handle HTTP request parsing, payload validation, business rule execution, and response normalization.
- Enforces strict resource ownership rules (e.g. teachers may only grade assignments for courses they instruct; students may only view their own notes and submissions).

### Data Layer (`Backend/src/services/dataStore.js` & `Backend/models/`)
- Provides unified data access methods.
- Interacts directly with **Mongoose 9** models when connected to MongoDB.
- In development/offline testing, supports strict fail-safe validation. In production environments (`NODE_ENV === 'production'`), it enforces real database connectivity and returns explicit 503 `DATABASE_UNAVAILABLE` status codes if the database cluster is unreachable.
