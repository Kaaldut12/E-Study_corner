// backend/src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import publicRoutes from './routes/publicRoutes.js';
import systemRoutes from './routes/systemRoutes.js';
import { connectDB } from './src/config/db.js';

// V5 Production Security Middleware
import { securityHeaders, apiRateLimiter, sanitizeInput } from './src/middleware/security.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 3001;

// ==================== Middleware ====================

// Security headers & sliding-window rate limiting
app.use(securityHeaders);
app.use(apiRateLimiter);
app.use(sanitizeInput);

// CORS configuration - allow explicitly configured frontend origins and Vercel deployments.
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({
  origin: (requestOrigin, callback) => {
    if (!requestOrigin) return callback(null, true);

    if (allowedOrigins.includes('*') || allowedOrigins.includes(requestOrigin)) {
      return callback(null, true);
    }

    // Allow Vercel preview and production deployments
    if (requestOrigin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    return callback(new Error('Origin is not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware (basic)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ==================== Routes ====================

// Root info endpoint (prevents 404 on backend root URL)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-Study Corner API Gateway is active and operational.',
    institution: process.env.COLLEGE_NAME || 'National Institute of Technology & Advanced Studies',
    version: '1.0.0',
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

// API Routes - Mounted with both /api/* and root /* prefix for seamless cross-client compatibility
app.use(['/api/public', '/public'], publicRoutes);
app.use(['/api/auth', '/auth'], authRoutes);
app.use(['/api/student', '/student'], studentRoutes);
app.use(['/api/teacher', '/teacher'], teacherRoutes);
app.use(['/api/admin', '/admin'], adminRoutes);
app.use(['/api/system', '/system'], systemRoutes);

// ==================== Error Handling ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==================== Server Start ====================

// Only start standalone HTTP server if not running in serverless environment (e.g. Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║  E-Study Corner Backend              ║
║  Server running on port ${PORT}      ║
║  Environment: ${process.env.NODE_ENV || 'development'}║
║  Timestamp: ${new Date().toISOString()}  ║
╚══════════════════════════════════════╝
    `);
  });
}

export default app;