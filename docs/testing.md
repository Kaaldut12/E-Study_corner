# Testing & Quality Assurance Guide

This document details the automated testing architecture, test suites, execution commands, and verification guidelines for **E-Study Corner**.

---

## 1. Testing Philosophy

E-Study Corner emphasizes rapid, reliable, zero-dependency automated testing:
- **Zero Heavy External Dependencies**: Backend tests use Node.js's built-in test runner (`node:test`) and assertion module (`node:assert`), eliminating cumbersome overhead.
- **Hermetic Isolation**: Tests execute against an isolated in-memory data store instance, ensuring complete test independence, zero database pollution, and lightning-fast runs (~6 seconds).
- **Strict Linting & Type Hygiene**: Frontend codebases enforce zero ESLint warnings or errors prior to production builds.

---

## 2. Test Suite Overview

```
Backend/test/
├── auth.test.js      # Authentication, JWT, bcrypt, registration, and rate limiting
├── student.test.js   # Student course views, submissions, attendance, and leave workflows
├── teacher.test.js   # Teacher course authoring, grading, and attendance marking
└── admin.test.js     # Admin user management, role updates, system audits, and analytics
```

### Coverage Matrix:
| Test File | Test Suite Focus | Test Cases | Execution Time |
|---|---|:---:|:---:|
| `auth.test.js` | Login, registration, duplicate checks, token generation, 401 handling | 12 | ~1.5s |
| `student.test.js` | Course listing, enrollment, assignment submissions, attendance queries | 15 | ~1.8s |
| `teacher.test.js` | Course creation, assignment posting, submission grading, attendance | 14 | ~1.6s |
| `admin.test.js` | User listing, user suspension, role permissions, system health | 12 | ~1.4s |
| **Total** | **Full Backend Surface** | **53 Tests** | **~6.3s** |

---

## 3. Running Backend Tests

To run the full test suite from the repository root:

```bash
# Navigate to Backend
cd Backend

# Run all tests using Node.js built-in runner
npm test
```

### Sample Output:
```text
✔ Authentication Suite > Should register a new student successfully (122ms)
✔ Authentication Suite > Should reject duplicate email registration (45ms)
✔ Authentication Suite > Should log in student and return valid JWT (98ms)
✔ Authentication Suite > Should deny login with invalid password (42ms)
✔ Student Suite > Should fetch enrolled courses for student (64ms)
✔ Student Suite > Should record assignment submission (81ms)
✔ Teacher Suite > Should allow teacher to create new course (59ms)
✔ Teacher Suite > Should mark daily class attendance (73ms)
✔ Admin Suite > Should list all registered users (51ms)
✔ Admin Suite > Should update user status to active/suspended (47ms)

ℹ tests 53
ℹ suites 4
ℹ pass 53
ℹ fail 0
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 6342
```

---

## 4. Frontend Code Quality & Build Verification

The frontend ensures code correctness and production readiness via two commands:

### 4.1 Linting (`npm run lint`)
Enforces strict React 19 standards, hook dependencies (`react-hooks/exhaustive-deps`), and clean imports:
```bash
cd Frontend
npm run lint
```
*Criteria*: Must exit with code `0` and display **0 errors, 0 warnings**.

### 4.2 Production Build Verification (`npm run build`)
Tests asset compilation, module resolution, and Tailwind CSS transformation:
```bash
cd Frontend
npm run build
```
*Output*:
```text
vite v6.2.0 building for production...
transforming...
✓ 154 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   0.82 kB │ gzip:  0.43 kB
dist/assets/index-DkH3zH9I.css  106.73 kB │ gzip: 17.82 kB
dist/assets/index-BE4P48zS.js   777.60 kB │ gzip: 234.19 kB
✓ built in 7.96s
```

---

## 5. Pre-Commit / Pre-Release Checklist

Before releasing or deploying any new code:
1. [ ] Run `cd Backend && npm test` — All 53 tests must pass.
2. [ ] Run `cd Frontend && npm run lint` — Zero warnings or errors allowed.
3. [ ] Run `cd Frontend && npm run build` — Clean Vite production bundle generated.
4. [ ] Verify that environment variables match `.env.example` templates.
