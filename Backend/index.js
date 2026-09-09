// backend/index.js
import express from 'express';
import cors from 'cors';

// Import environment & database configuration
import { PORT, ALLOWED_ORIGINS, COLLEGE_NAME, IS_PRODUCTION } from './src/config/env.js';
import { connectDB } from './src/config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import systemRoutes from './routes/systemRoutes.js';

// Production Security Middleware & Error Handlers
import { securityHeaders, apiRateLimiter, sanitizeInput } from './src/middleware/security.js';
import { notFoundHandler, globalErrorHandler } from './src/middleware/errorMiddleware.js';

// Connect to MongoDB (single source of truth)
connectDB().catch((err) => {
  console.error('Fatal database startup failure:', err.message);
  if (IS_PRODUCTION) process.exit(1);
});

const app = express();

// ==================== Middleware ====================

// Security headers & sliding-window rate limiting
app.use(securityHeaders);
app.use(apiRateLimiter);
app.use(sanitizeInput);

// CORS configuration - strictly allows configured frontend origins and local dev
app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);

    if (ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(requestOrigin)) {
      return callback(null, true);
    }

    // Allow localhost in non-production environments
    if (!IS_PRODUCTION && (requestOrigin.includes('localhost') || requestOrigin.includes('127.0.0.1'))) {
      return callback(null, true);
    }

    // Allow Vercel preview only if explicitly configured via env
    if (process.env.ALLOW_VERCEL_PREVIEW === 'true' && requestOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error(`Origin '${requestOrigin}' is not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
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
      public: '/api/public',
      system: '/api/system'
    }
  });
});

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// API Routes - Mounted with both /api/* and root /* prefix for backward compatibility
app.use(['/api/public', '/public'], publicRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/student', '/student'], studentRoutes);
app.use(['/api/teacher', '/teacher'], teacherRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/system', '/system'], systemRoutes);

// ==================== Error Handling ====================
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ==================== Server Start ====================
if (!process.env.VERCEL) {
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