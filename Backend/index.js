// backend/index.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import environment & database configuration
import { PORT, ALLOWED_ORIGINS, COLLEGE_NAME, IS_PRODUCTION, MONGODB_URI } from './src/config/env.js';
import { connectDB } from './src/config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import fileRoutes from './routes/fileRoutes.js';

// Production Security Middleware & Error Handlers
import { securityHeaders, apiRateLimiter, sanitizeInput } from './src/middleware/security.js';
import { notFoundHandler, globalErrorHandler } from './src/middleware/errorMiddleware.js';

// Connect to MongoDB (single source of truth)
connectDB().catch((err) => {
  console.error('Database connection startup warning:', err.message);
});

const app = express();

// Trust reverse proxy (Vercel, AWS ALB, Nginx, Cloudflare) for accurate client IP identification
app.set('trust proxy', 1);

// ==================== Middleware ====================

// 1. CORS MUST BE FIRST so that ALL responses (including errors, 429, 500, preflight OPTIONS)
// always receive proper Access-Control-Allow-Origin headers and avoid browser Network Errors.
app.use(cors({
  origin: (requestOrigin, callback) => {
    // Allow non-browser or same-origin requests without origin header (e.g. mobile apps, curl, server-to-server)
    if (!requestOrigin) return callback(null, true);

    // 1. Explicitly configured origins (from ALLOWED_ORIGINS and FRONTEND_URL)
    if (ALLOWED_ORIGINS.includes(requestOrigin)) {
      return callback(null, true);
    }

    // 2. Local development origins (restricted strictly to non-production environments)
    if (process.env.NODE_ENV !== 'production') {
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) {
        return callback(null, true);
      }
    }

    // Reject unrecognized origins cleanly without crashing server
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
}));

// 2. Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 3. Security headers & sliding-window rate limiting
app.use(securityHeaders);
app.use(apiRateLimiter);
app.use(sanitizeInput);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Database connection middleware: ensures MongoDB connection is attempted before routes execute
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  const isProduction = process.env.DATA_STORE_MODE === 'strict' || process.env.NODE_ENV === 'production';

  try {
    await connectDB();
  } catch (err) {
    if (isProduction) {
      return res.status(503).json({
        success: false,
        message: 'Database service is currently unavailable. Please try again later.',
        code: 'DATABASE_UNAVAILABLE'
      });
    }
    console.warn('[Database Connection Notice]: Operating in fallback mode for local development:', err.message);
  }

  if (isProduction && mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database service is currently unavailable. Please try again later.',
      code: 'DATABASE_UNAVAILABLE'
    });
  }

  next();
});

// ==================== Routes ====================

// Root info endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Study Corner API Gateway is active and operational.',
    institution: COLLEGE_NAME,
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      student: '/api/student',
      teacher: '/api/teacher',
      admin: '/api/admin',
      attendance: '/api/attendance',
      leaves: '/api/leaves',
      files: '/api/files',
      public: '/api/public',
      system: '/api/system'
    }
  });
});

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'ok',
    database: isDbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// API Routes - Mounted with both /api/* and root /* prefix for backward compatibility
app.use(['/api/public', '/public'], publicRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/student', '/student'], studentRoutes);
app.use(['/api/teacher', '/teacher'], teacherRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/attendance', '/attendance'], attendanceRoutes);
app.use(['/api/leaves', '/leaves'], leaveRoutes);
app.use(['/api/files', '/files'], fileRoutes);
app.use(['/api/system', '/system'], systemRoutes);

// ==================== Error Handling ====================
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ==================== Server Start ====================
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║  E-Study Corner Backend (V2 Arch)    ║
║  Server running on port ${PORT}      ║
║  Environment: ${process.env.NODE_ENV || 'development'}║
║  Timestamp: ${new Date().toISOString()}  ║
╚══════════════════════════════════════╝
    `);
  });
}

export default app;