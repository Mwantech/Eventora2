const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');

// Load env variables
dotenv.config();

// Import route files
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const inviationRoutes = require('./routes/invitationRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// Initialize app
const app = express();

// ===========================================
// TRUST PROXY CONFIGURATION (IMPORTANT FOR PRODUCTION)
// ===========================================

// Enable trust proxy for production deployments (Render, Heroku, etc.)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy (required for rate limiting behind reverse proxy)
  console.log('✅ Trust proxy enabled for production');
} else {
  app.set('trust proxy', false);
  console.log('ℹ️  Trust proxy disabled for development');
}

// ===========================================
// DATABASE CONNECTION
// ===========================================

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || '', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// General rate limiting for all routes
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests for some routes
  skip: (req, res) => {
    // Don't count health check endpoints against rate limit
    return req.path === '/ping' || req.path === '/api/health' || req.path === '/api/status';
  }
});

// Apply general rate limiting to all requests
app.use(limiter);

// ===========================================
// MIDDLEWARE
// ===========================================

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Enhanced CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Development URLs that should always be allowed
    const developmentOrigins = [
      process.env.CLIENT_URL || 'http://localhost:8081',
      'http://192.168.33.89:8081',
      'https://eventora-app.netlify.app',
      'http://localhost:8081',
      'http://localhost:5173'
    ];
    
    // Allow requests with no origin (React Native apps, mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Always allow development URLs regardless of environment
    if (developmentOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In production, also check for additional allowed domains
    if (process.env.NODE_ENV === 'production') {
      const allowedDomains = process.env.ALLOWED_DOMAINS ? 
        process.env.ALLOWED_DOMAINS.split(',') : [];
      
      if (allowedDomains.some(domain => origin.includes(domain))) {
        return callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development - allow other origins as well
      console.log('CORS blocked origin:', origin);
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma',
    'x-api-key'
  ],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

app.use(cors(corsOptions));

// Additional security headers
app.use((req, res, next) => {
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ===========================================
// PUBLIC ENDPOINTS (NO AUTHENTICATION REQUIRED)
// ===========================================

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

// More detailed status endpoint
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running!',
    status: 'operational',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'production',
    version: process.env.APP_VERSION || '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Enhanced ping endpoint with keep-alive features
app.get('/ping', (req, res) => {
  const timestamp = new Date();
  
  res.json({ 
    success: true, 
    message: 'pong',
    timestamp: timestamp,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid,
    version: process.env.APP_VERSION || '1.0.0',
    keepAlive: true,
    environment: process.env.NODE_ENV || 'production'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Server is running',
    endpoints: {
      health: '/api/health',
      status: '/api/status',
      ping: '/ping',
      keepAliveStatus: '/api/keep-alive/status'
    }
  });
});

// ===========================================
// ROUTES
// ===========================================

// Auth routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/events', eventRoutes);
app.use('/api/invitations', inviationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api', mediaRoutes);

// ===========================================
// ERROR HANDLING
// ===========================================

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' ? 
    'Internal server error' : err.message;
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: message
  });
});

// ===========================================
// GRACEFUL SHUTDOWN
// ===========================================

const gracefulShutdown = async () => {
  console.log('Received shutdown signal, shutting down gracefully...');
  
  // Stop keep-alive service
  if (global.keepAliveService) {
    console.log('Stopping keep-alive service...');
    try {
      global.keepAliveService.stop();
      console.log('Keep-alive service stopped successfully');
    } catch (error) {
      console.error('Error stopping keep-alive service:', error.message);
    }
  }
  
  // Close server first
  if (server) {
    console.log('Closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed');
    });
  }
  
  // Close MongoDB connection
  try {
    console.log('Closing MongoDB connection...');
    await mongoose.connection.close();
    console.log('MongoDB connection closed successfully');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error.message);
  }
  
  // Exit process
  process.exit(0);
};

// Handle shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown();
});

// ===========================================
// START SERVER
// ===========================================

const PORT = process.env.PORT || 5500;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log('🌐 Public endpoints available:');
  console.log(`  - GET /api/health`);
  console.log(`  - GET /api/status`);
  console.log(`  - GET /ping`);
  console.log(`  - GET /api/keep-alive/status`);
  console.log(`  - GET /`);
  
  // Initialize keep-alive service after server is fully running
  setTimeout(() => {
    initializeKeepAliveService();
  }, 5000); // Wait 5 seconds for server to fully start
});

// ===========================================
// KEEP-ALIVE SERVICE INITIALIZATION
// ===========================================

