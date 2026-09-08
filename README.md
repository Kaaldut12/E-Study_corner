# 📚 E-Study Corner

> **A Modern Full-Stack E-Learning Platform** — Built for Government Polytechnic Aurai, this platform delivers a complete learning management system with role-based access for Students, Teachers, and Administrators.

---

## ✨ Features Overview

### 🎓 Student Portal
| Feature | Description |
|---|---|
| **Dashboard** | Personalized overview with assignments, courses & stats |
| **Course Catalog** | Browse and explore available courses |
| **Quizzes & Practice** | Interactive quizzes with scoring |
| **Progress Tracking** | Visual progress charts and learning metrics |
| **Personal Notes App** | Full rich-text note-taking with local persistence |
| **Download Study Material** | Access and download uploaded resources |
| **Saved Bookmarks** | Bookmark important content for quick access |
| **Global Search Omnibar** | Search across all platform content |
| **AI Study Coach** | Personalized AI-powered study guidance |
| **AI Recommendations** | Smart learning path suggestions |
| **Weak Topic Detector** | Identify and focus on struggling areas |
| **Course Assignments** | View and submit assignments with file uploads |
| **My Grades & Feedback** | View teacher feedback and scores |
| **Notice Board Feed** | Real-time notifications and announcements |
| **My Profile** | Edit personal details and avatar |
| **Change Password** | Secure password update |
| **Contact Support** | Submit support tickets to admin |

### 🧑‍🏫 Teacher Portal
| Feature | Description |
|---|---|
| **Dashboard** | Overview of classes, assignments & submissions |
| **Manage Assignments** | Create, view and delete assignments |
| **Create Assignment** | Full assignment creation form with due dates |
| **View Submissions** | Review student submissions with file downloads |
| **Manage Courses** | View and manage your course roster |
| **Create Course** | Add new courses with details and thumbnails |
| **Manage Students** | View enrolled students and their info |

### 🛡️ Admin Portal
| Feature | Description |
|---|---|
| **Dashboard** | Platform-wide overview and key metrics |
| **User Management** | Create teacher accounts, manage all users |
| **Platform Analytics** | Engagement graphs and usage statistics |
| **System Health** | Live server status, DB ping, memory usage |
| **Notification Management** | Broadcast platform-wide notices |
| **Enquiry Management** | Handle student/visitor enquiries |
| **Upload Study Material** | Upload PDFs and resources for students |
| **View Feedback** | Review all submitted student feedback |
| **View Messages / Support Tickets** | Handle contact admin messages |
| **Send Email** | Send bulk or individual emails to users |

---

## 🎨 Custom Theme Palette System

Switch between 4 beautiful dark-mode themes in one click from the Navbar:

| Theme | Colors |
|---|---|
| 🟣 **Indigo** *(Default)* | Royal Indigo · Violet · Purple |
| 🟢 **Emerald** | Emerald · Teal · Cyan |
| 🟠 **Amber** | Warm Amber · Orange · Crimson |
| 🌹 **Rose** | Rose · Magenta · Fuchsia |

> Theme preference is persisted via `localStorage` — your choice survives page refreshes.

---

## 🏗️ Tech Stack

### Frontend
- **React 19** with Vite 7
- **React Router DOM 7** (nested protected routes)
- **Tailwind CSS v4** with custom CSS variables
- **Glassmorphism UI** with dark-mode aesthetics
- **Google Fonts** — Inter & Outfit
- **Axios** for API communication

### Backend
- **Node.js** + **Express 5**
- **MongoDB** (via Mongoose) with in-memory fallback
- **JWT** authentication (24h tokens)
- **Nodemailer** for email services
- **Firebase** integration (optional)
- **bcrypt** password hashing
- **Nodemon** for development hot-reload

### DevOps
- **Docker** + **Docker Compose** for containerized deployment
- **GitHub Actions CI/CD** pipeline
- **MongoDB** as the primary database
- **Nginx** for frontend static serving in production

---

## 📁 Project Structure

```
E-Study_corder/
├── Backend/
│   ├── controllers/          # Route handler logic
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── teacherController.js
│   │   └── studentController.js
│   ├── models/               # Mongoose data models
│   ├── routes/               # Express route definitions
│   ├── src/
│   │   └── middleware/       # Auth & role middleware
│   ├── index.js              # Express app entry point
│   ├── seed.js               # Database seeder
│   ├── Dockerfile
│   └── .env                  # Environment variables
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx         # Top nav + theme switcher
│   │   │   └── common/
│   │   │       ├── SidebarLayout.jsx
│   │   │       ├── ProtectedRoute.jsx
│   │   │       ├── ErrorBoundary.jsx
│   │   │       ├── EnquiryModal.jsx
│   │   │       └── NotificationMarquee.jsx
│   │   ├── contexts/
│   │   │   └── AuthContext.jsx    # Global auth state
│   │   ├── pages/
│   │   │   ├── Auth/              # Login, Register, ResetPassword
│   │   │   ├── General/           # Landing Home page
│   │   │   ├── Student/           # 18 student pages
│   │   │   ├── Teacher/           # 7 teacher pages
│   │   │   └── Admin/             # 10 admin pages
│   │   ├── App.jsx                # Router + route definitions
│   │   └── index.css             # Design system + theme tokens
│   ├── Dockerfile
│   └── vite.config.js
│
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci.yml                # GitHub Actions pipeline
└── docs/                         # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 18.x`
- **MongoDB** `>= 6.x` (local or cloud)
- **npm** or **yarn**

