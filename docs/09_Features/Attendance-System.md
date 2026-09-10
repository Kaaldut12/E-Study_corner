# Attendance Tracking & Override System

The **Attendance Tracking & Override System** tracks daily student and faculty attendance, computes participation streaks, and provides Teachers and Administrators with manual attendance override controls.

---

## 1. Core Mechanics

1. **Daily Check-In**:
   - Students and faculty click the glowing **"Mark as Attendance"** button on their dashboard widget (`AttendanceWidget.jsx`).
   - The backend records a timestamped attendance log (`status: 'present'`) for the current calendar date (`YYYY-MM-DD`).
   - Once checked in for the day, the button changes to a checkmark badge (`✓ Checked In for Today`), preventing duplicate submissions.

2. **Streak Computation**:
   - The platform calculates consecutive active days. If a user checked in yesterday and checks in today, their streak increments by +1.
   - Displayed with an animated flame icon (`🔥 5d Streak`).

3. **Attendance Rate Calculation**:
   - Monthly participation percentage is computed dynamically:
     $$\text{Attendance Rate} = \left( \frac{\text{Present Days} + \text{Excused Days}}{\text{Total Working Days in Month}} \right) \times 100\%$$
   - Visualized with a circular gauge and progress ring.

4. **Faculty & Admin Attendance Overrides**:
   - Teachers and Administrators can create, update, or override attendance for any student for any calendar date.
   - Supported status codes: `present`, `absent`, `excused`.
   - Includes custom administrative notes (e.g., "Excused: Medical leave approved", "Marked Present: Laboratory make-up session").

---

## 2. User Interfaces

### A. Attendance Widget (`AttendanceWidget.jsx`)
- Embedded directly at the top of Student and Teacher dashboards.
- Features:
  - Check-in CTA with radiant pulse effect.
  - Active streak badge with flame animation.
  - Monthly attendance percentage gauge.
  - "View History" modal displaying past 30 days of attendance logs.

### B. Student Action Console (`ManageStudents.jsx` -> Attendance Tab)
- Accessible by Teachers (`/teacher/students`) and Admins (`/admin/students`).
- Displays:
  - Selected student's overall stats: Total Present, Total Absent, Excused count, and Streak.
  - Historical chronological log of all attendance records.
  - **Manual Override Form**:
    - Target Date selector (`YYYY-MM-DD`).
    - Status selector (`Present`, `Absent`, `Excused`).
    - Remarks textbox.
    - "Record / Override Attendance" submit button.

---

## 3. REST API Reference

### 1. Daily Check-In
- **Endpoint**: `POST /api/attendance/check-in`
- **Auth**: Required (`verifyToken`)
- **Response**: `200 OK` with updated streak and status:
  ```json
  {
    "success": true,
    "message": "Attendance marked successfully!",
    "streak": 6,
    "log": { "date": "2026-09-10", "status": "present", "timestamp": "2026-09-10T03:30:00Z" }
  }
  ```

### 2. Get User Attendance Statistics
- **Endpoint**: `GET /api/attendance/my-stats`
- **Auth**: Required (`verifyToken`)
- **Response**: Current streak, total present, total absent, percentage.

### 3. Get Student Attendance (Teacher / Admin)
- **Endpoint**: `GET /api/attendance/student/:studentId`
- **Auth**: Required (`requireRole(['admin', 'teacher', 'superadmin'])`)
- **Response**: Aggregated attendance profile and historical logs for target student.

### 4. Record / Override Student Attendance (Teacher / Admin)
- **Endpoint**: `POST /api/attendance/mark-student`
- **Auth**: Required (`requireRole(['admin', 'teacher', 'superadmin'])`)
- **Payload**:
  ```json
  {
    "studentId": "user_demo_student",
    "date": "2026-09-08",
    "status": "excused",
    "notes": "Officially excused per approved medical leave."
  }
  ```
- **Response**: `200 OK` confirming attendance override saved.
