// keep-alive.js - Internal cron job solution
const cron = require('node-cron');
const https = require('https');
const http = require('http');

class KeepAliveService {
  constructor(serverUrl, intervalMinutes = 14) {
    this.serverUrl = serverUrl;
    this.intervalMinutes = intervalMinutes;
    this.isRunning = false;
    this.cronJob = null;
  }

  // Make HTTP request to ping endpoint
  pingServer() {
    return new Promise((resolve, reject) => {
      const url = new URL(this.serverUrl);
      const client = url.protocol === 'https:' ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'GET',
        timeout: 10000, // 10 seconds timeout
        headers: {
          'User-Agent': 'KeepAlive-Service/1.0'
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] Keep-alive ping successful:`, {
            statusCode: res.statusCode,
            response: data
          });
          resolve({ statusCode: res.statusCode, data });
        });
      });

      req.on('error', (error) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] Keep-alive ping failed:`, error.message);
        reject(error);
      });

      req.on('timeout', () => {
        req.destroy();
        const error = new Error('Request timeout');
        console.error(`[${new Date().toISOString()}] Keep-alive ping timeout`);
        reject(error);
      });

      req.end();
    });
  }

  // Start the keep-alive service
  start() {
    if (this.isRunning) {
      console.log('Keep-alive service is already running');
      return;
    }

    // Create cron expression for every N minutes
    const cronExpression = `*/${this.intervalMinutes} * * * *`;
    
    console.log(`Starting keep-alive service...`);
    console.log(`Pinging ${this.serverUrl} every ${this.intervalMinutes} minutes`);
    console.log(`Cron expression: ${cronExpression}`);

    this.cronJob = cron.schedule(cronExpression, async () => {
      try {
        await this.pingServer();
      } catch (error) {
        console.error('Keep-alive ping error:', error.message);
      }
    }, {
      scheduled: false // Don't start immediately
    });

    // Start the cron job
    this.cronJob.start();
    this.isRunning = true;

    // Do an initial ping
    this.pingServer().catch(err => {
      console.error('Initial keep-alive ping failed:', err.message);
    });

    console.log('Keep-alive service started successfully');
  }

  // Stop the keep-alive service
  stop() {
    if (!this.isRunning) {
      console.log('Keep-alive service is not running');
      return;
    }

    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob.destroy();
      this.cronJob = null;
    }

    this.isRunning = false;
    console.log('Keep-alive service stopped');
  }

  // Get service status
  getStatus() {
    return {
      isRunning: this.isRunning,
      serverUrl: this.serverUrl,
      intervalMinutes: this.intervalMinutes,
      nextRun: this.cronJob ? this.cronJob.nextDates(1).toString() : null
    };
  }
}

// Factory function to create and start keep-alive service
function createKeepAliveService(serverUrl, intervalMinutes = 14) {
  const service = new KeepAliveService(serverUrl, intervalMinutes);
  
  // Handle graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, stopping keep-alive service...');
    service.stop();
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, stopping keep-alive service...');
    service.stop();
  });

  return service;
}

module.exports = {
  KeepAliveService,
  createKeepAliveService
};

// Example usage:
// const { createKeepAliveService } = require('./keep-alive');
// const keepAliveService = createKeepAliveService('https://your-app.onrender.com/ping');
// keepAliveService.start();