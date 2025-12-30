import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { Tube, Sphere, Float } from '@react-three/drei';

gsap.registerPlugin(ScrollTrigger);

// Professional DNA Double Helix with proper 3D tubes
function DNAHelix({ progress, time }) {
    const groupRef = useRef();

    // Create helix curve paths
    const strand1Curve = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = t * Math.PI * 6;
            const radius = 1.2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                (t - 0.5) * 10,
                Math.sin(angle) * radius
            ));
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    const strand2Curve = useMemo(() => {
        const points = [];
        for (let i = 0; i <= 100; i++) {
            const t = i / 100;
            const angle = t * Math.PI * 6 + Math.PI;
            const radius = 1.2;
            points.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                (t - 0.5) * 10,
                Math.sin(angle) * radius
            ));
        }
        return new THREE.CatmullRomCurve3(points);
    }, []);

    // Base pair positions
    const basePairs = useMemo(() => {
        const pairs = [];
        for (let i = 0; i <= 20; i++) {
            const t = i / 20;
            const angle = t * Math.PI * 6;
            const radius = 1.2;
            const y = (t - 0.5) * 10;
            pairs.push({
                start: new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius),
                end: new THREE.Vector3(Math.cos(angle + Math.PI) * radius, y, Math.sin(angle + Math.PI) * radius),
            });
        }
        return pairs;
    }, []);

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = progress * Math.PI * 3 + time * 0.1;
        groupRef.current.rotation.x = 0.15;
    });

    const opacity = Math.min(1, progress * 2.5);

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Main DNA strands - thick tubes */}
            <Tube args={[strand1Curve, 100, 0.08, 8, false]}>
                <meshStandardMaterial color="#D4AF37" metalness={0.6} roughness={0.3} transparent opacity={opacity} />
            </Tube>
            <Tube args={[strand2Curve, 100, 0.08, 8, false]}>
                <meshStandardMaterial color="#ffffff" metalness={0.4} roughness={0.4} transparent opacity={opacity * 0.9} />
            </Tube>

            {/* Base pairs connecting the strands */}
            {basePairs.map((pair, i) => {
                const direction = new THREE.Vector3().subVectors(pair.end, pair.start);
                const length = direction.length();
                const midpoint = new THREE.Vector3().addVectors(pair.start, pair.end).multiplyScalar(0.5);

                return (
                    <group key={i}>
                        {/* Connecting rod */}
                        <mesh position={[midpoint.x, midpoint.y, midpoint.z]} rotation={[0, 0, Math.PI / 2]}>
                            <cylinderGeometry args={[0.03, 0.03, length, 8]} />
                            <meshStandardMaterial color="#888888" metalness={0.3} roughness={0.5} transparent opacity={opacity * 0.6} />
                        </mesh>
                        {/* Nucleotide spheres at ends */}
                        <Sphere args={[0.1, 16, 16]} position={[pair.start.x, pair.start.y, pair.start.z]}>
                            <meshStandardMaterial color={i % 2 === 0 ? '#D4AF37' : '#ffffff'} metalness={0.5} roughness={0.3} transparent opacity={opacity} />
                        </Sphere>
                        <Sphere args={[0.1, 16, 16]} position={[pair.end.x, pair.end.y, pair.end.z]}>
                            <meshStandardMaterial color={i % 2 === 0 ? '#ffffff' : '#D4AF37'} metalness={0.5} roughness={0.3} transparent opacity={opacity} />
                        </Sphere>
                    </group>
                );
            })}
        </group>
    );
}

// Professional Bar Chart with 3D cylinders
function BarChart3D({ progress, time }) {
    const chartProgress = Math.max(0, (progress - 0.35) * 2.5);

    const bars = useMemo(() => [
        { x: -2.5, h: 2.0, color: '#D4AF37' },
        { x: -1.5, h: 1.4, color: '#666666' },
        { x: -0.5, h: 2.6, color: '#D4AF37' },
        { x: 0.5, h: 1.8, color: '#666666' },
        { x: 1.5, h: 2.2, color: '#D4AF37' },
        { x: 2.5, h: 1.6, color: '#666666' },
    ], []);

    if (chartProgress <= 0) return null;

    return (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={[0, -3, 0]}>
                {bars.map((bar, i) => {
                    const h = bar.h * Math.min(1, chartProgress - i * 0.1);
                    if (h <= 0) return null;
                    return (
                        <mesh key={i} position={[bar.x, h / 2, 0]}>
                            <cylinderGeometry args={[0.25, 0.25, h, 32]} />
                            <meshStandardMaterial color={bar.color} metalness={0.5} roughness={0.3} />
                        </mesh>
                    );
                })}
                {/* Base platform */}
                <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <planeGeometry args={[7, 2]} />
                    <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.2} />
                </mesh>
            </group>
        </Float>
    );
}

// Orbiting Growth Ring with glow effect
function GrowthRing({ progress, time }) {
    const ringProgress = Math.max(0, (progress - 0.7) * 3.5);
    const groupRef = useRef();

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.rotation.y = time * 0.2;
        groupRef.current.rotation.x = 0.3;
    });

    if (ringProgress <= 0) return null;

    return (
        <group ref={groupRef}>
            <mesh scale={ringProgress}>
                <torusGeometry args={[2.5, 0.1, 32, 100]} />
                <meshStandardMaterial color="#D4AF37" metalness={0.7} roughness={0.2} emissive="#D4AF37" emissiveIntensity={0.3} />
            </mesh>
            <mesh scale={ringProgress * 0.75} rotation={[Math.PI / 4, 0, 0]}>
                <torusGeometry args={[2, 0.06, 32, 100]} />
                <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} transparent opacity={0.7} />
            </mesh>
        </group>
    );
}

export default function FinanceVisualization() {
    const progressRef = useRef({ value: 0 });
    const [state, setState] = useState({ time: 0, progress: 0 });
    const { camera } = useThree();

    useEffect(() => {
        ScrollTrigger.create({
            trigger: document.body,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.3,
            onUpdate: (self) => {
                progressRef.current.value = self.progress;
            },
        });
        return () => ScrollTrigger.getAll().forEach(t => t.kill());
    }, []);

    useFrame((s) => {
        const progress = progressRef.current.value;
        const time = s.clock.elapsedTime;

        camera.position.z = 12 - progress * 1.5;
        camera.position.y = progress * 1.5;
        camera.lookAt(0, 0, 0);

        setState({ time, progress });
    });

    const { time, progress } = state;

    return (
        <group>
            {/* Hero & Research: Professional DNA Helix */}
            <DNAHelix progress={progress} time={time} />

            {/* Reports section: 3D Bar Chart */}
            <BarChart3D progress={progress} time={time} />

            {/* CTA section: Growth Ring */}
            <GrowthRing progress={progress} time={time} />
        </group>
    );
}
