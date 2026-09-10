# Deployment & Operations Guide

This document provides end-to-end instructions for deploying, configuring, containerizing, and monitoring **E-Study Corner** in production environments.

---

## 1. Environment Configuration

Both backend and frontend services are configured via environment variables.

### Backend (`Backend/.env`)
| Variable | Required | Default | Description |
|---|:---:|---|---|
| `PORT` | No | `3001` | HTTP listening port for Express server. |
| `NODE_ENV` | Yes | `production` | Environment mode (`development`, `test`, `production`). |
| `MONGO_URI` | Yes | — | MongoDB connection string (e.g., MongoDB Atlas URI). |
| `JWT_SECRET` | Yes | — | High-entropy 256-bit string used to sign user tokens. |
| `JWT_EXPIRES_IN` | No | `7d` | Lifespan of generated JWT tokens. |
| `CORS_ORIGIN` | Yes | `http://localhost:5173` | Allowed frontend origin URL (comma-separated for multiples). |
| `SEED_DEFAULT_PASSWORD` | No | `Admin@123` | Default password for initial database seeding. |
| `DATA_STORE_MODE` | No | `mongo` | Mode switch (`mongo` or `strict` to enforce DB availability). |

### Frontend (`Frontend/.env`)
| Variable | Required | Default | Description |
|---|:---:|---|---|
| `VITE_API_URL` | Yes | `http://localhost:3001` | Target API base URL for Axios calls. |

---

## 2. Docker Containerization

The repository includes a production-ready `Dockerfile` in `Backend/Dockerfile`.

### 2.1 Backend Dockerfile
```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY . .

# Expose server port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["node", "index.js"]
```

### 2.2 Docker Compose Deployment
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: secretpassword
    volumes:
      - mongo-data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./Backend
    restart: always
    ports:
      - "3001:3001"
    environment:
      PORT: 3001
      NODE_ENV: production
      MONGO_URI: mongodb://admin:secretpassword@mongodb:27017/estudy?authSource=admin
      JWT_SECRET: supersecretproductionkeyhere987654321
      CORS_ORIGIN: https://your-frontend-domain.com
    depends_on:
      - mongodb

volumes:
  mongo-data:
```

---

## 3. Platform Deployment Guides

### 3.1 Deploying Frontend to Vercel
1. Link your GitHub repository to **Vercel**.
2. Set the **Root Directory** to `Frontend`.
3. Set **Framework Preset** to `Vite`.
4. Configure Environment Variable:
   - `VITE_API_URL`: `https://your-backend-api.onrender.com`
5. Click **Deploy**.

### 3.2 Deploying Backend to Render / Railway
1. Create a new **Web Service** pointing to the repository.
2. Set Root Directory to `Backend`.
3. Set Build Command: `npm install --omit=dev`.
4. Set Start Command: `node index.js`.
5. Supply environment variables (`MONGO_URI`, `JWT_SECRET`, `CORS_ORIGIN`, `NODE_ENV=production`).

---

## 4. Health Monitoring & Diagnostics

The backend provides a standardized health check endpoint at `/api/health`:

### Request:
```http
GET /api/health HTTP/1.1
Host: api.estudycorner.com
```

### Response (200 OK):
```json
{
  "status": "healthy",
  "version": "2.1.0",
  "uptime": 14285.42,
  "database": "connected",
  "timestamp": "2026-09-10T07:30:00.000Z"
}
```

If the database disconnects in production:
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "message": "Database connection unavailable."
}
```

---

## 5. Production Readiness Checklist

Before going live with institutional users:
- [x] SSL/TLS certificate installed (HTTPS enforced via HSTS).
- [x] High-entropy `JWT_SECRET` configured (never use default keys).
- [x] MongoDB Atlas IP whitelist configured to cloud provider IP range.
- [x] Strict CORS origin set to production frontend domain.
- [x] Database indexes verified for `User`, `Course`, and `Attendance`.
- [x] Automated test suite verified (`npm test` passes 53/53).
