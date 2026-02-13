const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Simple logging middleware to write to access.log
app.use((req, res, next) => {
    const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), logEntry);
    next();
});

// Helper to get Git Info
const getGitInfo = () => {
    try {
        // Look for git info in the project root (one level up from backend/)
        return execSync('git log -1 --format="%h - %an (%ar): %s"', { 
            encoding: 'utf8',
            cwd: path.join(__dirname, '..')
        }).trim();
    } catch (e) {
        return 'Git info not available (not a git repo or git not installed)';
    }
};

// Helper to get Docker Info
const getDockerInfo = () => {
    try {
        // Check for .dockerenv file
        if (fs.existsSync('/.dockerenv')) {
            return 'Running inside Docker container (.dockerenv found)';
        }
        // Check cgroup for docker strings
        if (fs.existsSync('/proc/1/cgroup')) {
            const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8');
            if (cgroup.includes('docker')) {
                return 'Running inside Docker container (cgroup check)';
            }
        }
        // Check for common Docker environment variables
        if (process.env.DOCKER_CONTAINER || process.env.IS_DOCKER) {
            return 'Running inside Docker container (env var check)';
        }
    } catch (e) {
        // Ignore errors
    }
    return 'Not running in Docker or info unavailable';
};

// API Demo Endpoint
app.get('/api/demo', (req, res) => {
    res.json({
        status: 'success',
        data: {
            git: getGitInfo(),
            docker: getDockerInfo()
        },
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Backend server is running correctly',
        endpoints: {
            demo: '/api/demo'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const errorLog = `[${new Date().toISOString()}] ERROR: ${err.message}\n${err.stack}\n`;
    fs.appendFileSync(path.join(logsDir, 'access.log'), errorLog);
    
    console.error('Server Error:', err);
    
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

app.listen(PORT, () => {
    console.log(`=================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📂 Logs: ${path.join(logsDir, 'access.log')}`);
    console.log(`=================================`);
});