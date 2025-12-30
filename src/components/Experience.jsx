import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useScroll } from '@react-three/drei';
import * as THREE from 'three';

/**
 * EXTREME Quality 3D Scrollytelling Experience
 * "Data Forest" Architecture - HHeuristics
 * 
 * Upgraded from simple dots to glowing 3D data elements:
 * - Scene 1: Chaotic Data Forest (3D bar graphs & logic gates)
 * - Scene 2: Morphing into DNA Helix (Strategy Structure)
 * - Scene 3: Rising Financial Bar Charts
 */

const INSTANCE_COUNT = 2000; // Reduced count but 3D objects instead of dots

// Instanced Data Nodes - Glowing 3D Bar Graphs
function InstancedDataNodes() {
    const meshRef = useRef();
    const scroll = useScroll();

    // Store initial and target transforms
    const { swarmData, helixData, chartData, dummy, colorArray } = useMemo(() => {
        const dummy = new THREE.Object3D();
        const colorArray = new Float32Array(INSTANCE_COUNT * 3);

        const swarmData = [];
        const helixData = [];
        const chartData = [];

        for (let i = 0; i < INSTANCE_COUNT; i++) {
            // === SWARM: Chaotic data cloud ===
            const swarmRadius = 18 + Math.random() * 12;
            const swarmTheta = Math.random() * Math.PI * 2;
            const swarmPhi = Math.acos(2 * Math.random() - 1);
            swarmData.push({
                x: swarmRadius * Math.sin(swarmPhi) * Math.cos(swarmTheta),
                y: (Math.random() - 0.5) * 25,
                z: swarmRadius * Math.sin(swarmPhi) * Math.sin(swarmTheta),
                rotX: Math.random() * Math.PI,
                rotY: Math.random() * Math.PI,
                rotZ: Math.random() * Math.PI,
                scaleX: 0.08 + Math.random() * 0.12,
                scaleY: 0.3 + Math.random() * 0.6, // Taller for bar effect
                scaleZ: 0.08 + Math.random() * 0.12,
            });

            // === DNA HELIX: Double helix pattern ===
            const helixT = (i / INSTANCE_COUNT) * Math.PI * 10;
            const helixRadius = 5 + Math.sin(helixT * 0.3) * 1;
            const helixY = (i / INSTANCE_COUNT) * 40 - 20;
            const strand = i % 2;
            helixData.push({
                x: Math.cos(helixT + strand * Math.PI) * helixRadius,
                y: helixY,
                z: Math.sin(helixT + strand * Math.PI) * helixRadius,
                rotX: helixT * 0.5,
                rotY: 0,
                rotZ: helixT * 0.2,
                scaleX: 0.15,
                scaleY: 0.15,
                scaleZ: 0.15,
            });

            // === BAR CHART: Grid of rising bars ===
            const gridSize = Math.ceil(Math.sqrt(INSTANCE_COUNT));
            const barX = (i % gridSize) - gridSize / 2;
            const barZ = Math.floor(i / gridSize) - gridSize / 2;
            const barHeight = 0.5 + Math.abs(Math.sin(barX * 0.3) * Math.cos(barZ * 0.3)) * 3;
            chartData.push({
                x: barX * 0.8,
                y: barHeight * 0.5 - 3,
                z: barZ * 0.8,
                rotX: 0,
                rotY: 0,
                rotZ: 0,
                scaleX: 0.25,
                scaleY: barHeight,
                scaleZ: 0.25,
            });

            // Color gradient: cyan to purple to gold
            const colorPhase = i / INSTANCE_COUNT;
            const color = new THREE.Color();
            if (colorPhase < 0.33) {
                color.setHSL(0.55, 0.8, 0.5 + Math.random() * 0.3); // Cyan
            } else if (colorPhase < 0.66) {
                color.setHSL(0.75, 0.7, 0.5 + Math.random() * 0.3); // Purple
            } else {
                color.setHSL(0.1, 0.8, 0.55 + Math.random() * 0.2); // Gold
            }
            colorArray[i * 3] = color.r;
            colorArray[i * 3 + 1] = color.g;
            colorArray[i * 3 + 2] = color.b;
        }

        return { swarmData, helixData, chartData, dummy, colorArray };
    }, []);

    useFrame((state) => {
        if (!meshRef.current) return;

        const time = state.clock.elapsedTime;
        const scrollOffset = scroll.offset;

        // Determine morph stage and progress
        let morphProgress = 0;
        let stage = 0;

        if (scrollOffset < 0.25) {
            stage = 0; // Swarm
            morphProgress = 0;
        } else if (scrollOffset < 0.65) {
            stage = 1; // Morphing to DNA
            morphProgress = (scrollOffset - 0.25) / 0.4;
        } else {
            stage = 2; // Morphing to Charts
            morphProgress = (scrollOffset - 0.65) / 0.35;
        }

        for (let i = 0; i < INSTANCE_COUNT; i++) {
            const swarm = swarmData[i];
            const helix = helixData[i];
            const chart = chartData[i];

            let x, y, z, rx, ry, rz, sx, sy, sz;

            if (stage === 0) {
                // Chaotic swarm with floating animation
                const floatOffset = Math.sin(time * 0.5 + i * 0.01) * 0.5;
                const vortexAngle = time * 0.1 + i * 0.001;
                x = swarm.x * Math.cos(vortexAngle) - swarm.z * Math.sin(vortexAngle);
                y = swarm.y + floatOffset;
                z = swarm.x * Math.sin(vortexAngle) + swarm.z * Math.cos(vortexAngle);
                rx = swarm.rotX + time * 0.2;
                ry = swarm.rotY + time * 0.3;
                rz = swarm.rotZ + time * 0.1;
                sx = swarm.scaleX;
                sy = swarm.scaleY;
                sz = swarm.scaleZ;
            } else if (stage === 1) {
                // Lerp from swarm to helix
                const t = smoothstep(morphProgress);
                x = lerp(swarm.x, helix.x, t);
                y = lerp(swarm.y, helix.y, t);
                z = lerp(swarm.z, helix.z, t);
                rx = lerp(swarm.rotX, helix.rotX, t);
                ry = lerp(swarm.rotY, helix.rotY, t);
                rz = lerp(swarm.rotZ, helix.rotZ, t);
                sx = lerp(swarm.scaleX, helix.scaleX, t);
                sy = lerp(swarm.scaleY, helix.scaleY, t);
                sz = lerp(swarm.scaleZ, helix.scaleZ, t);
            } else {
                // Lerp from helix to chart
                const t = smoothstep(morphProgress);
                x = lerp(helix.x, chart.x, t);
                y = lerp(helix.y, chart.y, t);
                z = lerp(helix.z, chart.z, t);
                rx = lerp(helix.rotX, chart.rotX, t);
                ry = lerp(helix.rotY, chart.rotY, t);
                rz = lerp(helix.rotZ, chart.rotZ, t);
                sx = lerp(helix.scaleX, chart.scaleX, t);
                sy = lerp(helix.scaleY, chart.scaleY, t);
                sz = lerp(helix.scaleZ, chart.scaleZ, t);
            }

            dummy.position.set(x, y, z);
            dummy.rotation.set(rx, ry, rz);
            dummy.scale.set(sx, sy, sz);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;

        // Global rotation based on scroll
        meshRef.current.rotation.y = scrollOffset * Math.PI * 0.5 + time * 0.02;
    });

    return (
        <instancedMesh ref={meshRef} args={[null, null, INSTANCE_COUNT]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshPhysicalMaterial
                color="#88ccff"
                emissive="#4488ff"
                emissiveIntensity={0.8}
                roughness={0.1}
                metalness={0.9}
                transmission={0.3}
                transparent
                opacity={0.9}
            />
        </instancedMesh>
    );
}

// Logic Gate Icons - Secondary layer of data elements
function LogicGates() {
    const groupRef = useRef();
    const scroll = useScroll();

    const gates = useMemo(() => {
        return Array.from({ length: 50 }, (_, i) => ({
            position: [
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 40,
            ],
            rotation: Math.random() * Math.PI * 2,
            scale: 0.3 + Math.random() * 0.4,
            speed: 0.3 + Math.random() * 0.5,
        }));
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;
        const scrollOffset = scroll.offset;

        groupRef.current.children.forEach((gate, i) => {
            const data = gates[i];
            gate.rotation.y = time * data.speed + data.rotation;
            gate.rotation.x = time * data.speed * 0.5;

            // Fade out as we progress through sections
            const opacity = Math.max(0, 1 - scrollOffset * 2);
            gate.material.opacity = opacity * 0.6;
        });
    });

    return (
        <group ref={groupRef}>
            {gates.map((gate, i) => (
                <mesh key={i} position={gate.position} scale={gate.scale}>
                    <octahedronGeometry args={[1, 0]} />
                    <meshPhysicalMaterial
                        color="#ffffff"
                        emissive="#8888ff"
                        emissiveIntensity={0.5}
                        roughness={0.2}
                        metalness={0.8}
                        transparent
                        opacity={0.6}
                        wireframe
                    />
                </mesh>
            ))}
        </group>
    );
}

// Glowing Data Streams - Vertical flowing lines
function DataStreams() {
    const groupRef = useRef();
    const scroll = useScroll();

    const streams = useMemo(() => {
        return Array.from({ length: 24 }, (_, i) => {
            const angle = (i / 24) * Math.PI * 2;
            const radius = 20 + Math.random() * 8;
            return {
                x: Math.cos(angle) * radius,
                z: Math.sin(angle) * radius,
                height: 60 + Math.random() * 20,
                speed: 0.5 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2,
            };
        });
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;

        groupRef.current.children.forEach((stream, i) => {
            const data = streams[i];
            stream.position.y = Math.sin(time * data.speed + data.phase) * 3;
            stream.material.opacity = 0.08 + Math.sin(time * 2 + data.phase) * 0.04;
        });
    });

    return (
        <group ref={groupRef}>
            {streams.map((stream, i) => (
                <mesh key={i} position={[stream.x, 0, stream.z]}>
                    <cylinderGeometry args={[0.02, 0.02, stream.height, 8]} />
                    <meshBasicMaterial
                        color="#4488ff"
                        transparent
                        opacity={0.1}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Floating Geometric Rings
function FloatingRings() {
    const groupRef = useRef();
    const scroll = useScroll();

    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.elapsedTime;
        const scrollOffset = scroll.offset;

        groupRef.current.children.forEach((ring, i) => {
            ring.rotation.x = time * 0.1 + i * 0.5;
            ring.rotation.z = time * 0.08 + scrollOffset * Math.PI;
            ring.scale.setScalar(1 + Math.sin(time * 0.3 + i) * 0.1);
            ring.material.opacity = 0.1 + scrollOffset * 0.05;
        });
    });

    return (
        <group ref={groupRef}>
            {[...Array(6)].map((_, i) => (
                <mesh key={i} position={[0, i * 4 - 10, 0]}>
                    <torusGeometry args={[8 + i * 0.5, 0.02, 16, 128]} />
                    <meshBasicMaterial
                        color="#ffffff"
                        transparent
                        opacity={0.1}
                    />
                </mesh>
            ))}
        </group>
    );
}

// Dynamic Camera Path
function CameraController() {
    const { camera } = useThree();
    const scroll = useScroll();

    useFrame(() => {
        const scrollOffset = scroll.offset;

        // Cinematic camera path
        const cameraZ = 40 - scrollOffset * 50;
        const cameraY = scrollOffset * 10 - 3;
        const cameraX = Math.sin(scrollOffset * Math.PI * 2) * 6;

        camera.position.x += (cameraX - camera.position.x) * 0.04;
        camera.position.y += (cameraY - camera.position.y) * 0.04;
        camera.position.z += (cameraZ - camera.position.z) * 0.04;

        camera.lookAt(0, scrollOffset * 4 - 2, 0);
    });

    return null;
}

// Background Stars
function Stars() {
    const pointsRef = useRef();

    const positions = useMemo(() => {
        const pos = new Float32Array(2000 * 3);
        for (let i = 0; i < 2000; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 200;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 200;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        return pos;
    }, []);

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.003;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={2000}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.1}
                color="#ffffff"
                transparent
                opacity={0.3}
                sizeAttenuation
            />
        </points>
    );
}

// Spotlight that follows camera for dramatic lighting
function DynamicLighting() {
    const lightRef = useRef();
    const scroll = useScroll();
    const { camera } = useThree();

    useFrame(() => {
        if (!lightRef.current) return;

        lightRef.current.position.copy(camera.position);
        lightRef.current.position.y += 10;
    });

    return (
        <spotLight
            ref={lightRef}
            intensity={2}
            angle={0.6}
            penumbra={0.5}
            color="#ffffff"
            castShadow
        />
    );
}

// Utility functions
function lerp(a, b, t) {
    return a + (b - a) * t;
}

function smoothstep(t) {
    return t * t * (3 - 2 * t);
}

// Main Experience
export default function Experience() {
    return (
        <>
            {/* Fog for depth */}
            <fog attach="fog" args={['#000000', 35, 100]} />

            {/* Lighting */}
            <ambientLight intensity={0.15} />
            <pointLight position={[20, 20, 20]} intensity={1.5} color="#ffffff" />
            <pointLight position={[-20, -10, -20]} intensity={0.6} color="#4488ff" />
            <pointLight position={[0, 30, 0]} intensity={0.8} color="#ffffff" />
            <DynamicLighting />

            {/* 3D Elements */}
            <Stars />
            <DataStreams />
            <InstancedDataNodes />
            <LogicGates />
            <FloatingRings />

            {/* Camera */}
            <CameraController />
        </>
    );
}
