# 📚 E-Study Corner

> A Modern Full-Stack E-Learning Platform built for **National Institute of Technology & Advanced Studies** — with role-based access for Students, Teachers, and Administrators.

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

### 4. Seed Database
```bash
cd Backend
npm run seed
```

---

## 🔐 Roles & Default Credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| **Super Admin** | `superadmin@estudy.com` | `SuperAdmin@123` | Master governance, database purge & system management |
| **Admin** | `admin@estudy.com` | `Admin@123` | Department management, approvals & analytics |
| **Teacher** | `teacher@estudy.com` | `Admin@123` | Course content, assignments, attendance & grading |
| **Student** | `student@estudy.com` | `Admin@123` | Self-register via `/register` or pre-enrolled |

---

## 🚀 Deploying to Vercel

### Deploying the Frontend (Vite SPA)
1. In the [Vercel Dashboard](https://vercel.com), click **Add New** > **Project** and import your repository.
2. In the project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `Frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add **Environment Variables**:
   - `VITE_API_URL`: URL of your backend API (e.g., `https://your-backend.vercel.app/api` or hosted backend service).
4. Click **Deploy**. SPA routing rewrites (`Frontend/vercel.json`) are already configured to handle all sub-routes smoothly.

### Deploying the Backend
1. Create a MongoDB database on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free M0 tier available).
2. Ensure network access on MongoDB Atlas allows connections (`0.0.0.0/0` or Vercel IP ranges).
3. Import the repository on Vercel as a second project (or deploy from root):
   - **Root Directory**: `Backend` (or deploy root with serverless function in `api/index.js`)
4. Add **Environment Variables** in Vercel:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (`mongodb+srv://...`)
   - `JWT_SECRET`: A secure random secret string
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-frontend.vercel.app`)
5. Deploy. Backend CORS is pre-configured to automatically allow all `*.vercel.app` domains.

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
│   └── seed.js         # Initial database seeder
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