function initializeKeepAliveService() {
  console.log('🔍 Initializing keep-alive service...');
  
  // Try Method 1: alive.js with initialize function
  try {
    console.log('🔍 Trying alive.js service...');
    const aliveService = require('./alive');
    
    if (aliveService && typeof aliveService.initialize === 'function') {
      aliveService.initialize(app, server);
      console.log('✅ Keep-alive service initialized successfully from alive.js');
      return;
    } else {
      console.log('❌ initialize function not found in alive service');
      console.log('Available functions:', Object.keys(aliveService || {}));
    }
  } catch (error) {
    console.error('❌ Failed to import alive service:', error.message);
  }
  
  // Try Method 2: keep-alive.js with createKeepAliveService function
  try {
    console.log('🔍 Trying keep-alive.js service...');
    const keepAliveModule = require('./keep-alive');
    
    if (keepAliveModule && typeof keepAliveModule.createKeepAliveService === 'function') {
      // Get the service URL
      const serviceUrl = process.env.RENDER_EXTERNAL_URL || 
                        (process.env.RENDER_SERVICE_NAME ? 
                          `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : null) ||
                        `http://localhost:${PORT}`;
      
      const keepAliveService = keepAliveModule.createKeepAliveService(`${serviceUrl}/ping`, 14);
      
      // Store reference globally for graceful shutdown
      global.keepAliveService = keepAliveService;
      
      // Start the service
      keepAliveService.start();
      console.log('✅ Keep-alive service started successfully from keep-alive.js');
      
      // Add status endpoint
      app.get('/api/keep-alive/status', (req, res) => {
        res.json({
          success: true,
          message: 'Keep-alive monitoring endpoint',
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date(),
            environment: process.env.NODE_ENV || 'production'
          },
          database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            name: mongoose.connection.name || 'unknown'
          },
          keepAlive: keepAliveService.getStatus()
        });
      });
      
      // Add control endpoints
      app.get('/api/keep-alive/start', (req, res) => {
        try {
          keepAliveService.start();
          res.json({ 
            success: true, 
            message: 'Keep-alive service started',
            status: keepAliveService.getStatus()
          });
        } catch (error) {
          res.status(500).json({ 
            success: false, 
            message: error.message 
          });
        }
      });
      
      app.get('/api/keep-alive/stop', (req, res) => {
        try {
          keepAliveService.stop();
          res.json({ 
            success: true, 
            message: 'Keep-alive service stopped',
            status: keepAliveService.getStatus()
          });
        } catch (error) {
          res.status(500).json({ 
            success: false, 
            message: error.message 
          });
        }
      });
      
      return;
    } else {
      console.log('❌ createKeepAliveService function not found in keep-alive service');
      console.log('Available functions:', Object.keys(keepAliveModule || {}));
    }
  } catch (error) {
    console.error('❌ Failed to initialize keep-alive service from keep-alive.js:', error.message);
  }
  
  // Try Method 3: Direct class instantiation from keep-alive.js
  try {
    console.log('🔍 Trying direct KeepAliveService class...');
    const keepAliveModule = require('./keep-alive');
    
    if (keepAliveModule && keepAliveModule.KeepAliveService) {
      // Get the service URL
      const serviceUrl = process.env.RENDER_EXTERNAL_URL || 
                        (process.env.RENDER_SERVICE_NAME ? 
                          `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : null) ||
                        `http://localhost:${PORT}`;
      
      const keepAliveService = new keepAliveModule.KeepAliveService(`${serviceUrl}/ping`, 14);
      
      // Store reference globally for graceful shutdown
      global.keepAliveService = keepAliveService;
      
      // Start the service
      keepAliveService.start();
      console.log('✅ Keep-alive service started successfully using KeepAliveService class');
      
      // Add status endpoint
      app.get('/api/keep-alive/status', (req, res) => {
        res.json({
          success: true,
          message: 'Keep-alive monitoring endpoint',
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date(),
            environment: process.env.NODE_ENV || 'production'
          },
          database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
            name: mongoose.connection.name || 'unknown'
          },
          keepAlive: keepAliveService.getStatus()
        });
      });
      
      return;
    }
  } catch (error) {
    console.error('❌ Failed to initialize KeepAliveService class:', error.message);
  }
  
  console.log('⚠️  Keep-alive service could not be initialized');
  console.log('ℹ️  Server will continue to run without keep-alive functionality');
  console.log('💡 Make sure you have node-cron installed: npm install node-cron');
}

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = app;