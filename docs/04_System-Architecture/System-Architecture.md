# 🏛️ System Architecture — E-Study Corner (v2.1)

## 1. High-Level Architecture

E-Study Corner employs a clean, decoupled client-server architecture partitioned into three primary tiers:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Client Tier                     │
│  React 19 SPA · Vite 7 · TailwindCSS · Context Providers   │
│   (Student Portal, Teacher Portal, Admin/SuperAdmin Portal) │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON REST APIs
                               │ (Bearer JWT Authentication)
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend Application Tier                 │
│         Express 5 · Node.js 20+ Native Runtime              │
│  ├── Security Headers & Sanitization Middleware             │
│  ├── Rate Limiters (Auth: 20 req/15m; API: 120 req/1m)       │
│  ├── Role-Based Access Control (RBAC) Enforcement           │
│  ├── Centralized Controllers & Route Handlers               │
│  └── Hybrid DataStore (MongoDB + In-Memory Fallback)        │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose 9 ODM
                               │ Connection Pool / Reconnect
┌──────────────────────────────▼──────────────────────────────┐
│                    Data Persistence Tier                    │
│                 MongoDB Atlas Cluster / Replica             │
│  ├── High-Performance Indexes                               │
│  ├── Timestamps & Soft State Management                     │
│  └── Unique Email / ID Constraints                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Layer Architecture

```
Frontend/src/
├── services/
│   ├── api.js                # Single Axios instance with interceptors & base URL
│   ├── authService.js        # login, register, resetPassword, confirmResetPassword
│   ├── studentService.js     # courses, lessons, notes, bookmarks, quizzes, submissions
│   ├── teacherService.js     # course/lesson authoring, assignment grading, questions
│   ├── adminService.js       # user management, status toggle, analytics, materials
│   └── publicService.js      # announcements, public marquee, enquiries
├── components/               # Pure UI components (0 direct axios / fetch calls)
├── pages/                    # Role-partitioned route views
└── contexts/                 # Global state (AuthContext, ThemeContext)
```

### Architectural Guarantees:
- **Zero Direct HTTP Calls**: All HTTP requests are encapsulated inside `services/*.js`. No component invokes `fetch()` or imports `axios` directly.
- **Consistent Error Normalization**: Axios response interceptors parse backend error messages and prevent unexpected UI white-screens.
- **Safe State Handling**: Components handle empty array states gracefully without crashing when data has not yet been loaded.

---

## 3. Backend & Security Architecture

### Role-Based Access Control (RBAC)
Every route is strictly protected with two-stage middleware:
1. `verifyToken`: Validates and decodes the JWT signature, attaching `req.user` (`id`, `name`, `email`, `role`, `permissions`).
2. `requireRole(allowedRoles)`: Enforces role boundaries at the router level. For example:
   - `/student/*` permits only `'student'`
   - `/teacher/*` permits only `'teacher'`
   - `/admin/*` permits only `'admin'` and `'superadmin'`

### Security Defenses:
- **Strict Parameter Whitelisting**: `updateUser` permits only explicitly whitelisted fields (`name`, `department`, `course`, `mobileNo`, etc.). Direct escalation to `role: 'superadmin'` or unauthorized mutation of `id`/`email` is rejected.
- **Bcrypt Password Storage**: Passwords are encrypted before persisting to the database.
- **Hashed OTP Codes**: 6-digit password reset OTPs are hashed with `SHA-256` before storage, preventing plaintext disclosure in database logs.
- **Production CORS Restrictions**: Dynamic origin validation rejects untrusted external origins while strictly whitelisting configured origins and verified application deployment domains.

---

## 4. Database Indexing Strategy

To maintain $O(1)$ and $O(\log N)$ query performance under high concurrency, compound and single-field indexes are applied across key Mongoose collections:

| Collection | Schema Field(s) Indexed | Purpose |
|---|---|---|
| **User** | `{ email: 1 }` (unique)<br>`{ id: 1 }` (unique)<br>`{ role: 1 }`<br>`{ status: 1 }`<br>`{ role: 1, status: 1 }` | Fast authentication lookups and admin role filtering |
| **Enrollment** | `{ studentId: 1, courseId: 1 }` (unique)<br>`{ studentId: 1 }`<br>`{ courseId: 1 }` | Enforce single enrollment per course; fast retrieval of student enrollments |
| **Progress** | `{ studentId: 1, courseId: 1 }` (unique)<br>`{ studentId: 1 }` | Fast course progress and study streak lookups |
| **QuizAttempt** | `{ studentId: 1 }`<br>`{ quizId: 1 }`<br>`{ studentId: 1, quizId: 1 }` | Diagnostic performance analysis and attempt limit enforcement |
| **Bookmark** | `{ studentId: 1 }`<br>`{ studentId: 1, itemType: 1, itemId: 1 }` | Fast bookmark lookups and duplicate avoidance |
| **Submission** | `{ assignmentId: 1, studentId: 1 }`<br>`{ studentId: 1 }`<br>`{ assignmentId: 1 }`<br>`{ status: 1 }` | Fast assignment grading and student submission histories |
| **TeacherQuestion** | `{ studentId: 1 }`<br>`{ teacherId: 1 }`<br>`{ status: 1 }` | Academic doubts queries filtered by instructor or resolution status |
| **Note** | `{ studentId: 1 }`<br>`{ studentId: 1, isArchived: 1 }` | Personal student notes management |

---

## 5. Automated Testing Architecture

Automated testing is built natively on `node:test` and `node:assert/strict`:
- **Ephemeral Port Binding**: Each test runner instance launches an isolated Express listener on port `0` assigned dynamically by the operating system, eliminating port collision issues.
- **Isolated In-Memory Store**: In test mode (`NODE_ENV=test`), database requests operate via the built-in fast in-memory hybrid store, executing tests in milliseconds without requiring an external MongoDB instance.
- **53 Verified Test Cases**: Covers user registration, privilege escalation barriers, deterministic quiz scoring, grade boundary validation, user status toggles, and administrative governance.
