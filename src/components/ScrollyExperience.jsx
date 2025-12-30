import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

gsap.registerPlugin(ScrollTrigger);

// Video sources - All Intra encoded for smooth scrubbing (2 videos only)
const videoSources = [
    "/videos/hero-scrub.mp4",
    "/videos/problem-scrub.mp4"
];

const ScrollyExperience = () => {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [videos, setVideos] = useState([]);
    const [loaded, setLoaded] = useState(false);

    // Total scroll height (800vh for 2 videos)
    const SCROLL_HEIGHT = '600vh';

    const renderCheck = (video, ctx, w, h) => {
        // Helper specifically for initial load render
        const vw = w;
        const vh = h;
         const imgW = video.videoWidth;
        const imgH = video.videoHeight;
        const scale = Math.max(vw / imgW, vh / imgH);
        const nw = imgW * scale;
        const nh = imgH * scale;
        const offsetX = (vw - nw) / 2;
        const offsetY = (vh - nh) / 2;

        ctx.drawImage(video, offsetX, offsetY, nw, nh);
    }

    useEffect(() => {
        // Load videos
        const loadVideos = async () => {
            const loadedVideos = await Promise.all(videoSources.map(src => {
                return new Promise((resolve, reject) => {
                    const video = document.createElement("video");
                    video.src = src;
                    video.muted = true;
                    video.preload = "auto";
                    video.playsInline = true;
                    
                    // Critical: Resolve only when we have data to render
                    video.onloadeddata = () => {
                        resolve(video);
                    };
                    video.onerror = reject;
                });
            }));
            
            setVideos(loadedVideos);
            setLoaded(true);

            // Setup Canvas Context
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d", { alpha: false }); // Optimizes for no transparency
            contextRef.current = context;

            // Initial render of first frame
            if (loadedVideos[0]) {
               renderCheck(loadedVideos[0], context, canvas.width, canvas.height);
            }
        };

        loadVideos();
    }, []);

    // Resize handler - CRITICAL: Account for devicePixelRatio for HD/Retina displays
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                const dpr = window.devicePixelRatio || 1;
                const canvas = canvasRef.current;
                
                // Set the canvas internal resolution to match device pixels
                canvas.width = window.innerWidth * dpr;
                canvas.height = window.innerHeight * dpr;
                
                // Scale the drawing context so we draw at 1:1 logical pixels
                const ctx = canvas.getContext('2d');
                ctx.scale(dpr, dpr);
                
                // Update context ref
                contextRef.current = ctx;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial call
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Frame Rendering Helper - Uses LOGICAL pixels (not canvas internal resolution)
    const renderFrame = (video, opacity = 1) => {
        const canvas = canvasRef.current;
        const ctx = contextRef.current;
        if (!canvas || !ctx || !video) return;

        // Use logical viewport size (not canvas.width which is scaled by dpr)
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const imgW = video.videoWidth;
        const imgH = video.videoHeight;
        
        if (imgW === 0 || imgH === 0) return; // Video not ready
        
        // Cover logic - scale to fill while maintaining aspect ratio
        const scale = Math.max(vw / imgW, vh / imgH);
        const nw = imgW * scale;
        const nh = imgH * scale;
        const offsetX = (vw - nw) / 2;
        const offsetY = (vh - nh) / 2;

        // Clear canvas before drawing to fix blank screen on scroll-up
        ctx.clearRect(0, 0, vw, vh);
        
        ctx.globalAlpha = opacity;
        ctx.drawImage(video, offsetX, offsetY, nw, nh);
        ctx.globalAlpha = 1.0;
    };



    // Smart Seek Helper (throttled seeking for performance)
    const smartSeek = (video, progress) => {
        if (!video || !Number.isFinite(video.duration)) return;
        const targetTime = video.duration * progress;
        
        // Only seek if significantly different (prevents jitter)
        if (Math.abs(video.currentTime - targetTime) > 0.05) {
            video.currentTime = targetTime;
        }
    };


    // GSAP Setup
    useEffect(() => {
        if (!loaded || videos.length === 0) return;

        const scrollTrack = document.querySelector('.scroll-track');
        
        // Master Timeline linked to the invisible scroll track
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: scrollTrack,
                start: "top top",
                end: "bottom bottom",
                scrub: 1, // Slightly smoother scrubbing
            }
        });

        // --- VIDEO SEQUENCING LOGIC (2 VIDEOS ONLY) ---
        // We map the scroll distance (0 to 1) to our video phases
        const scrollObj = { 
            frame1: 0, 
            frame2: 0, 
            blend1: 0 // V1 -> V2
        };

        // PHASE 1: Video 1 plays (0% -> 20%) - Gold particles hero
        tl.to(scrollObj, {
            frame1: 1,
            duration: 0.20,
            ease: "none",
            onUpdate: () => {
                smartSeek(videos[0], scrollObj.frame1);
                renderFrame(videos[0], 1);
            }
        }, 0);

        // PHASE 2: Blend V1 -> V2 (20% -> 28%)
        tl.to(scrollObj, {
            frame2: 0.15, 
            duration: 0.08,
            ease: "none"
        }, 0.20);

        tl.to(scrollObj, {
            blend1: 1,
            duration: 0.08,
            ease: "none",
             onUpdate: () => {
                smartSeek(videos[0], 1); 
                renderFrame(videos[0], 1);
                smartSeek(videos[1], scrollObj.frame2); 
                renderFrame(videos[1], scrollObj.blend1);
            }
        }, 0.20);

        // PHASE 3: Video 2 (DNA) plays (28% -> 100%) - DNA video for rest of page
        tl.to(scrollObj, {
            frame2: 1,
            duration: 0.72,
            ease: "none",
             onUpdate: () => {
                smartSeek(videos[1], scrollObj.frame2);
                renderFrame(videos[1], 1);
            }
        }, 0.28);


        // --- CONTENT ANIMATIONS ---
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            // Skip Hero (index 0) initial reveal as it should be visible
             if (index === 0) {
                 gsap.set(section.children, { autoAlpha: 1 });
                 
                 // Optional: Subtle hero scale out on scroll
                 gsap.to(section.querySelector('h1'), {
                    scale: 0.95,
                    opacity: 0,
                    scrollTrigger: {
                        end: "10% top",
                        scrub: true
                    }
                 });
                 // Ensure hero is visible
                 gsap.set(section.children, { autoAlpha: 1 });
                 return; 
             }

             // All other sections fade in/out
             gsap.fromTo(section.children, 
                { autoAlpha: 0, y: 100 }, 
                { 
                    autoAlpha: 1, 
                    y: 0, 
                    duration: 1, 
                    stagger: 0.1, 
                    ease: "power3.out", 
                    scrollTrigger: {
                        trigger: section, // This section in the overlay
                        start: "top 60%", // When top of section hits 60% viewport
                        end: "top 20%",
                        scrub: 1,
                        // markers: true 
                    }
                }
             );
              
             // Fade out slightly when leaving
             gsap.to(section.children, {
                 autoAlpha: 0,
                 y: -50,
                 scrollTrigger: {
                     trigger: section,
                     start: "bottom 40%",
                     end: "bottom top",
                     scrub: 1
                 }
             });
        });

        return () => {
            tl.kill();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };

    }, [loaded, videos]);


    return (
        <div className="scrolly-root relative bg-black min-h-screen w-full">
            
            {/* 1. FIXED CANVAS BACKGROUND (Z-INDEX 0) */}
            <div className="fixed inset-0 w-full h-full z-[0] pointer-events-none">
                <canvas 
                    ref={canvasRef} 
                    className="w-full h-full object-cover" 
                />
            </div>

            {/* 2. INVISIBLE SCROLL TRACK (DRIVES SCROLLBAR) */}
            <div className="scroll-track absolute top-0 left-0 w-full" style={{ height: SCROLL_HEIGHT, zIndex: 0 }} />

            {/* 3. NAVIGATION (FIXED Z-40) */}
            <nav className="fixed top-0 left-0 w-full z-[40] flex justify-between items-center px-8 py-6 bg-black/60 backdrop-blur-xl border-b border-white/10">
                 <div className="text-xl font-bold tracking-tighter text-white">
                    HHeuristics
                 </div>
                 <div className="hidden md:flex gap-8 text-sm font-medium text-gray-300">
                    {['Reports', 'Consulting', 'Insights', 'Data'].map((item) => (
                        <a key={item} href={`https://www.hheuristics.com/${item.toLowerCase()}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors duration-300">
                            {item}
                        </a>
                    ))}
                 </div>
                 <a href="https://www.upwork.com/agencies/1987574673660266609/" target="_blank" rel="noopener noreferrer" className="px-5 py-2 rounded-full border border-white/30 text-sm font-medium hover:bg-white hover:text-black transition-all duration-300">
                    Get Started
                 </a>
            </nav>

            {/* 4. CONTENT OVERLAY (FIXED Z-30, POINTER-EVENTS-NONE wrapper) */}
            {/* We distribute sections along the tall scroll track implicitly using absolute positioning or flex spacing? 
                Actually, the requirements said 'content-overlay fixed inset-0'. If it's fixed, we need to move the sections INSIDE it using GSAP 
                OR we place the sections in the 'scroll-track' flow? 
                
                Correction based on prompt: "content-overlay... flex flex-col". 
                BUT if the overlay is fixed, scrolling won't move the items.
                
                The Prompt asks: "Inside content-overlay, create multiple <section>..." and "Sync everything to the same scroll-track progress".
                
                If the content overlay is fixed, the text won't scroll naturally. 
                
                Better Approach for React:
                Place the content sections IN THE FLOW of the document (inside scroll-track or a parallel wrapper) so they scroll naturally?
                
                WAIT, the prompt says: "Pin ONLY the canvas/video. Text sections are overlays — never pin text containers."
                
                If I put sections in a `fixed` container, they won't scroll.
                I will place the content sections inside a container that has the SAME height as scroll-track, 
                positioned absolutely ON TOP of the scroll track, so they scroll naturally with the page.
                
                Let's use a wrapper `absolute top-0 w-full z-30` inside the root, matching scroll-track height.
            */}
            
            <div className="content-flow absolute top-0 left-0 w-full z-[30] pointer-events-none flex flex-col" style={{ height: SCROLL_HEIGHT }}>
                
                {/* SECTION 1: HERO (Visible immediately) */}
                <section className="h-screen w-full flex items-center justify-center relative pointer-events-auto pt-64">
                    <div className="hero-section text-center px-6 max-w-5xl mx-auto">
                        <h1 className="text-7xl md:text-9xl font-black tracking-tight mb-8 text-white drop-shadow-[0_4px_30px_rgba(255,255,255,0.15)]">
                            HHeuristics
                        </h1>
                        <p className="text-4xl md:text-6xl font-semibold mb-12 text-white/90 drop-shadow-lg">
                            Consulting & Insights
                        </p>
                        <p className="text-xl md:text-2xl max-w-4xl mx-auto mb-16 leading-relaxed text-white/80 drop-shadow-md backdrop-blur-sm bg-black/20 rounded-2xl p-6">
                            Actionable intelligence for complex decisions.<br className="hidden md:block"/>
                            We deliver rigorous, data-driven market research and strategic advisory that helps executives, investors, and policymakers anticipate trends, evaluate opportunities, and navigate uncertainty with confidence.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center pointer-events-auto">
                            <a href="https://www.hheuristics.com/reports" target="_blank" rel="noopener noreferrer" className="border-2 border-white rounded-full px-8 py-4 text-xl md:text-2xl font-medium text-white hover:bg-white hover:text-black transition duration-300 backdrop-blur-sm">
                                Explore Reports
                            </a>
                            <a href="https://www.upwork.com/agencies/1987574673660266609/" target="_blank" rel="noopener noreferrer" className="bg-white text-black rounded-full px-8 py-4 text-xl md:text-2xl font-medium hover:bg-white/80 transition duration-300">
                                Contact Us
                            </a>
                        </div>
                        <p className="mt-32 text-xl opacity-70 text-white/60 animate-pulse">
                            Scroll to explore
                        </p>
                    </div>
                </section>

                <div className="h-[8vh]"></div>

                {/* SECTION 2: PITCH */}
                <section className="min-h-[60vh] w-full flex items-center justify-center pointer-events-auto py-12">
                     <div className="max-w-6xl px-8 text-center backdrop-blur-sm bg-black/30 rounded-3xl py-16">
                        <h2 className="text-5xl md:text-7xl font-black mb-16 text-white leading-tight drop-shadow-[0_2px_20px_rgba(255,255,255,0.1)]">
                            Research that <span className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">drives decisions</span>
                        </h2>
                        <p className="text-xl md:text-2xl max-w-5xl mx-auto text-white/80 mb-12 leading-relaxed">
                            We combine deep domain expertise with quantitative rigor to produce research that stands apart—comprehensive, forward-looking, and designed for strategic application.
                        </p>
                    </div>
                </section>

                {/* SECTION 3: FEATURES GRID */}
                <section className="min-h-[70vh] w-full flex items-center justify-center pointer-events-auto py-12">
                     <div className="max-w-7xl px-8 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { title: "Rigorous Analysis", desc: "Every report integrates primary research, proprietary datasets, and structured analytical frameworks to deliver insights you can act on." },
                                { title: "Executive Clarity", desc: "Complex markets distilled into clear, accessible intelligence tailored for time-constrained decision-makers." },
                                { title: "Global Perspective", desc: "Cross-border analysis spanning regulatory regimes, market dynamics, and competitive landscapes worldwide." },
                                { title: "Trusted Independence", desc: "Objective, evidence-based research free from conflicts of interest—insight you can trust." }
                            ].map((card, i) => (
                                <div key={i} className="bg-black/50 backdrop-blur-xl border border-white/20 p-8 rounded-2xl hover:border-white/50 hover:bg-black/70 transition duration-500 group">
                                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-white group-hover:text-white transition">{card.title}</h3>
                                    <p className="text-base text-white/70 leading-relaxed">{card.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <div className="h-[8vh]"></div>

                {/* SECTION 4: FEATURED REPORTS */}
                <section id="reports" className="min-h-[80vh] w-full flex flex-col items-center justify-center pointer-events-auto py-12">
                     <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-12 max-w-7xl mx-8">
                     <h2 className="text-5xl md:text-7xl font-black mb-6 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">Latest Research</h2>
                     <p className="text-xl text-white mb-12 max-w-3xl text-center mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">In-depth analysis across technology, finance, energy, and emerging strategic domains.</p>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl px-8 w-full">
                        {[
                            { 
                              cat: "Financial Services", 
                              title: "Financial Technology", 
                              desc: "Comprehensive analysis of fintech disruption, embedded finance, and transformation reshaping global financial services."
                            },
                            { 
                              cat: "Technology", 
                              title: "Business Intelligence Outlook", 
                              desc: "Market assessment of BI and analytics platforms through 2030, evaluating AI integration and decision intelligence."
                            },
                            { 
                              cat: "Cloud Computing", 
                              title: "Cloud FinOps & Optimization", 
                              desc: "Strategic guide to cloud financial operations, cost optimization frameworks, and governance models."
                            },
                            { 
                              cat: "Consumer Markets", 
                              title: "Consumer Spending Trends", 
                              desc: "Data-driven analysis of shifting consumer behavior, discretionary spending patterns, and macroeconomic impacts."
                            }
                        ].map((report, i) => (
                             <a key={i} href="https://www.hheuristics.com/reports" target="_blank" rel="noopener noreferrer" className="bg-black/70 backdrop-blur-xl border border-white/20 p-8 rounded-2xl group cursor-pointer hover:transform hover:scale-[1.02] hover:border-white/50 transition duration-500 flex flex-col justify-between">
                                <div>
                                    <div className="text-white/80 font-mono mb-3 text-sm tracking-wider uppercase">{report.cat}</div>
                                    <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-white transition drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{report.title}</h3>
                                    <p className="text-base text-white/90 mb-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{report.desc}</p>
                                </div>
                                <span className="text-white font-medium border-b border-white/50 pb-1 w-max">View Report →</span>
                            </a>
                        ))}
                     </div>
                     <div className="mt-10 text-center">
                        <a href="https://www.hheuristics.com/reports" target="_blank" rel="noopener noreferrer" className="text-white border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-black transition font-bold">View All Reports</a>
                     </div>
                     </div>
                </section>

                 <div className="h-[8vh]"></div>

                 {/* SECTION 5: DOMAINS */}
                 <section className="min-h-[90vh] w-full flex flex-col items-center justify-center pointer-events-auto py-16">
                    <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-12 max-w-7xl mx-8">
                    <h2 className="text-4xl md:text-6xl font-black mb-6 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">Research Coverage</h2>
                    <p className="text-xl text-white mb-12 text-center block drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Deep expertise across the sectors shaping the future economy.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl px-8 w-full">
                        {[
                            { title: "Technology & Software", desc: "Enterprise software, AI/ML, cloud, cybersecurity" },
                            { title: "Energy & Resources", desc: "Renewables, grid modernization, storage, decarbonization" },
                            { title: "Financial Services", desc: "Fintech, payments, banking transformation" },
                            { title: "Industrials & Manufacturing", desc: "Smart mfg, robotics, supply chain, automation" },
                            { title: "B2B Commerce", desc: "Digital procurement, marketplaces, trade" },
                            { title: "Emerging Technologies", desc: "Quantum, autonomous systems, next-gen infra" }
                        ].map((domain, i) => (
                             <div key={i} className="bg-black/50 backdrop-blur-md border border-white/20 p-6 rounded-xl text-left hover:bg-black/70 hover:border-white/40 transition">
                                <h4 className="text-lg md:text-xl font-bold text-white mb-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{domain.title}</h4>
                                <p className="text-white/90 text-sm drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{domain.desc}</p>
                            </div>
                        ))}
                    </div>
                    </div>
                 </section>

                 <div className="h-[8vh]"></div>

                 {/* SECTION 6: PLATFORMS / CTA */}
                 <section className="min-h-[80vh] w-full flex flex-col items-center justify-center pointer-events-auto py-12 pb-24">
                    <div className="backdrop-blur-xl bg-black/60 rounded-3xl p-12 max-w-6xl mx-8">
                    <h2 className="text-5xl md:text-7xl font-black mb-10 text-center text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">Visit Our Platforms</h2>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12">
                        {[
                            { name: 'MarketResearch.com', desc: 'Browse and purchase our complete library.', link: 'View Publications →', url: 'https://www.marketresearch.com/' },
                            { name: 'Substack', desc: 'Subscribe to our newsletter for regular insights.', link: 'Read & Subscribe →', url: 'https://hheuristics.substack.com' },
                            { name: 'Upwork', desc: 'Engage our team for custom research projects.', link: 'View Agency Profile →', url: 'https://www.upwork.com/agencies/1987574673660266609/' }
                        ].map(p => (
                            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center text-center p-6 bg-black/50 rounded-2xl border border-white/20 hover:border-white/50 transition hover:bg-black/70">
                                <h3 className="text-xl font-bold text-white mb-3 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]">{p.name}</h3>
                                <p className="text-white/90 mb-4 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{p.desc}</p>
                                <span className="text-white font-medium">{p.link}</span>
                            </a>
                        ))}
                     </div>
                     
                     <div className="text-center p-8 bg-black/50 rounded-2xl border border-white/20 mt-6">
                        <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">Need Custom Research?</h3>
                        <p className="text-lg text-white mb-6 max-w-2xl mx-auto drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">We deliver bespoke research and strategic advisory tailored to your specific decision requirements.</p>
                        <a href="https://www.upwork.com/agencies/1987574673660266609/" target="_blank" rel="noopener noreferrer" className="inline-block bg-white text-black text-lg font-bold px-8 py-3 rounded-full hover:bg-white/90 transition duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            Explore Advisory Services
                        </a>
                     </div>
                    </div>
                 </section>
                
                {/* FOOTER */}
                <footer className="w-full py-16 text-center pointer-events-auto border-t border-white/10 bg-black/90 backdrop-blur-xl relative z-50">
                    <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12 text-left mb-16">
                        <div className="col-span-1 md:col-span-2">
                             <h4 className="text-3xl font-black text-white mb-6">HHeuristics</h4>
                             <p className="text-white/80 text-lg mb-6 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">Research for a changing world.</p>
                             <address className="text-gray-500 not-italic leading-relaxed">
                                 Suite 962, 37 Westminster Buildings<br/>
                                 Theatre Square<br/>
                                 Nottingham, NG1 6LG<br/>
                                 United Kingdom
                             </address>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-4">Navigation</h5>
                            <ul className="space-y-2 text-gray-400">
                                <li><a href="https://www.hheuristics.com/reports" target="_blank" rel="noopener noreferrer" className="hover:text-white">Reports</a></li>
                                <li><a href="https://www.hheuristics.com/consulting" target="_blank" rel="noopener noreferrer" className="hover:text-white">Consulting</a></li>
                                <li><a href="https://www.hheuristics.com/insights" target="_blank" rel="noopener noreferrer" className="hover:text-white">Insights</a></li>
                                <li><a href="https://www.hheuristics.com/data" target="_blank" rel="noopener noreferrer" className="hover:text-white">Data</a></li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-4">Find Our Work</h5>
                             <ul className="space-y-2 text-gray-400">
                                <li><a href="https://www.marketresearch.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white">MarketResearch.com</a></li>
                                <li><a href="https://hheuristics.substack.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">Substack</a></li>
                                <li><a href="https://www.upwork.com/agencies/1987574673660266609/" target="_blank" rel="noopener noreferrer" className="hover:text-white">Upwork</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="max-w-7xl mx-auto px-8 border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm">
                        <p>&copy; 2025 HHeuristics. All rights reserved.</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white">Privacy Policy</a>
                            <a href="#" className="hover:text-white">Terms of Service</a>
                        </div>
                    </div>
                </footer>

            </div>
        </div>
    );
};

export default ScrollyExperience;
