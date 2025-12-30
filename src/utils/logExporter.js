/**
 * Log Exporter - Writes debug logs to a file that can be read by external tools
 * Creates a downloadable debug report
 */

import logger from './debugLogger';

// Create a debug status endpoint that can be polled
export function createDebugStatus() {
    const status = {
        timestamp: new Date().toISOString(),
        logsCount: logger.logs.length,
        recentLogs: logger.getRecent(100),
        summary: {
            errors: logger.logs.filter(l => l.level === 'ERROR').length,
            warnings: logger.logs.filter(l => l.level === 'WARN').length,
            videoEvents: logger.logs.filter(l => l.category === 'VIDEO').length,
            seekEvents: logger.logs.filter(l => l.category === 'SEEK').length,
        }
    };
    
    return status;
}

// Expose to window for easy console access
if (typeof window !== 'undefined') {
    window.getDebugStatus = createDebugStatus;
    
    window.exportLogs = () => {
        const status = createDebugStatus();
        console.log('=== DEBUG STATUS ===');
        console.log('Errors:', status.summary.errors);
        console.log('Warnings:', status.summary.warnings);
        console.log('Video Events:', status.summary.videoEvents);
        console.log('Seek Events:', status.summary.seekEvents);
        console.log('\n=== RECENT LOGS ===');
        status.recentLogs.forEach(log => {
            console.log(`[${log.level}] ${log.category}: ${log.message}`, log.data);
        });
        return status;
    };
    
    window.downloadLogs = () => {
        logger.download();
    };
    
    console.log('%c[DEBUG] Log tools available: window.exportLogs(), window.downloadLogs(), window.debugLogs', 'color: #4CAF50; font-weight: bold');
}

export default { createDebugStatus };
