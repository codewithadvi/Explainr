"use client";

import { useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere } from "@react-three/drei";
import * as THREE from "three";
import type { PersonaType } from "@/types";

interface MercuryBlobProps {
    confusionLevel: number; // 0-100
    audioAmplitude?: number; // 0-1
    persona?: PersonaType;
    className?: string;
}

function BlobMesh({
    confusionLevel,
    audioAmplitude = 0,
    persona,
}: {
    confusionLevel: number;
    audioAmplitude: number;
    persona?: PersonaType;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        const time = state.clock.getElapsedTime();

        // Enhanced color based on confusion level with brighter, more saturated colors
        let color: THREE.Color;
        let emissiveMultiplier: number;
        if (confusionLevel < 20) {
            color = new THREE.Color("#00FF94"); // Bright emerald green
            emissiveMultiplier = 0.9; // Much brighter glow
        } else if (confusionLevel < 60) {
            color = new THREE.Color("#00FFFF"); // Cyan/turquoise
            emissiveMultiplier = 0.7;
        } else {
            color = new THREE.Color("#FF2A6D"); // Error red
            emissiveMultiplier = 0.8;
        }

        materialRef.current.color.lerp(color, 0.08);
        materialRef.current.emissive.copy(color).multiplyScalar(emissiveMultiplier);
        materialRef.current.emissiveIntensity = 0.8 + Math.sin(time * 2) * 0.2; // Pulsing glow

        // Distortion based on confusion
        const distortion = confusionLevel / 100;
        const scale = 1 + Math.sin(time * 2) * 0.05 * distortion;
        meshRef.current.scale.setScalar(scale);

        // Audio reactivity
        if (audioAmplitude > 0.01) {
            const pulse = 1 + audioAmplitude * 0.3;
            meshRef.current.scale.multiplyScalar(pulse);
        }

        // Rotation based on confusion
        meshRef.current.rotation.y += 0.005 * (1 + distortion);
        meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.1 * distortion;

        // Persona-specific shapes
        switch (persona) {
            case "toddler":
                // Bouncy, playful
                meshRef.current.position.y = Math.sin(time * 2) * 0.2;
                break;
            case "fratbro":
                // Energetic rotation
                meshRef.current.rotation.z = Math.sin(time * 3) * 0.2;
                break;
            case "ceo":
                // Stable, minimal movement
                meshRef.current.rotation.y += 0.002;
                break;
            case "professor":
                // Rigid, crystalline
                meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.05;
                break;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 128, 128]}>
            <meshStandardMaterial
                ref={materialRef}
                color="#00FF94"
                emissive="#00FF94"
                emissiveIntensity={0.8}
                metalness={1.0}
                roughness={0.05}
            />
        </Sphere>
    );
}

export default function MercuryBlob({
    confusionLevel,
    audioAmplitude = 0,
    persona,
    className = "",
}: MercuryBlobProps) {
    return (
        <div className={`w-full h-full ${className}`} style={{ filter: "contrast(1.2) brightness(1.1)" }}>
            <Canvas 
                camera={{ position: [0, 0, 3.5], fov: 45 }}
                gl={{ 
                    antialias: true, 
                    alpha: true,
                    powerPreference: "high-performance",
                }}
                dpr={[1, 2]}
            >
                {/* Enhanced lighting for better 3D glow effect */}
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={2} color="#00FF94" />
                <pointLight position={[-5, -5, 5]} intensity={1.5} color="#00FFFF" />
                <pointLight position={[0, 0, -5]} intensity={1.2} color="#00FF94" />
                <directionalLight position={[10, 10, 5]} intensity={0.6} />
                <directionalLight position={[-10, -10, -5]} intensity={0.3} color="#00FFFF" />
                
                <fog attach="fog" args={["#000000", 2, 8]} />
                <BlobMesh
                    confusionLevel={confusionLevel}
                    audioAmplitude={audioAmplitude}
                    persona={persona}
                />
            </Canvas>
        </div>
    );
}
