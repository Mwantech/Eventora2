// Save this as: alive.js (in your project root)

const mongoose = require('mongoose');

// ===========================================
// KEEP-ALIVE SERVICE SETUP
// ===========================================

let keepAliveService = null;

// Only run keep-alive in production or when explicitly enabled
const shouldRunKeepAlive = process.env.NODE_ENV === 'production' || 
                          process.env.ENABLE_KEEP_ALIVE === 'true';

/**
 * Create a simple keep-alive service
 * @param {string} url - URL to ping
 * @param {number} intervalMinutes - Interval in minutes between pings
 * @returns {Object} Keep-alive service object
 */
const createKeepAliveService = (url, intervalMinutes) => {
  let intervalId = null;
  let isRunning = false;
  let lastPingTime = null;
  let lastPingStatus = null;
  let pingCount = 0;
  
  return {
    start: () => {
      if (isRunning) {
        console.log('⚠️  Keep-alive service is already running');
        return;
      }
      
      console.log(`🔄 Starting keep-alive service for ${url} (every ${intervalMinutes} minutes)`);
      isRunning = true;
      
      // Function to perform the ping
      const performPing = async () => {
        try {
          // Try different ways to get fetch
          let fetch;
          try {
            // Try node-fetch first
            fetch = require('node-fetch');
            if (fetch.default) fetch = fetch.default;
          } catch (error) {
            // Try built-in fetch (Node.js 18+)
            if (typeof globalThis.fetch !== 'undefined') {
              fetch = globalThis.fetch;
            } else {
              throw new Error('No fetch implementation available');
            }
          }
          
          const response = await fetch(url, {
            method: 'GET',
            timeout: 30000, // 30 second timeout
            headers: {
              'User-Agent': 'Keep-Alive-Service/1.0'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            pingCount++;
            lastPingTime = new Date();
            lastPingStatus = 'success';
            console.log(`✅ Keep-alive ping #${pingCount} successful: ${data.message || 'OK'}`);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          lastPingTime = new Date();
          lastPingStatus = 'failed';
          console.error(`❌ Keep-alive ping failed: ${error.message}`);
        }
      };
      
      // Perform initial ping after 30 seconds
      setTimeout(performPing, 30000);
      
      // Set up regular interval
      intervalId = setInterval(performPing, intervalMinutes * 60 * 1000);
    },
    
    stop: () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
        isRunning = false;
        console.log('🛑 Keep-alive service stopped');
      }
    },
    
    isRunning: () => isRunning,
    
    getStatus: () => ({
      isRunning,
      url,
      intervalMinutes,
      lastPingTime,
      lastPingStatus,
      pingCount,
      nextPing: isRunning ? `${intervalMinutes} minutes from last ping` : 'Stopped'
    })
  };
};

/**
 * Initialize the keep-alive service
 * @param {Express} app - Express application instance
 * @param {Server} server - HTTP server instance
 */
const initialize = (app, server) => {
  console.log('🔄 Initializing keep-alive service...');
  
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
      },
      keepAlive: keepAliveService ? keepAliveService.getStatus() : { status: 'not initialized' }
    });
  });

  if (shouldRunKeepAlive) {
    try {
      // Get the service URL from environment or construct it
      const serviceUrl = process.env.RENDER_EXTERNAL_URL || 
                        (process.env.RENDER_SERVICE_NAME ? 
                          `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : null) ||
                        `http://localhost:${process.env.PORT || 5500}`;
      
      // Create keep-alive service with 5-minute interval
      keepAliveService = createKeepAliveService(`${serviceUrl}/ping`, 5);
      
      // Store reference globally for graceful shutdown
      global.keepAliveService = keepAliveService;
      
      console.log(`🔄 Keep-alive service configured for: ${serviceUrl}/ping (5-minute intervals)`);
      
      // Keep-alive control endpoints (for debugging/monitoring)
      app.get('/api/keep-alive/start', (req, res) => {
        try {
          if (keepAliveService) {
            keepAliveService.start();
            res.json({ 
              success: true, 
              message: 'Keep-alive service started',
              url: `${serviceUrl}/ping`,
              interval: '5 minutes'
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
      
      // Auto-start the keep-alive service after a delay
      setTimeout(() => {
        try {
          if (keepAliveService) {
            keepAliveService.start();
            console.log('✅ Keep-alive service started automatically (5-minute intervals)');
          }
        } catch (error) {
          console.error('❌ Failed to auto-start keep-alive service:', error.message);
        }
      }, 60000); // Wait 60 seconds after initialization
      
    } catch (error) {
      console.error('❌ Failed to initialize keep-alive service:', error.message);
    }
  } else {
    console.log('ℹ️  Keep-alive service disabled (not in production)');
  }
};

/**
 * Get the current keep-alive service instance
 * @returns {Object|null} Keep-alive service instance or null
 */
const getKeepAliveService = () => {
  return keepAliveService;
};

/**
 * Check if keep-alive service is running
 * @returns {boolean} True if service is running
 */
const isRunning = () => {
  return keepAliveService && keepAliveService.isRunning ? keepAliveService.isRunning() : false;
};

/**
 * Start the keep-alive service manually
 * @returns {boolean} True if started successfully
 */
const start = () => {
  if (keepAliveService) {
    try {
      keepAliveService.start();
      return true;
    } catch (error) {
      console.error('Error starting keep-alive service:', error.message);
      return false;
    }
  }
  return false;
};

/**
 * Stop the keep-alive service manually
 * @returns {boolean} True if stopped successfully
 */
const stop = () => {
  if (keepAliveService) {
    try {
      keepAliveService.stop();
      return true;
    } catch (error) {
      console.error('Error stopping keep-alive service:', error.message);
      return false;
    }
  }
  return false;
};

/**
 * Get keep-alive service status
 * @returns {Object} Status object with service information
 */
const getStatus = () => {
  if (keepAliveService && keepAliveService.getStatus) {
    return keepAliveService.getStatus();
  }
  return {
    isRunning: false,
    error: 'Keep-alive service not initialized'
  };
};

// Export the module
module.exports = {
  initialize,
  getKeepAliveService,
  isRunning,
  start,
  stop,
  getStatus
};