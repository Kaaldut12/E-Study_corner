# User Roles & System Permissions Matrix

E-Study Corner defines four primary roles in a hierarchical Role-Based Access Control (RBAC) architecture.

---

## 1. Role Hierarchy

```
[ Super Administrator ] 👑 (Master Authority & System Overrides)
         │
         ▼
  [ Administrator ] 🛡️ (Institutional Operations, Leave Approvals & User Audits)
         │
         ▼
     [ Teacher ] 👨‍🏫 (Course Authoring, Coursework Grading, Student Governance)
         │
         ▼
     [ Student ] 🎓 (Course Learning, Assignments, Quizzes & Daily Check-In)
```

---

## 2. Permissions & Capabilities Matrix

| System Capability | Student | Teacher | Admin | SuperAdmin |
| :--- | :---: | :---: | :---: | :---: |
| **Browse Courses & Watch Lessons** | ✅ | ✅ | ✅ | ✅ |
| **Daily Attendance Check-In ("Mark as Attendance")** | ✅ | ✅ | ✅ | ✅ |
| **View Own Attendance Stats & Streak** | ✅ | ✅ | ✅ | ✅ |
| **Apply for Student Leave** | ✅ | ❌ | ❌ | ❌ |
| **Apply for Faculty Leave** | ❌ | ✅ | ❌ | ❌ |
| **Submit Coursework & Upload Solution Files** | ✅ | ❌ | ❌ | ❌ |
| **Download Assignment Reference Files** | ✅ | ✅ | ✅ | ✅ |
| **Ask Academic Doubts to Faculty** | ✅ | ❌ | ❌ | ❌ |
| **Personal Notes CRUD & Bookmarking** | ✅ | ❌ | ❌ | ❌ |
| **Take Quizzes & Practice Tests** | ✅ | ❌ | ❌ | ❌ |
| **Author Courses, Lessons & Quizzes** | ❌ | ✅ | ✅ | ✅ |
| **Publish Assignments with Deadlines & Attachments** | ❌ | ✅ | ✅ | ✅ |
| **Review, Grade & Re-Grade Student Submissions** | ❌ | ✅ | ✅ | ✅ |
| **Download Student Coursework Solution Files** | ❌ | ✅ | ✅ | ✅ |
| **Answer Student Academic Doubts** | ❌ | ✅ | ✅ | ✅ |
| **Evaluate & Decide Student Leaves** | ❌ | ✅ | ✅ | ✅ |
| **Record / Override Student Attendance (Any Date)** | ❌ | ✅ | ✅ | ✅ |
| **Universal Student Action Console Access** | ❌ | ✅ | ✅ | ✅ |
| **Centrally Evaluate Student & Faculty Leaves** | ❌ | ❌ | ✅ | ✅ |
| **User Directory Management & Account Creation** | ❌ | ❌ | ✅ | ✅ |
| **Toggle Active / Suspended User Status** | ❌ | ❌ | ✅ | ✅ |
| **Assign Granular System Permissions** | ❌ | ❌ | ✅ | ✅ |
| **Broadcast Campus Announcements** | ❌ | ❌ | ✅ | ✅ |
| **Resolve Institutional Support Tickets** | ❌ | ❌ | ✅ | ✅ |
| **Database Integrity Audits & Resync** | ❌ | ❌ | ✅ | ✅ |
| **Platform-Wide Master Overrides & User Deletion** | ❌ | ❌ | ❌ | ✅ |

---

## 3. Granular System Permissions (Admin Console)

Administrators can grant or revoke specific granular permissions for individual user accounts:

1. `manage_users`: Create, update, and audit user directory accounts.
2. `manage_roles`: Assign roles and custom capabilities.
3. `view_analytics`: Inspect institutional performance analytics and reports.
4. `create_courses`: Author syllabus, lessons, and publish courses.
5. `manage_courses`: Edit lessons, rearrange units, and delete coursework.
6. `create_assignments`: Publish homework and assignments with deadlines.
7. `grade_submissions`: Score student work and write qualitative feedback.
8. `submit_assignments`: Upload and submit homework solutions.
9. `manage_quizzes`: Create question banks and diagnostic assessments.
10. `take_quizzes`: Participate in online quizzes.
11. `upload_materials`: Upload reference notes and PDF documents.
12. `download_materials`: Download study materials and reference guides.
13. `manage_notifications`: Broadcast campus announcements.
14. `manage_enquiries`: Review and resolve helpdesk tickets.
15. `access_ai_coach`: Access AI study companion and recommendation tools.
