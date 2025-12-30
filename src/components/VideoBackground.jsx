import { useRef, useEffect, useState } from 'react';
import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import logger from '../utils/debugLogger';

/**
 * Multi-Section Video Background with HD Videos
 * Uses file-based logging for debugging
 */

const VIDEO_SECTIONS = [
    {
        id: 'hero',
        // Using SMOOTH encoded video - every frame is a keyframe for true scrubbing
        src: '/videos/hero-smooth.mp4',
        // Video plays across 50% of page scroll for smooth frame-by-frame
        scrollStart: 0,
        scrollEnd: 0.5,
        colorTint: 'rgba(212, 175, 55, 0.05)',
    },
    {
        id: 'problem',
        // Using SMOOTH encoded video - every frame is a keyframe for true scrubbing
        src: '/videos/problem-smooth.mp4',
        // Overlaps with hero for crossfade
        scrollStart: 0.45,
        scrollEnd: 0.9,
        colorTint: 'rgba(139, 92, 246, 0.05)',
    },
];

// Track state
let frameCount = 0;
let lastLogTime = 0;
let videoRefs = {};

/**
 * Video scrub controller
 */
export function VideoBackgroundController() {
    const scroll = useScroll();
    const hasLoggedInit = useRef(false);

    useEffect(() => {
        if (!hasLoggedInit.current) {
            logger.info('VIDEO_CTRL', 'Controller mounted and ready');
            hasLoggedInit.current = true;
        }
    }, []);

    useFrame(() => {
        frameCount++;
        const now = performance.now();
        const scrollOffset = scroll.offset;
        
        // Log scroll position every 500ms
        if (now - lastLogTime > 500) {
            lastLogTime = now;
            logger.info('SCROLL', `Position update`, { offset: scrollOffset.toFixed(4), frame: frameCount });
        }

        VIDEO_SECTIONS.forEach((section, sectionIndex) => {
            const video = videoRefs[section.id];
            
            if (!video) {
                if (frameCount % 120 === 0) {
                    logger.warn('VIDEO', `Video ref missing for ${section.id}`);
                }
                return;
            }

            // Check video state
            if (!video.duration || isNaN(video.duration)) {
                if (frameCount % 120 === 0) {
                    logger.warn('VIDEO', `${section.id} - No duration yet`, {
                        readyState: video.readyState,
                        networkState: video.networkState,
                        error: video.error ? video.error.code : null
                    });
                }
                return;
            }

            const sectionDuration = section.scrollEnd - section.scrollStart;

            // Calculate section progress
            let sectionProgress = 0;
            if (scrollOffset >= section.scrollStart && scrollOffset <= section.scrollEnd) {
                sectionProgress = (scrollOffset - section.scrollStart) / sectionDuration;
            } else if (scrollOffset > section.scrollEnd) {
                sectionProgress = 1;
            }

            // Calculate target time
            const targetTime = sectionProgress * video.duration;
            const currentTime = video.currentTime;
            const timeDiff = Math.abs(currentTime - targetTime);

            // Update video time for ANY difference (smooth scrubbing)
            // Threshold lowered for frame-accurate seeking
            if (timeDiff > 0.001) {
                try {
                    video.currentTime = targetTime;
                    
                    // Log significant seeks only
                    if (timeDiff > 0.05 && frameCount % 30 === 0) {
                        logger.info('SEEK', `${section.id} seeking`, {
                            from: currentTime.toFixed(3),
                            to: targetTime.toFixed(3),
                            progress: (sectionProgress * 100).toFixed(1) + '%'
                        });
                    }
                } catch (err) {
                    logger.error('SEEK', `${section.id} seek failed`, { error: err.message });
                }
            }

            // Calculate opacity for crossfade
            const fadeRange = 0.04;
            let opacity = 0;

            if (scrollOffset < section.scrollStart) {
                opacity = 0;
            } else if (scrollOffset < section.scrollStart + fadeRange) {
                opacity = (scrollOffset - section.scrollStart) / fadeRange;
            } else if (scrollOffset < section.scrollEnd - fadeRange) {
                opacity = 1;
            } else if (scrollOffset < section.scrollEnd) {
                opacity = 1 - (scrollOffset - (section.scrollEnd - fadeRange)) / fadeRange;
            } else if (sectionIndex === VIDEO_SECTIONS.length - 1) {
                opacity = Math.max(0, 1 - (scrollOffset - section.scrollEnd) * 3);
            }

            video.style.opacity = opacity;
        });
    });

    return null;
}

/**
 * Individual Video Element with comprehensive event handlers
 */
