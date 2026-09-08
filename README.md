# 📚 E-Study Corner

> A Modern Full-Stack E-Learning Platform built for **Government Polytechnic Aurai** — with role-based access for Students, Teachers, and Administrators.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 7, Tailwind CSS v4, React Router DOM 7 |
| **Backend** | Node.js, Express 5, MongoDB (Mongoose), JWT |
| **DevOps** | Docker, Docker Compose, GitHub Actions |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18.x`
- MongoDB `>= 6.x`

### 1. Clone
```bash
git clone https://github.com/Kaaldut12/E-Study_corder.git
cd E-Study_corder
```

### 2. Backend Setup
```bash
cd Backend
npm install
npm run dev        # runs on http://localhost:3001
```

Create `Backend/.env`:
```env
PORT=3001
MONGODB_URI=mongodb://127.0.0.1:27017/e-study-corner
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
FRONTEND_URL=http://localhost:5173
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### 3. Frontend Setup
```bash
cd Frontend
npm install
npm run dev        # runs on http://localhost:5173
```

### 4. Seed Demo Data
```bash
cd Backend
npm run seed
```

---

## 🔐 Roles & Default Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| **Admin** | `admin@estudy.com` | `admin123` | Full platform access |
| **Teacher** | `teacher@estudy.com` | `teacher123` | Created by Admin only |
| **Student** | `student@estudy.com` | `student123` | Self-register via `/register` |

---

## 🎨 Themes

Click any swatch in the Navbar to switch themes. Preference is saved automatically.

| Theme | Colors |
|---|---|
| 🟣 Indigo *(default)* | Indigo · Violet · Purple |
| 🟢 Emerald | Emerald · Teal · Cyan |
| 🟠 Amber | Amber · Orange · Crimson |
| 🌹 Rose | Rose · Magenta · Fuchsia |

---

## 🐳 Docker

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:80` |
| Backend | `http://localhost:3001` |

---

## 📁 Structure

```
E-Study_corder/
├── Backend/
│   ├── controllers/    # Auth, Admin, Teacher, Student
│   ├── models/         # Mongoose schemas
│   ├── routes/         # Express routes
│   ├── index.js        # Entry point
│   └── seed.js         # Demo data seeder
├── Frontend/
│   └── src/
│       ├── pages/      # Student (18), Teacher (7), Admin (10)
│       ├── components/ # Navbar, Sidebar, ProtectedRoute
│       ├── contexts/   # AuthContext
│       └── index.css   # Design system & theme tokens
└── docker-compose.yml
```

---

## 📄 License

ISC — Built with ❤️ using React, Node.js & MongoDB
