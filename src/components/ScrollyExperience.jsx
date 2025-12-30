import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const ScrollyExperience = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useGSAP(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const context = canvas.getContext("2d", { alpha: false }); // alpha: false for performance

    // NOTE: We will set canvas size on mount, but a resize listener is good practice
    const setSize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // SCROLL-TRIGGERED TIMELINE
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "+=800%", // Long scroll for smoothness (800vh)
        scrub: true, // Instant scrubbing (no lag)
        pin: true,
        anticipatePin: 1,
      }
    });

    // === PERFORMANCE LOGGER ===
    const perfLog = {
        frames: 0,
        lastLog: 0,
        seekTimes: [],
        renderTimes: [],
        longSeeks: 0
    };

    const logPerf = (action, duration) => {
        if (action === 'seek') perfLog.seekTimes.push(duration);
        if (action === 'render') perfLog.renderTimes.push(duration);
        
        const now = performance.now();
        if (now - perfLog.lastLog > 2000) { // Log every 2s
            const avgSeek = perfLog.seekTimes.reduce((a,b)=>a+b,0) / (perfLog.seekTimes.length || 1);
            const avgRender = perfLog.renderTimes.reduce((a,b)=>a+b,0) / (perfLog.renderTimes.length || 1);
            
            console.log(`%c[PERF] FPS: ${(perfLog.frames / 2).toFixed(1)} | Avg Seek: ${avgSeek.toFixed(1)}ms | Avg Render: ${avgRender.toFixed(1)}ms | Stalls: ${perfLog.longSeeks}`, 
            "color: #00ff00; background: #222; padding: 4px;");
            
            if (avgSeek > 30) console.warn("⚠️ High Seek Latency - Video decoding is the bottleneck!");
            
            perfLog.frames = 0;
            perfLog.seekTimes = [];
            perfLog.renderTimes = [];
            perfLog.lastLog = now;
        }
    };

    // 1. VIDEO LOADING & OPTIMIZATION
    const videoSources = [
      "/videos/hero-scrub.mp4", 
      "/videos/problem-scrub.mp4"
    ];

    const videos = videoSources.map(src => {
      const v = document.createElement("video");
      v.src = src;
      v.preload = "auto";
      v.muted = true;
      v.playsInline = true;
      v.load();
      return v;
    });

    const renderFrame = (video, opacity = 1) => {
      if (!video || !context) return;
      const t0 = performance.now();

      if (opacity < 1) context.globalAlpha = opacity;
      else context.globalAlpha = 1;

      // Draw 'cover' style logic
      const cw = canvas.width;
      const ch = canvas.height;
      const vw = video.videoWidth || 1920;
      const vh = video.videoHeight || 1080;
      const scale = Math.max(cw / vw, ch / vh);
      const nw = vw * scale;
      const nh = vh * scale;
      const x = (cw - nw) / 2;
      const y = (ch - nh) / 2;

      context.drawImage(video, x, y, nw, nh);
      logPerf('render', performance.now() - t0);
      perfLog.frames++;
    };

    // 2. TEXT ANIMATIONS (HHeuristics Content Integration)
    // Section 1: Hero (HHeuristics Brand)
    tl.fromTo(".section-hero", 
      { opacity: 0, scale: 0.95 }, 
      { opacity: 1, scale: 1, duration: 1, ease: "power2.out" }
    )
    .to(".section-hero", { opacity: 0, y: -50, duration: 1, ease: "power2.in" }, "+=1.5");

    // Section 2: Research (Matches "Problem" Video)
    tl.fromTo(".section-problem", 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1.5, ease: "power2.out" }, "-=0.5"
    )
    .to(".section-problem", { opacity: 0, y: -50, duration: 1.5 }, "+=2");

    // Section 3: Solutions (Report Cards)
    tl.fromTo(".section-solution", 
      { opacity: 0, scale: 0.9 }, 
      { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }, "-=1"
    )
    .to(".section-solution", { opacity: 0, scale: 1.05, duration: 2 }, "+=2");

    // 3. OPTIMIZED "SMART SEEK" LOGIC
    const scrollObj = { frame1: 0, frame2: 0, blend: 0 };

    // Helper: Only seek if not already seeking (prevents browser lockup)
    const smartSeek = (video, progress) => {
        if (!video.duration) return;
        const targetTime = progress * video.duration;
        
        // Tolerance: If we are close enough, don't waste CPU seeking
        if (Math.abs(video.currentTime - targetTime) < 0.05) return;

        if (!video.seeking) {
            const t0 = performance.now();
            video.currentTime = targetTime;
            // Measure seek time when 'seeked' fires
            const onSeeked = () => {
                const duration = performance.now() - t0;
                logPerf('seek', duration);
                if (duration > 50) perfLog.longSeeks++; // Track stutter events
                video.removeEventListener('seeked', onSeeked);
            };
            video.addEventListener('seeked', onSeeked, { once: true });
        }
    };

    // VIDEO 1
    tl.to(scrollObj, {
      frame1: 1,
      duration: 4,
      onUpdate: () => {
        const v = videos[0];
        smartSeek(v, scrollObj.frame1);
        // Always draw what we have (even if previous frame) to maintain 60fps responsiveness
        renderFrame(v, 1 - scrollObj.blend); 
      }
    }, 0);

    // BLEND
    tl.to(scrollObj, {
      blend: 1,
      duration: 1,
      ease: "power1.inOut",
      onUpdate: () => {
        const v1 = videos[0];
        const v2 = videos[1];

        // Optim aggressively: Only seek both if strictly needed. 
        // During blend, focus on smooth fade.
        smartSeek(v1, scrollObj.frame1);
        smartSeek(v2, scrollObj.frame2);

        context.clearRect(0,0, canvas.width, canvas.height);
        renderFrame(v1, 1); // Bottom layer
        renderFrame(v2, scrollObj.blend); // Top layer
      }
    }, 3.5);

    // VIDEO 2
    tl.to(scrollObj, {
      frame2: 1,
      duration: 4,
      onUpdate: () => {
        const v = videos[1];
        smartSeek(v, scrollObj.frame2);
        renderFrame(v, 1);
      }
    }, 4.5);
    
    return () => {
        window.removeEventListener('resize', setSize);
        ScrollTrigger.getAll().forEach(t => t.kill());
    };

  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full bg-black">
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full object-cover" style={{ pointerEvents: 'none' }} />
      
      {/* TEXT OVERLAYS - Fixed positioned for GSAP control */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-10">
          
          {/* HERO SECTION */}
          <div className="section-hero absolute inset-0 flex flex-col items-center justify-center p-8 text-center opacity-0">
              <div className="hero-brand mb-8">
                  <h1 className="hero-title-giant" style={{ fontSize: 'clamp(4rem, 15vw, 12rem)' }}>
                      <span className="title-letter">H</span>
                      <span className="title-letter">H</span>
                      <span className="title-letter accent">e</span>
                      <span className="title-letter">u</span>
                      <span className="title-letter">r</span>
                      <span className="title-letter">i</span>
                      <span className="title-letter">s</span>
                      <span className="title-letter">t</span>
                      <span className="title-letter">i</span>
                      <span className="title-letter">c</span>
                      <span className="title-letter">s</span>
                  </h1>
              </div>
              <p className="hero-tagline-apple text-xl md:text-2xl max-w-2xl mx-auto opacity-90">
                  Actionable Intelligence for Complex Decisions
              </p>
              <div className="hero-cta-group mt-12 pointer-events-auto">
                  <a href="#solutions" className="btn-primary-apple">Learn More</a>
              </div>
              {/* Scroll Indicator */}
              <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-3 opacity-60">
                  <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                      <div className="w-1 h-2 bg-yellow-500 rounded-full animate-bounce"></div>
                  </div>
              </div>
          </div>

          {/* RESEARCH / PROBLEM SECTION */}
          <div className="section-problem absolute inset-0 flex items-center justify-center p-8 opacity-0">
              <div className="section-content hover:scale-105 transition-transform duration-700 pointer-events-auto">
                  <h2 className="headline mb-6">Research That Drives Decisions</h2>
                  <p className="subtext text-lg leading-relaxed text-white/80">
                      We don't just aggregate data. We integrate primary research, proprietary datasets, and structured frameworks to deliver 
                      <span className="text-yellow-400 font-semibold"> actionable intelligence</span> when it matters most.
                  </p>
                  <div className="flex gap-4 justify-center mt-8">
                      <span className="pill border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">Strategy</span>
                      <span className="pill border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">Analytics</span>
                      <span className="pill border border-white/20 px-4 py-2 rounded-full backdrop-blur-md">Growth</span>
                  </div>
              </div>
          </div>

          {/* SOLUTIONS / REPORTS SECTION */}
          <div className="section-solution absolute inset-0 flex items-center justify-center p-8 opacity-0">
              <div className="max-w-6xl w-full">
                  <div className="text-center mb-12">
                      <h2 className="headline">Featured Reports</h2>
                      <p className="subtext">Strategic intelligence across technology, finance, and markets.</p>
                  </div>
                  
                  <div className="card-grid pointer-events-auto">
                      {/* Card 1 */}
                      <div className="card bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                          <span className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-4 block">Technology</span>
                          <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-blue-300 transition-colors">Fintech Disruption</h3>
                          <p className="text-white/60 mb-6">Deep dive into embedded finance and digital banking transformation through 2030.</p>
                          <span className="text-sm font-semibold text-white/80 group-hover:translate-x-2 transition-transform inline-block">Read Report →</span>
                      </div>

                      {/* Card 2 */}
                      <div className="card bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                          <span className="text-xs font-bold tracking-widest text-purple-400 uppercase mb-4 block">Analytics</span>
                          <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-purple-300 transition-colors">BI Platforms</h3>
                          <p className="text-white/60 mb-6">AI integration in business intelligence and vendor positioning strategies.</p>
                          <span className="text-sm font-semibold text-white/80 group-hover:translate-x-2 transition-transform inline-block">Read Report →</span>
                      </div>

                      {/* Card 3 */}
                      <div className="card bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group">
                          <span className="text-xs font-bold tracking-widest text-green-400 uppercase mb-4 block">Cloud</span>
                          <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-green-300 transition-colors">Cloud FinOps</h3>
                          <p className="text-white/60 mb-6">Cost optimization frameworks and governance for the modern enterprise.</p>
                          <span className="text-sm font-semibold text-white/80 group-hover:translate-x-2 transition-transform inline-block">Read Report →</span>
                      </div>
                  </div>
              </div>
          </div>
      </div>
      
      {/* Spacer for scroll depth - allows the pinned container to scroll 'through' time */}
      <div className="h-[800vh]" />
    </div>
  );
};

export default ScrollyExperience;
