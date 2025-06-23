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
const feedbackRoutes = require('./routes/feedbackRoutes'); // Import feedback routes

// Initialize app
const app = express();

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
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
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
      'http://192.168.199.185:8081',
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

// Keep-alive status endpoint
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
    }
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
// JWT AUTHENTICATION MIDDLEWARE
// ===========================================


// ===========================================
// ROUTES
// ===========================================

// Auth routes (auth limiter is now applied within the route file)
app.use('/api/auth', authRoutes);

// Protected routes (authentication required)
app.use('/api/events', eventRoutes);
app.use('/api/invitations', inviationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/feedback', feedbackRoutes); // Feedback routes with auth
app.use('/api', mediaRoutes);

// ===========================================
// KEEP-ALIVE SERVICE SETUP
// ===========================================

let keepAliveService = null;

// Only run keep-alive in production or when explicitly enabled
const shouldRunKeepAlive = process.env.NODE_ENV === 'production' || 
                          process.env.ENABLE_KEEP_ALIVE === 'true';

if (shouldRunKeepAlive) {
  try {
    const { createKeepAliveService } = require('./keep-alive');
    
    // Get the service URL from environment or construct it
    const serviceUrl = process.env.RENDER_EXTERNAL_URL || 
                      (process.env.RENDER_SERVICE_NAME ? 
                        `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : null) ||
                      `http://localhost:${process.env.PORT || 5500}`;
    
    keepAliveService = createKeepAliveService(`${serviceUrl}/ping`, 14);
    
    console.log(`🔄 Keep-alive service configured for: ${serviceUrl}/ping`);
    
    // Keep-alive control endpoints (for debugging/monitoring)
    app.get('/api/keep-alive/start', (req, res) => {
      try {
        if (keepAliveService) {
          keepAliveService.start();
          res.json({ 
            success: true, 
            message: 'Keep-alive service started',
            url: `${serviceUrl}/ping`
          });
        } else {
          res.status(500).json({ 
            success: false, 
            message: 'Keep-alive service not initialized' 
          });
        }
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    });
    
    app.get('/api/keep-alive/stop', (req, res) => {
      try {
        if (keepAliveService) {
          keepAliveService.stop();
          res.json({ 
            success: true, 
            message: 'Keep-alive service stopped' 
          });
        } else {
          res.status(404).json({ 
            success: false, 
            message: 'Keep-alive service not found' 
          });
        }
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    });
    
    app.get('/api/keep-alive/info', (req, res) => {
      try {
        if (keepAliveService) {
          res.json({
            success: true,
            ...keepAliveService.getStatus(),
            targetUrl: `${serviceUrl}/ping`
          });
        } else {
          res.status(404).json({
            success: false,
            message: 'Keep-alive service not initialized'
          });
        }
      } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to initialize keep-alive service:', error.message);
    console.log('Make sure to install: npm install node-cron');
  }
} else {
  console.log('ℹ️  Keep-alive service disabled (not in production)');
}

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

const gracefulShutdown = () => {
  console.log('Received shutdown signal, shutting down gracefully...');
  
  // Stop keep-alive service
  if (keepAliveService) {
    console.log('Stopping keep-alive service...');
    keepAliveService.stop();
  }
  
  // Close MongoDB connection
  mongoose.connection.close(() => {
    console.log('MongoDB connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

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
  
  // Start keep-alive service after server is fully running
  if (shouldRunKeepAlive && keepAliveService) {
    setTimeout(() => {
      try {
        keepAliveService.start();
        console.log('✅ Keep-alive service started successfully');
      } catch (error) {
        console.error('❌ Failed to start keep-alive service:', error.message);
      }
    }, 60000); // Wait 30 seconds after server start
  }
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
});

module.exports = app;