### 1. Clone the Repository

```bash
git clone https://github.com/Kaaldut12/E-Study_corder.git
cd E-Study_corder
```

### 2. Setup Backend

```bash
cd Backend
npm install
```

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/e-study-corner

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=24h

# Email (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Firebase (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

Start backend dev server:

```bash
npm run dev        # Development with hot-reload (Nodemon)
npm start          # Production
npm run seed       # Seed the database with sample data
```

> Backend runs at **http://localhost:3001**

### 3. Setup Frontend

```bash
cd Frontend
npm install
npm run dev
```

> Frontend runs at **http://localhost:5173**

---

## 🐳 Docker Deployment

Run the full stack with one command:

```bash
docker-compose up --build
```

| Service | Port |
|---|---|
| Frontend (Nginx) | `http://localhost:80` |
| Backend (Express) | `http://localhost:3001` |
| MongoDB | `localhost:27017` |

---

## 🔐 Authentication & Roles

| Role | Access | Registration |
|---|---|---|
| **Student** | Student Portal | Self-register via `/register` |
| **Teacher** | Teacher Portal | Created by Admin only |
| **Admin** | Full platform access | Seeded / manually created |

> **Security**: Students attempting to register as `teacher` or `admin` receive a **403 Forbidden** response. Role boundaries are enforced on both frontend (ProtectedRoute) and backend (middleware).

### Default Seed Credentials

After running `npm run seed`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@estudy.com` | `admin123` |
| Teacher | `teacher@estudy.com` | `teacher123` |
| Student | `student@estudy.com` | `student123` |

---

## 🌐 API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Student self-registration |
| `POST` | `/login` | Login for all roles |
| `POST` | `/logout` | Logout and clear token |
| `POST` | `/reset-password` | Password reset via email |

### Admin Routes (`/api/admin`) — Admin only
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | Get all platform users |
| `POST` | `/users` | Create teacher account |
| `DELETE` | `/users/:id` | Delete a user |
| `GET` | `/analytics` | Platform analytics |
| `POST` | `/send-email` | Send email to users |
| `GET` | `/feedback` | View all feedback |
| `GET` | `/messages` | View support messages |

### Teacher Routes (`/api/teacher`) — Teacher only
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/students` | Get enrolled students |
| `GET` | `/assignments` | Get all assignments |
| `POST` | `/assignments` | Create new assignment |
| `DELETE` | `/assignments/:id` | Delete an assignment |
| `GET` | `/submissions/:id` | Get submissions for assignment |
| `GET` | `/courses` | Get managed courses |
| `POST` | `/courses` | Create a new course |

### Student Routes (`/api/student`) — Student only
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/assignments` | View available assignments |
| `POST` | `/assignments/submit` | Submit assignment with file |
| `GET` | `/courses` | Browse courses |
| `GET` | `/study-material` | List study materials |
| `POST` | `/feedback` | Submit feedback |
| `POST` | `/contact` | Send message to admin |
| `GET/PUT` | `/profile` | View & update profile |

---

## 🖥️ Page Screenshots

> Live at `http://localhost:5173` after starting dev servers.

| Route | Page |
|---|---|
| `/` | Public Landing Page |
| `/login` | Login |
| `/register` | Student Registration |
| `/student` | Student Dashboard |
| `/student/courses` | Course Catalog |
| `/student/quizzes` | Quizzes & Practice |
| `/student/notes` | Personal Notes App |
| `/student/ai-coach` | AI Study Coach |
| `/student/assignments` | Course Assignments |
| `/teacher` | Teacher Dashboard |
| `/teacher/assignments` | Manage Assignments |
| `/teacher/submissions/:id` | View Submissions |
| `/admin` | Admin Dashboard |
| `/admin/users` | User Management |
| `/admin/analytics` | Platform Analytics |
| `/admin/health` | System Health |

---

## 🧰 Development Scripts

### Backend
```bash
npm run dev      # Nodemon dev server (port 3001)
npm start        # Production server
npm run seed     # Seed DB with demo data
```

### Frontend
```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint check
```

---

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **ISC License**.

---

## 👨‍💻 Author

**E-Study Corner** — Built for Government Polytechnic Aurai  
Maintained by [Kaaldut12](https://github.com/Kaaldut12)

---

> Made with ❤️ using React, Node.js, and MongoDB
