# 🔌 API Documentation — E-Study Corner

## Overview

All API endpoints are mounted under the canonical base prefix `/api/`. All authenticated endpoints require a valid JWT passed in the HTTP Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 1. Authentication & Profile Endpoints (`/api/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates user credentials & issues JWT token. |
| `POST` | `/api/auth/register` | Public | Registers a new student account. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves the authenticated user's current profile. |
| `PUT` | `/api/auth/profile` | Authenticated | Updates personal information (name, mobile, address, course). |
| `POST` | `/api/auth/change-password` | Authenticated | Updates account password securely with verification. |
| `POST` | `/api/auth/reset-password` | Public | Generates and emails a 6-digit OTP for password recovery. |
| `POST` | `/api/auth/confirm-reset-password` | Public | Verifies OTP code and sets the new account password. |

---

## 2. Student Portal Endpoints (`/api/student`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/student/dashboard` | Student | Retrieves dashboard metrics, active courses, and notices. |
| `GET` | `/api/student/courses` | Student | Lists available courses with enrollment status. |
| `GET` | `/api/student/courses/:id` | Student | Fetches detailed course syllabus and lesson lists. |
| `POST` | `/api/student/courses/:id/enroll` | Student | Enrolls the student in the target course. |
| `POST` | `/api/student/courses/:id/lessons/:lessonId/complete` | Student | Marks a lesson completed and updates progress. |
| `GET` | `/api/student/assignments` | Student | Lists assigned coursework and submission status. |
| `POST` | `/api/student/assignments/:id/submissions` | Student | Submits coursework solution with text and file attachment. |
| `GET` | `/api/student/quizzes/:id` | Student | Fetches quiz questions (omits correct answers for integrity). |
| `POST` | `/api/student/quizzes/submit` | Student | Evaluates quiz responses and records score. |
| `GET` | `/api/student/weak-topics` | Student | Analyzes quiz performance to identify areas for improvement. |
| `GET` | `/api/student/notes` | Student | Retrieves student personal notes. |
| `POST` | `/api/student/notes` | Student | Creates a new personal note. |
| `PUT` | `/api/student/notes/:id` | Student | Updates an existing personal note. |
| `DELETE` | `/api/student/notes/:id` | Student | Deletes a personal note. |
| `GET` | `/api/student/bookmarks` | Student | Lists bookmarked lessons and study materials. |
| `POST` | `/api/student/bookmarks/toggle` | Student | Toggles bookmark state for a target entity. |
| `GET` | `/api/student/questions` | Student | Fetches academic doubts submitted to faculty. |
| `POST` | `/api/student/questions` | Student | Submits an academic question to a specific instructor. |
| `GET` | `/api/student/study-material` | Student | Downloads study materials, question banks, and notes. |
| `GET` | `/api/student/feedback` | Student | Retrieves graded assignment feedback and instructor marks. |
| `POST` | `/api/student/contact-admin` | Student | Sends an inquiry or support ticket to platform administrators. |

---

## 3. Teacher Portal Endpoints (`/api/teacher`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/teacher/dashboard` | Teacher | Retrieves instructor stats, course counts, and pending grades. |
| `GET` | `/api/teacher/courses` | Teacher | Lists courses created and instructed by the teacher. |
| `POST` | `/api/teacher/courses` | Teacher | Authors a new academic course. |
| `POST` | `/api/teacher/lessons` | Teacher | Adds a new lesson and content to an owned course. |
| `GET` | `/api/teacher/assignments` | Teacher | Lists teacher's assignments and submission counts. |
| `POST` | `/api/teacher/assignments` | Teacher | Publishes a new assignment for enrolled students. |
| `GET` | `/api/teacher/submissions` | Teacher | Lists student submissions across instructed courses. |
| `POST` | `/api/teacher/submissions/:id/grade` | Teacher | Evaluates a submission with numeric marks and feedback. |
| `GET` | `/api/teacher/students` | Teacher | Retrieves student roster for courses taught. |
| `GET` | `/api/teacher/students/:id/details` | Teacher | Fetches comprehensive student history (attendance, leaves, grades). |
| `GET` | `/api/teacher/questions` | Teacher | Retrieves student doubts directed to the instructor. |
| `POST` | `/api/teacher/questions/:id/reply` | Teacher | Submits official instructor response to student question. |

---

## 4. Admin & Governance Endpoints (`/api/admin`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/dashboard` | Admin | Fetches system overview KPI metrics and operational stats. |
| `GET` | `/api/admin/users` | Admin | Lists platform users with filtering and role query options. |
| `POST` | `/api/admin/users` | Admin | Creates a new student, teacher, or administrator account. |
| `PUT` | `/api/admin/users/:id` | Admin | Updates user role, status, or contact details. |
| `DELETE` | `/api/admin/users/:id` | Admin | Deactivates or removes a user account. |
| `GET` | `/api/admin/analytics` | Admin | Fetches system enrollment trends and performance graphs. |
| `GET` | `/api/admin/health` | Admin | Returns live Node.js process runtime and memory statistics. |
| `GET` | `/api/admin/notifications` | Admin | Lists broadcast marquee notifications. |
| `POST` | `/api/admin/notifications` | Admin | Publishes a new marquee ticker alert. |
| `DELETE` | `/api/admin/notifications/:id` | Admin | Removes a marquee notification. |
| `GET` | `/api/admin/messages` | Admin | Retrieves support tickets and user feedback. |
| `PUT` | `/api/admin/messages/:id` | Admin | Resolves a support ticket with admin remarks. |
| `GET` | `/api/admin/enquiries` | Admin | Lists website admissions inquiries. |
| `POST` | `/api/admin/send-email` | Admin | Sends broadcast notification emails to student cohorts. |

---

## 5. Attendance & Leave Endpoints (`/api/attendance`, `/api/leaves`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/attendance/summary` | Authenticated | Fetches attendance rate, current streak, and monthly logs. |
| `POST` | `/api/attendance/mark` | Authenticated | Records daily attendance check-in for the current user. |
| `POST` | `/api/attendance/override` | Teacher/Admin | Records or modifies manual attendance status for a student. |
| `GET` | `/api/leaves/my` | Authenticated | Retrieves personal leave history and decision statuses. |
| `POST` | `/api/leaves/apply` | Authenticated | Submits a new campus leave application. |
| `GET` | `/api/leaves/pending` | Teacher/Admin | Lists pending leave applications requiring approval. |
| `POST` | `/api/leaves/:id/review` | Teacher/Admin | Approves or rejects a campus leave application with remarks. |
