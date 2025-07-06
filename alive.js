// Save this as: alive.js (in your project root)

const mongoose = require('mongoose');
const https = require('https');
const http = require('http');

// ===========================================
// KEEP-ALIVE SERVICE SETUP
// ===========================================

let keepAliveService = null;

// Only run keep-alive in production or when explicitly enabled
const shouldRunKeepAlive = process.env.NODE_ENV === 'production' || 
                          process.env.ENABLE_KEEP_ALIVE === 'true';

/**
 * Make HTTP request using Node.js built-in modules
 * @param {string} url - URL to ping
 * @returns {Promise} Promise that resolves with response data
 */
const makeHttpRequest = (url) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Keep-Alive-Service/1.0',
        'Accept': 'application/json'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: jsonData,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        } catch (error) {
          // If JSON parsing fails, return raw data
          resolve({
            statusCode: res.statusCode,
            data: data,
            ok: res.statusCode >= 200 && res.statusCode < 300
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
};

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
          const response = await makeHttpRequest(url);
          
          if (response.ok) {
            pingCount++;
            lastPingTime = new Date();
            lastPingStatus = 'success';
            console.log(`✅ Keep-alive ping #${pingCount} successful: ${response.data.message || 'OK'}`);
          } else {
            throw new Error(`HTTP ${response.statusCode}: ${response.data}`);
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