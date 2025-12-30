import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SplitText({
    children,
    className = '',
    delay = 0,
    animateOnLoad = false,
}) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const text = children;
        const container = containerRef.current;
        container.innerHTML = '';

        const words = text.split(' ');

        words.forEach((word, wordIndex) => {
            const wordSpan = document.createElement('span');
            wordSpan.style.display = 'inline-block';
            wordSpan.style.whiteSpace = 'nowrap';

            word.split('').forEach((char) => {
                const charSpan = document.createElement('span');
                charSpan.className = 'split-char';
                charSpan.textContent = char;
                charSpan.style.display = 'inline-block';
                charSpan.style.opacity = '0';
                charSpan.style.transform = 'translateY(15px)';
                wordSpan.appendChild(charSpan);
            });

            container.appendChild(wordSpan);

            if (wordIndex < words.length - 1) {
                const space = document.createTextNode(' ');
                container.appendChild(space);
            }
        });

        const chars = container.querySelectorAll('.split-char');

        const animateIn = () => {
            gsap.to(chars, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.02,
                delay: delay,
                ease: 'power3.out',
            });
        };

        if (animateOnLoad) {
            setTimeout(animateIn, 100);
        } else {
            ScrollTrigger.create({
                trigger: container,
                start: 'top 90%',
                onEnter: animateIn,
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach(t => {
                if (t.trigger === container) t.kill();
            });
        };
    }, [children, delay, animateOnLoad]);

    return (
        <span ref={containerRef} className={className}>
            {children}
        </span>
    );
}
