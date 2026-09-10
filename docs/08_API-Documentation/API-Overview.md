# API Overview & Route Specifications

The E-Study Corner Backend is built with **Express 5** and exposes a RESTful API. All endpoints return standardized JSON responses:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional status message"
}
```

Authentication is handled via JWT bearer tokens passed in the `Authorization` header (`Bearer <token>`).

---

## 1. Authentication & Security Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user and return JWT |
| `POST` | `/api/auth/logout` | Token | Invalidate current session |
| `GET` | `/api/auth/me` | Token | Fetch authenticated user profile |
| `POST` | `/api/auth/forgot-password` | Public | Generate and send hashed OTP for password reset |
| `POST` | `/api/auth/verify-otp` | Public | Validate 6-digit SHA-256 hashed OTP |
| `POST` | `/api/auth/reset-password` | Public | Reset password using verified OTP |
| `POST` | `/api/auth/change-password` | Token | Update password from user profile |

---

## 2. Student Portal Routes (`/api/student`)

| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/student/dashboard` | `student` | Aggregate KPIs, streaks, and enrolled courses |
| `GET` | `/api/student/courses` | `student` | Course catalog with student enrollment status |
| `POST` | `/api/student/courses/:id/enroll` | `student` | Enroll in an active course |
| `POST` | `/api/student/courses/:cId/lessons/:lId/complete` | `student` | Mark lesson completed & update progress |
| `GET` | `/api/student/quizzes/:quizId` | `student` | Fetch quiz questions (without answers) |
| `POST` | `/api/student/quizzes/submit` | `student` | Submit quiz attempt & compute diagnostic score |
| `GET` | `/api/student/weak-topics` | `student` | Calculate weak topics from actual quiz history |
| `GET` | `/api/student/assignments` | `student` | List assignments with submission status |
| `POST` | `/api/student/submit/:assignmentId` | `student` | Submit coursework with file attachment |
| `GET` | `/api/student/assignments/download/:filename` | `student` | Stream assignment reference attachment |
| `GET` | `/api/student/notes` | `student` | Personal notes CRUD |
| `POST` | `/api/student/questions` | `student` | Submit academic doubt to course teacher |

---

## 3. Teacher Portal Routes (`/api/teacher`)

| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/teacher/dashboard` | `teacher`, `admin` | Instructor metrics, coursework, pending leaves count |
| `GET` | `/api/teacher/students` | `teacher`, `admin` | Class roster with submission and performance stats |
| `GET` | `/api/teacher/students/:studentId/details` | `teacher`, `admin` | Comprehensive student profile, submissions, leaves, attendance, and doubts |
| `GET` | `/api/teacher/assignments` | `teacher`, `admin` | List authored coursework assignments |
| `POST` | `/api/teacher/assignments` | `teacher`, `admin` | Publish new assignment with deadline & attachments |
| `GET` | `/api/teacher/submissions/:assignmentId` | `teacher`, `admin` | List student submissions for an assignment |
| `POST` | `/api/teacher/submissions/:id/grade` | `teacher`, `admin` | Grade student submission with score & feedback |
| `GET` | `/api/teacher/submissions/:id/file` | `teacher`, `admin` | Stream student submission solution file |
| `GET` | `/api/teacher/courses` | `teacher`, `admin` | Manage authored courses |
| `POST` | `/api/teacher/courses` | `teacher`, `admin` | Create new course |
| `POST` | `/api/teacher/lessons` | `teacher`, `admin` | Add lesson to course |
| `POST` | `/api/teacher/quizzes` | `teacher`, `admin` | Create quiz for course |
| `GET` | `/api/teacher/questions` | `teacher`, `admin` | List academic doubts submitted by students |
| `POST` | `/api/teacher/questions/:id/reply` | `teacher`, `admin` | Reply to student academic doubt |

---

## 4. Attendance Routes (`/api/attendance`)

| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/attendance/check-in` | `student`, `teacher` | Daily attendance check-in & streak increment |
| `GET` | `/api/attendance/my-stats` | `student`, `teacher` | Current streak, present count, rate percentage |
| `GET` | `/api/attendance/my-logs` | `student`, `teacher` | 30-day attendance history log |
| `GET` | `/api/attendance/student/:studentId` | `teacher`, `admin` | Student attendance profile & complete log history |
| `POST` | `/api/attendance/mark-student` | `teacher`, `admin` | Manual attendance override for any student/date |

---

## 5. Leave Management Routes (`/api/leaves`)

| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/leaves/apply` | `student`, `teacher` | Submit new leave application |
| `GET` | `/api/leaves/my-leaves` | `student`, `teacher` | Fetch user's own leave applications |
| `GET` | `/api/leaves/all` | `teacher`, `admin` | Audit campus leave requests with role & status filters |
| `PATCH` | `/api/leaves/:id/status` | `teacher`, `admin` | Approve or reject leave with evaluator remarks |

---

## 6. Administration Routes (`/api/admin`)

| Method | Endpoint | Roles | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | `admin`, `superadmin` | Campus-wide metrics, leaves, enquiries, and triage queues |
| `GET` | `/api/admin/analytics` | `admin`, `superadmin` | Platform analytics & department breakdown |
| `GET` | `/api/admin/users` | `admin`, `superadmin` | Complete user directory |
| `POST` | `/api/admin/users` | `admin`, `superadmin` | Create new user account |
| `PUT` | `/api/admin/users/:id` | `admin`, `superadmin` | Update user details and granular permissions |
| `PATCH` | `/api/admin/users/:id/status` | `admin`, `superadmin` | Toggle active vs. suspended user account status |
| `DELETE` | `/api/admin/users/:id` | `admin`, `superadmin` | Delete user account (superadmin protected) |
| `POST` | `/api/admin/notifications` | `admin`, `superadmin` | Broadcast campus announcement |
| `POST` | `/api/admin/action/resync` | `admin`, `superadmin` | Verify database collections & sync status |
