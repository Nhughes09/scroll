/**
 * Debug Logger - Writes logs to localStorage and exposes via window for file export
 * This allows debugging without relying on visual inspection
 */

const MAX_LOGS = 500;
const LOG_KEY = 'scrolly_debug_logs';

class DebugLogger {
    constructor() {
        this.logs = [];
        this.loadFromStorage();
        
        // Expose globally for easy access
        window.debugLogs = this;
        
        // Auto-save periodically
        setInterval(() => this.saveToStorage(), 2000);
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(LOG_KEY);
            if (stored) {
                this.logs = JSON.parse(stored);
            }
        } catch (e) {
            this.logs = [];
        }
    }
    
    saveToStorage() {
        try {
            localStorage.setItem(LOG_KEY, JSON.stringify(this.logs.slice(-MAX_LOGS)));
        } catch (e) {
            // Storage full, clear old logs
            this.logs = this.logs.slice(-100);
        }
    }
    
    getTimestamp() {
        return new Date().toISOString();
    }
    
    addLog(level, category, message, data = {}) {
        const entry = {
            time: this.getTimestamp(),
            level,
            category,
            message,
            data
        };
        
        this.logs.push(entry);
        
        // Also log to console with styling
        const styles = {
            INFO: 'color: #4CAF50',
            WARN: 'color: #FF9800',
            ERROR: 'color: #f44336; font-weight: bold',
            PERF: 'color: #2196F3'
        };
        
        console.log(
            `%c[${entry.time.split('T')[1].split('.')[0]}] [${level}] ${category}: ${message}`,
            styles[level] || '',
            Object.keys(data).length > 0 ? data : ''
        );
        
        // Trim if too many logs
        if (this.logs.length > MAX_LOGS) {
            this.logs = this.logs.slice(-MAX_LOGS);
        }
    }
    
    info(category, message, data) {
        this.addLog('INFO', category, message, data);
    }
    
    warn(category, message, data) {
        this.addLog('WARN', category, message, data);
    }
    
    error(category, message, data) {
        this.addLog('ERROR', category, message, data);
    }
    
    perf(category, message, data) {
        this.addLog('PERF', category, message, data);
    }
    
    // Get all logs as formatted text
    getText() {
        return this.logs.map(l => 
            `[${l.time}] [${l.level}] ${l.category}: ${l.message} ${JSON.stringify(l.data)}`
        ).join('\n');
    }
    
    // Get recent logs
    getRecent(count = 50) {
        return this.logs.slice(-count);
    }
    
    // Get logs as downloadable file content
    getForDownload() {
        return {
            exportTime: new Date().toISOString(),
            logCount: this.logs.length,
            logs: this.logs
        };
    }
    
    // Clear all logs
    clear() {
        this.logs = [];
        localStorage.removeItem(LOG_KEY);
        this.info('SYSTEM', 'Logs cleared');
    }
    
    // Download logs as JSON file
    download() {
        const blob = new Blob([JSON.stringify(this.getForDownload(), null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `scrolly-debug-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Create singleton instance
const logger = new DebugLogger();

// Log initial system info
logger.info('SYSTEM', 'Debug logger initialized', {
    userAgent: navigator.userAgent,
    screenSize: `${window.innerWidth}x${window.innerHeight}`,
    timestamp: new Date().toISOString()
});

export default logger;
