# User Management & Access Control

The **User Management Console** (`UserManagement.jsx`) allows Administrators and Super Administrators to govern all registered accounts on E-Study Corner.

---

## 1. Features & Capabilities

### A. User Directory Table
- Displays full user profile information: Name, Email, Unique ID, Assigned Role Badge, Department/Program, and Active Permissions Chips.
- Real-time search across names, emails, and departments.
- Role filter pills (`All Users`, `Students`, `Teachers`, `Admins`, `SuperAdmins`).

### B. Student Actions Deep-Linking
- For every user account with `role: 'student'`, a dedicated **`⚡ Manage Actions`** button is displayed.
- Clicking routes directly to `/admin/students?studentId=${u.id}`, automatically launching the 4-tab Student Action Console pre-loaded with the student's leaves, coursework submissions, attendance record, and academic doubts.

### C. Granular Permissions Management
- Edit modal allowing administrators to customize permissions on a per-user basis.
- 15 toggleable system permissions across Administration, Academics, Resources, Communication, and AI categories.
- Role default presets auto-populate when assigning a new role.

### D. Account Status Toggling (Active / Suspended)
- Toggle user status between `active` and `suspended` without deleting account history.
- Suspended users are barred from logging in or making API requests.

### E. Account Deletion & SuperAdmin Safeguards
- Administrators can delete test or inactive accounts.
- SuperAdmin accounts are hard-locked against unauthorized deletion or demotion.
