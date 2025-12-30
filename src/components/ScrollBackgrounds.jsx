import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Elegant scroll-responsive background with animated gradient orbs
 * Clean, minimal aesthetic that won't distract from content
 */
export default function AnimatedBackground() {
    const [scrollProgress, setScrollProgress] = useState(0);

    useEffect(() => {
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
            onUpdate: (self) => {
                setScrollProgress(self.progress);
            },
        });

        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, []);

    // Subtle animated gradient that responds to scroll
    const gradientStyle = {
        background: `
      radial-gradient(
        ellipse 80% 50% at ${45 + scrollProgress * 15}% ${30 + scrollProgress * 25}%, 
        rgba(255, 255, 255, ${0.03 + scrollProgress * 0.02}) 0%, 
        transparent 50%
      ),
      radial-gradient(
        ellipse 60% 70% at ${60 - scrollProgress * 20}% ${70 - scrollProgress * 15}%, 
        rgba(255, 255, 255, 0.02) 0%, 
        transparent 45%
      ),
      #000000
    `,
    };

    return (
        <div className="animated-background" style={gradientStyle}>
            {/* Subtle floating orbs that move with scroll */}
            <div
                className="orb orb-1"
                style={{
                    transform: `translate(${scrollProgress * 100}px, ${scrollProgress * 50}px)`,
                    opacity: 0.03 + scrollProgress * 0.02,
                }}
            />
            <div
                className="orb orb-2"
                style={{
                    transform: `translate(${-scrollProgress * 80}px, ${scrollProgress * 30}px)`,
                    opacity: 0.02 + scrollProgress * 0.015,
                }}
            />
        </div>
    );
}
