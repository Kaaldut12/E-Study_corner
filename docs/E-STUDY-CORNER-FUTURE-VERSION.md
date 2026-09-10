# E-Study Corner — V2 Architecture & Learning System Master Document

## 1. Project Vision
A unified, production-ready Learning Management System (LMS) where students discover courses, study materials, create notes, practice quizzes, track verified progress through lesson completion, and collaborate with teachers.

---

## 2. Production Architecture (V2)

```
Client (Browser)
   ↓
Frontend React Services Layer (studentService, teacherService, adminService, authService)
   ↓
Axios Interceptor Gateway (JWT Bearer, auto-logout on expiry, error normalization)
   ↓
CORS & OWASP Security Headers (strict origins, rate limiting, sanitization)
   ↓
Authentication & Authorization (verifyToken, requireRole)
   ↓
Validation Middleware (validateCourse, validateAssignment, validateGrade, validateSubmission)
   ↓
Controllers (studentControllers, teacherController, adminController, authController)
   ↓
Data Services (dataStore)
   ↓
Mongoose Models & MongoDB (Single Source of Truth)
```

---

## 3. Core Learning Workflow (Sprint 5)

The educational lifecycle is fully connected:

1. **Course Publishing**: Instructor creates a course with subject, year, module structure, and lessons.
2. **Course Enrollment**: Student enrolls via `POST /api/student/courses/:courseId/enroll`, creating an active `Enrollment` record.
3. **Lesson Consumption & Completion**: Student studies lessons and marks them complete via `POST /api/student/courses/:courseId/lessons/:lessonId/complete`.
4. **Dynamic Progress Calculation**: Progress percentage is calculated dynamically based on verified completed lessons against total course lessons (`(completedCount / totalLessons) * 100`).
5. **Course Completion**: When all lessons are marked completed, the enrollment transitions to `completed` status with a verified timestamp.

---

## 4. Security & Environment Configuration (Sprint 1)

- **Strict Environment Validation**: `Backend/src/config/env.js` validates that `JWT_SECRET` and `MONGODB_URI` are defined. In production, missing secrets fail immediately on startup.
- **Git Ignore Security**: `.env`, `.env.*`, `.env.local` are strictly gitignored in root, Backend, and Frontend. Only `.env.example` templates remain in Git.
- **Docker Secrets**: `docker-compose.yml` uses environment variable substitution (`${JWT_SECRET}`, `${MONGODB_URI}`) rather than hardcoded keys.
- **Strict CORS Origin Control**: The API explicitly whitelists configured frontend origins (`FRONTEND_URL`) and forbids open wildcard subdomains in production.
- **Firebase Clean-Up**: Removed unused, half-configured Firebase Admin code and dependencies to prevent runtime crashes and dependency bloat.

---

## 5. Database Architecture & Decoupled Seeding (Sprint 2)

- **MongoDB as Single Source of Truth**: The legacy RAM fallback store has been eliminated. All operations query and persist directly to MongoDB.
- **Decoupled Seeding**: Server startup (`connectDB()`) solely connects to MongoDB without running heavy auto-upsert routines on every reboot.
- **Explicit Seeding Script**: Dedicated CLI script `Backend/src/seed/seedDatabase.js` (`npm run seed`) synchronizes all 17 database collections (including `TeacherQuestion`).
- **Database Indexes**: Added optimized compound and unique indexes on `User`, `Course`, `Lesson`, `Assignment`, `Submission`, `Enrollment`, and `Progress`.

---

## 6. Frontend Unified Service Layer (Sprint 4)

All frontend components interact with the backend exclusively through unified service modules:
- `Frontend/src/services/studentService.js`: Course discovery, enrollment, lesson completion, assignments, notes, quizzes, doubts, bookmarks.
- `Frontend/src/services/teacherService.js`: Course creation, assignments, submissions, grading, question replies.
- `Frontend/src/services/adminService.js`: Analytics, user administration, system health, broadcasts, enquiries.
- `Frontend/src/services/authService.js`: Authentication, session verification, password resets.

---

## 7. CI/CD Pipeline Standards

The GitHub Actions workflow (`.github/workflows/ci.yml`) enforces:
1. Backend syntax and entrypoint verification (`node --check index.js`, `node --check seed.js`, `node --check src/services/dataStore.js`).
2. Frontend linting with zero tolerance for errors (`npm run lint`).
3. Production Vite build compilation (`npm run build`).
