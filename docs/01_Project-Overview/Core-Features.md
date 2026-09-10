# Core Features & Platform Capabilities

E-Study Corner delivers a modern, high-performance academic learning and governance environment across four interconnected portals: **Student**, **Teacher**, **Institutional Administrator**, and **Platform Super Administrator**.

---

## 1. Academic & Learning Features (Student Portal)

### A. Dynamic Learning Dashboard
- **Real-Time KPIs**: Enrolled courses count, completed lessons percentage, current attendance streak flame (`🔥 Xd`), overall quiz accuracy, and pending coursework indicators.
- **Attendance Check-In Widget**: Daily one-click attendance check-in, real-time monthly percentage tracker, and comprehensive attendance history log viewer.
- **Recent Activity Feed**: Quick navigation to in-progress lessons, recently published notices, and graded coursework.

### B. Coursework & Assignment Submissions
- **Browse Coursework**: Filter assignments by subject and deadline status (`Open`, `Submitted`, `Graded`, `Past Due`).
- **File Downloads**: Direct one-click streaming download of teacher-attached problem statements, project guidelines, and reference files (`.pdf`, `.docx`, `.zip`, `.png`, `.jpg`).
- **Submission Dropzone**: Upload completed solution files with client-side progress bars, text commentary, and real-time status updates.

### C. Course Catalog & Lesson Engine
- **Hierarchical Pedagogy**: Courses structured into modular units, lessons, lecture notes, video embeds, and supplementary downloadable PDFs.
- **Progress Tracking**: Automatic lesson completion recording with live progress percentage updates.
- **Diagnostic Quizzes & Practice**: Interactive quizzes with instant scoring, explanations, answer review, and automated **Weak Topic Detection** computed directly from quiz attempts.

### D. Academic Doubts & Q&A
- Submit subject-specific doubts directly to assigned course instructors.
- Receive official faculty explanations and solutions directly in the student portal.

### E. Campus Leave Application
- Apply for medical, academic, or casual leaves with start/end date pickers and purpose details.
- Real-time tracking of approval status (`Pending`, `Approved`, `Rejected`) with evaluator remarks.

---

## 2. Instructor & Academic Governance (Teacher Portal)

### A. Instructor Command Console
- Key metrics: Active courses, total published assignments, pending submissions requiring grading, active classroom roster count, and pending student leave evaluations.
- Quick shortcuts for coursework creation and student governance.

### B. Course, Lesson & Quiz Authoring
- Create rich courses with custom cover badges, syllabus objectives, and tags.
- Add structured lessons with markdown content and downloadable study materials.
- Author timed quizzes with randomized answer choices and diagnostic explanations.

### C. Universal Student Actions & Governance Console (`/teacher/students`)
A unified, interactive modal console allowing instructors to manage any student across four core dimensions:
1. 🏖️ **Leaves Governance**: Inspect leave applications, review reasons, and approve or reject with qualitative feedback.
2. 📝 **Coursework & Submissions**: View submitted work text, download attached solution files, score points (0–100), and write qualitative feedback.
3. 📅 **Attendance Governance**: Inspect attendance streak, present count, and attendance percentage gauge; record manual attendance overrides for any date (`Present`, `Absent`, `Excused`) with custom notes.
4. 💬 **Doubts (Q&A)**: View questions asked by the student and publish official responses.

### D. Faculty Leave Management
- Apply for personal faculty leaves (conference, medical, casual, break).
- Switch to the "Student Requests" tab to review, filter, and evaluate leave applications from enrolled students.

---

## 3. Institutional Administration (Admin & SuperAdmin)

### A. Administrative Command Center
- System-wide metrics: Total registered users, student/teacher/admin distribution, active vs. suspended accounts, total assignments, and helpdesk support tickets.
- Instant actions: Broadcast campus notices, resolve support tickets, triage student doubts, audit database integrity, and access the student actions console.

### B. Student Action Governance (`/admin/students`)
- Platform-level access to the Universal Student Action Console for auditing and managing all student leaves, submissions, attendance overrides, and queries.
- Deep-linking from the User Directory table via **`⚡ Manage Actions`** shortcuts.

### C. Campus Leave Approvals (`/admin/leaves`)
- Centralized governance for all leave applications across both student body and faculty.
- Multi-filter search (by role, status, applicant name, or date range).

### D. User Management & Granular Permissions (`/admin/users`)
- Complete user directory with role assignment (Student, Teacher, Admin, SuperAdmin).
- Granular permission toggles (15 system capabilities).
- User activation/suspension and deletion safeguards.

---

## 4. Platform-Wide Foundation & Design System

- **Dynamic 4-Color Theme Engine**: Real-time switching between Indigo, Emerald, Amber, and Rose with dynamic CSS variables and ambient lighting glows.
- **Fixed Sidebar Architecture**: Permanently anchored sidebar (`fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)]`) with internal scrolling and `lg:pl-64` page offset.
- **Glassmorphic Surface Design**: Modern frosted glass styling (`.glass-panel`, `.glass-panel-hover`, `.btn-premium`).
- **Native Automated Testing**: 53+ zero-dependency integration tests executed via Node's native test runner (`node:test`).
