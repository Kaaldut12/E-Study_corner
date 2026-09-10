# Administrative Dashboard & Command Center

The **Administrative Dashboard** (`AdminDashboard.jsx`) serves as the central operations console for Institutional Administrators and Super Administrators.

---

## 1. Dashboard Layout & Capabilities

```
+------------------------------------------------------------------------------------------------+
| Administrative Operations Banner (SuperAdmin Master / Administrator Control)                    |
| Quick Actions: [Student Actions Hub]  [Deep Analytics Hub]  [User Directory]                   |
+------------------------------------------------------------------------------------------------+
| Administrative Action Command Center (Direct Execution Mode)                                   |
| [📢 Broadcast Notice]   [🎓 Student Actions Console]   [🏖️ Leave Approvals (Pending Pill)]       |
| [🎫 Resolve Helpdesk]    [❓ Triage Student Doubts]     [🔄 Database Integrity Audit]           |
+------------------------------------------------------------------------------------------------+
| System Metrics Grid                                                                            |
| [Total Users]   [Student Count]   [Faculty Count]   [Active Assignments]   [Pending Leaves]     |
+------------------------------------------------------------------------------------------------+
| Operational Work Queues                                                                        |
| [Pending Support Tickets Triage]         │  [Unanswered Student Academic Doubts Triage]        |
+------------------------------------------------------------------------------------------------+
```

---

## 2. Core Administrative Workflows

### 1. 🎓 Student Actions Governance (`/admin/students`)
- Direct launchpad to the Universal Student Action Console.
- Enables platform administrators to audit and act upon student leaves, inspect and grade coursework submissions, download submitted work files, record manual attendance overrides, and answer academic doubts.

### 2. 🏖️ Institutional Leave Approvals (`/admin/leaves`)
- Central approvals board displaying all pending, approved, and rejected leave requests across the entire institution.
- Direct filtering by role (`student`, `teacher`) and keyword search.

### 3. 📢 Campus Announcement Broadcasting
- Modal form allowing administrators to dispatch instant institutional announcements.
- Automatically pushes notification records to student and faculty notice boards.

### 4. 🎫 Helpdesk & Inquiries Resolution
- Displays support messages submitted by students or prospective applicants.
- Modal response form with status updates (`pending`, `in-progress`, `resolved`).

### 5. ❓ Academic Doubts Triage
- Displays student questions waiting for instructor responses.
- Allows administrators to step in and answer or escalate academic queries.

### 6. 🔄 Database Integrity Audit
- Triggers server-side synchronization and health audits across all 17 MongoDB collections.
- Displays database connection status, collection document counts, and sync status.
