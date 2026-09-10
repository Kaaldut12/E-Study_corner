# 💻 E-Study Corner — Modern Frontend Architecture

> Next-Generation Responsive Academic & E-Learning Portal built with **React 19**, **Vite 7**, and **Tailwind CSS v4** — featuring dedicated portals for **Students**, **Faculty**, and **Administrators**.

---

## 🚀 Key Highlights

- **Dynamic Ambient Theme Engine**: Instant, runtime switching between 4 curated cybernetic color palettes (**Electric Indigo**, **Cyber Emerald**, **Solar Amber**, and **Neon Rose**) powered by dynamic CSS variables and fluid glassmorphism (`glass-panel`, `glass-card-accent`).
- **Fully Responsive Matrix**: 100% responsive across mobile (320px–640px), tablet (641px–1023px), and desktop (1024px+) viewports. No horizontal scrolling, zero layout shifts, and touch-friendly controls.
- **True Fixed Desktop Sidebar**: Fixed viewport navigation with dedicated content offsets (`lg:pl-64`), integrated scroll management, and responsive mobile sliding drawer with backdrop blur.
- **Universal Settings Hub**: Centralized profile management, live appearance theme previewer, and password update credentials.
- **Unified Academic Governance**: Dedicated console for student actions covering coursework grading, multi-tier leave evaluation, automated attendance records, and teacher Q&A doubts.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [React 19](https://react.dev/) + [React DOM 19](https://react.dev/) |
| **Build & Tooling** | [Vite 7](https://vite.dev/) with SWC Fast Refresh |
| **Routing** | [React Router v7](https://reactrouter.com/) with Role-Based Protected Routes |
| **Styling & Design** | [Tailwind CSS v4](https://tailwindcss.com/) with custom `@theme` CSS variables |
| **Icons & Media** | Inline Heroicons SVG + Google Fonts (`Outfit` & `Inter`) |
| **HTTP Client** | [Axios](https://axios-http.com/) with centralized JWT interceptor & auto-401 redirection |
| **Code Quality** | ESLint with React Hooks & React Refresh rules |

---

## 📁 Directory Structure

```
Frontend/src/
├── components/
│   ├── common/
│   │   ├── SidebarLayout.jsx      # Fixed desktop sidebar + responsive mobile drawer
│   │   ├── ProtectedRoute.jsx     # Role-based route guard & token validation
│   │   ├── PublicNavbar.jsx       # Landing & public navigation bar
│   │   ├── EnquiryModal.jsx       # Homepage student admissions enquiry modal
│   │   ├── SkeletonLoader.jsx     # Shimmer skeleton states for tables, cards & stats
│   │   └── ErrorBoundary.jsx      # Top-level React error boundary
│   └── Navbar.jsx                 # Authenticated application top navigation bar
│
├── contexts/
│   └── AuthContext.jsx            # User state, token management & session verification
│
├── pages/
│   ├── General/
│   │   ├── Home.jsx               # Landing page with stats ribbon, features, courses
│   │   └── NotFound.jsx           # 404 error page with quick portal recovery links
│   ├── Auth/
│   │   ├── LoginForm.jsx          # Role-aware authentication form
│   │   ├── Register.jsx           # Student academic registration
│   │   └── ResetPassword.jsx      # 2-step OTP password reset
│   ├── Student/                   # 18 student pages (Dashboard, Courses, Quizzes, etc.)
│   ├── Teacher/                   # 8 teacher pages (Dashboard, Grading, Roster, Doubts)
│   ├── Admin/                     # 10 admin pages (Dashboard, Analytics, Users, Health)
│   └── Common/
│       └── Settings.jsx           # Unified Profile, Themes & Password Security Hub
│
├── services/
│   ├── api.js                     # Centralized Axios instance with JWT interceptor
│   ├── authService.js             # Authentication API calls
│   ├── studentService.js          # Student coursework & AI endpoints
│   ├── teacherService.js          # Teacher course, assignment & grading endpoints
│   └── adminService.js            # Platform administration & analytics endpoints
│
├── utils/
│   └── fileDownload.js            # Blob-based secure download utility
│
├── index.css                      # Tailwind v4 theme variables, glass utilities & scrollbars
├── main.jsx                       # React root mounting
└── App.jsx                        # Primary route index & role routers
```

---

## 🏃 Local Setup & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the `Frontend/` folder:
```env
VITE_API_URL=http://localhost:3001/api
VITE_COLLEGE_NAME=National Institute of Technology & Advanced Studies
```

### 3. Start Development Server
```bash
npm run dev
```
The application will launch on [http://localhost:5173/](http://localhost:5173/).

### 4. Code Quality & Production Build
```bash
# Run ESLint validation
npm run lint

# Compile optimized production bundle
npm run build
```

---

## 🎨 Theme System

The frontend supports 4 dynamic themes configured via CSS variables and the `data-theme` HTML attribute:

- **Indigo** (`data-theme="indigo"` or default): Cosmic violet accent.
- **Emerald** (`data-theme="emerald"`): Radiant matrix green.
- **Amber** (`data-theme="amber"`): Warm solar amber and sunset orange.
- **Rose** (`data-theme="rose"`): Futuristic neon rose and crimson.

All theme states persist in browser `localStorage` under `estudy_theme` and can be adjusted interactively in the **Settings** hub.
