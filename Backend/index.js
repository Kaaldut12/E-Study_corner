// backend/index.js
import express from 'express';
import cors from 'cors';

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

// Production Security Middleware & Error Handlers
import { securityHeaders, apiRateLimiter, sanitizeInput } from './src/middleware/security.js';
import { notFoundHandler, globalErrorHandler } from './src/middleware/errorMiddleware.js';

// Connect to MongoDB (single source of truth)
connectDB().catch((err) => {
  console.error('Database connection startup warning:', err.message);
});

const app = express();

// ==================== Middleware ====================

// Security headers & sliding-window rate limiting
app.use(securityHeaders);
app.use(apiRateLimiter);
app.use(sanitizeInput);

// CORS configuration - strictly allows configured frontend origins and verified environments
app.use(cors({
  origin: (requestOrigin, callback) => {
    // Allow non-browser or same-origin requests without origin header (e.g. mobile apps, curl, server-to-server)
    if (!requestOrigin) return callback(null, true);

    const isAllowed = ALLOWED_ORIGINS.includes(requestOrigin) ||
      requestOrigin.endsWith('.vercel.app') ||
      (process.env.NODE_ENV !== 'production' && (
        requestOrigin.startsWith('http://localhost:') ||
        requestOrigin.startsWith('http://127.0.0.1:')
      ));

    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${requestOrigin}`));
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

// Database connection middleware: ensures MongoDB connection is attempted before routes execute
app.use(async (req, res, next) => {
  if (req.path === '/' || req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  try {
    await connectDB();
  } catch (err) {
    console.warn('[Database Connection Notice]:', err.message);
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
      public: '/api/public',
      system: '/api/system'
    }
  });
});

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  const uri = MONGODB_URI || '';
  const sanitizedUri = uri.replace(/\/\/[^@]+@/, '//***:***@');
  res.json({
    status: 'Server is running',
    timestamp: new Date().toISOString(),
    databaseHost: sanitizedUri
  });
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