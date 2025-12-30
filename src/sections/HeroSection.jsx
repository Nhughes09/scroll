import { useScroll } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

/**
 * Apple-inspired Hero Section with scroll-synced animations
 * Bold, centered typography that animates with scroll
 */
export default function HeroSection() {
    return (
        <section className="hero-section scroll-section" id="hero">
            {/* Main Brand - Apple-style giant typography */}
            <div className="hero-brand">
                <h1 className="hero-title-giant">
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

            {/* Tagline - Clean subtitle */}
            <p className="hero-tagline-apple">
                Actionable Intelligence for Complex Decisions
            </p>

            {/* Feature Pills - Apple style */}
            <div className="hero-pills">
                <span className="pill">Research</span>
                <span className="pill-dot">•</span>
                <span className="pill">Data</span>
                <span className="pill-dot">•</span>
                <span className="pill">Consulting</span>
            </div>

            {/* CTA Buttons - Apple style */}
            <div className="hero-cta-group">
                <a href="#solutions" className="btn-primary-apple">Learn More</a>
                <a href="#contact" className="btn-secondary-apple">Contact Us</a>
            </div>

            {/* Scroll indicator */}
            <div className="scroll-indicator">
                <div className="scroll-mouse">
                    <div className="scroll-wheel"></div>
                </div>
                <span className="scroll-text">Scroll to explore</span>
            </div>
        </section>
    );
}

/**
 * Hero Animation Controller - runs inside R3F canvas
 * Syncs hero text animations with scroll for parallax effect
 */
export function HeroAnimationController() {
    const scroll = useScroll();

    useFrame(() => {
        const progress = scroll.offset;
        
        // Only animate hero section (0-16.7%)
        if (progress > 0.2) return;

        const heroProgress = progress / 0.167; // 0-1 within hero section
        
        // Animate title letters
        const letters = document.querySelectorAll('.title-letter');
        letters.forEach((letter) => {
            // Parallax fade out on scroll
            const opacity = 1 - Math.max(0, heroProgress - 0.5) * 2;
            const translateY = heroProgress * -50;
            
            letter.style.opacity = opacity;
            letter.style.transform = `translateY(${translateY}px)`;
        });

        // Animate tagline
        const tagline = document.querySelector('.hero-tagline-apple');
        if (tagline) {
            const opacity = 1 - Math.max(0, heroProgress - 0.4) * 2.5;
            const translateY = heroProgress * -30;
            tagline.style.opacity = opacity;
            tagline.style.transform = `translateY(${translateY}px)`;
        }

        // Animate pills
        const pills = document.querySelector('.hero-pills');
        if (pills) {
            const opacity = 1 - Math.max(0, heroProgress - 0.3) * 3;
            const translateY = heroProgress * -20;
            pills.style.opacity = opacity;
            pills.style.transform = `translateY(${translateY}px)`;
        }

        // Animate CTA
        const cta = document.querySelector('.hero-cta-group');
        if (cta) {
            const opacity = 1 - Math.max(0, heroProgress - 0.2) * 4;
            cta.style.opacity = opacity;
        }
    });

    return null;
}