function VideoElement({ section, index, onRef }) {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Register ref globally
        videoRefs[section.id] = video;
        onRef && onRef(video);

        const loadStart = performance.now();

        logger.info('VIDEO', `${section.id} - Initializing`, { src: section.src });

        // Essential event handlers
        const handlers = {
            loadstart: () => {
                logger.info('VIDEO', `${section.id} - Load started`);
            },
            
            loadedmetadata: () => {
                logger.info('VIDEO', `${section.id} - Metadata loaded`, {
                    duration: video.duration?.toFixed(2),
                    size: `${video.videoWidth}x${video.videoHeight}`
                });
            },
            
            loadeddata: () => {
                const loadTime = performance.now() - loadStart;
                logger.info('VIDEO', `${section.id} - Data loaded`, {
                    loadTimeMs: loadTime.toFixed(0),
                    readyState: video.readyState
                });
            },
            
            canplay: () => {
                logger.info('VIDEO', `${section.id} - Can play`);
            },
            
            canplaythrough: () => {
                const loadTime = performance.now() - loadStart;
                logger.info('VIDEO', `${section.id} - ✓ READY`, {
                    totalLoadTimeMs: loadTime.toFixed(0)
                });
                
                // Ensure video is paused and at start
                video.pause();
                video.currentTime = 0;
            },
            
            error: (e) => {
                const error = video.error;
                let msg = 'Unknown';
                if (error) {
                    const codes = {
                        1: 'ABORTED',
                        2: 'NETWORK',
                        3: 'DECODE',
                        4: 'SRC_NOT_SUPPORTED'
                    };
                    msg = codes[error.code] || `Code ${error.code}`;
                }
                logger.error('VIDEO', `${section.id} - ERROR: ${msg}`, {
                    code: error?.code,
                    message: error?.message
                });
            },
            
            waiting: () => {
                logger.warn('VIDEO', `${section.id} - Buffering`, {
                    currentTime: video.currentTime?.toFixed(2),
                    readyState: video.readyState
                });
            },
            
            stalled: () => {
                logger.warn('VIDEO', `${section.id} - Stalled`);
            },
            
            seeked: () => {
                // Only log periodically to avoid spam
                if (frameCount % 60 === 0) {
                    logger.info('VIDEO', `${section.id} - Seeked to ${video.currentTime?.toFixed(2)}`);
                }
            }
        };

        // Attach all handlers
        Object.entries(handlers).forEach(([event, handler]) => {
            video.addEventListener(event, handler);
        });

        // Force load
        video.load();

        // Cleanup
        return () => {
            Object.entries(handlers).forEach(([event, handler]) => {
                video.removeEventListener(event, handler);
            });
            delete videoRefs[section.id];
        };
    }, [section.id, section.src, onRef]);

    return (
        <div style={{ position: 'absolute', inset: 0 }}>
            <video
                ref={videoRef}
                src={section.src}
                muted
                playsInline
                preload="auto"
                crossOrigin="anonymous"
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    minWidth: '100%',
                    minHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'cover',
                    zIndex: index + 1,
                    opacity: index === 0 ? 1 : 0,
                    pointerEvents: 'none',
                }}
            />
            
            {/* Color tint overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: section.colorTint,
                    mixBlendMode: 'overlay',
                    zIndex: index + 10,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}

/**
 * Main Video Background Container
 */
export function VideoBackground() {
    const containerRef = useRef(null);

    useEffect(() => {
        logger.info('VIDEO_BG', 'Video Background mounted', {
            videoCount: VIDEO_SECTIONS.length,
            videos: VIDEO_SECTIONS.map(s => s.id).join(', ')
        });

        // Log browser capabilities
        const testVideo = document.createElement('video');
        logger.info('SYSTEM', 'Browser video support', {
            mp4: testVideo.canPlayType('video/mp4'),
            webm: testVideo.canPlayType('video/webm'),
            h264: testVideo.canPlayType('video/mp4; codecs="avc1.42E01E"')
        });

        return () => {
            logger.info('VIDEO_BG', 'Video Background unmounted');
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                zIndex: -1,
                overflow: 'hidden',
                background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #0a0a0a 100%)',
            }}
        >
            {VIDEO_SECTIONS.map((section, index) => (
                <VideoElement 
                    key={section.id} 
                    section={section} 
                    index={index}
                />
            ))}

            {/* Gradient overlay */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: `linear-gradient(to bottom,
                        rgba(0,0,0,0.2) 0%,
                        rgba(0,0,0,0.15) 30%,
                        rgba(0,0,0,0.2) 70%,
                        rgba(0,0,0,0.4) 100%
                    )`,
                    zIndex: 100,
                    pointerEvents: 'none',
                }}
            />

            {/* Vignette */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: 'inset 0 0 150px 50px rgba(0,0,0,0.3)',
                    zIndex: 101,
                    pointerEvents: 'none',
                }}
            />
        </div>
    );
}
