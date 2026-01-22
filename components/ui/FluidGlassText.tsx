/* eslint-disable react/no-unknown-property */
"use client";

import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
    useFBO,
    MeshTransmissionMaterial,
    Text
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlassText({ text = "Explainr" }) {
    return (
        <div style={{ height: '200px', width: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
                <LensEffect text={text} />
            </Canvas>
        </div>
    );
}

function LensEffect({ text }: { text: string }) {
    const ref = useRef<THREE.Mesh>(null);
    const buffer = useFBO();
    const { viewport } = useThree();
    const [scene] = useState(() => new THREE.Scene());

    useFrame((state, delta) => {
        if (!ref.current) return;

        const { gl, pointer, camera } = state;
        const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

        // Follow pointer
        const destX = (pointer.x * v.width) / 2;
        const destY = (pointer.y * v.height) / 2;
        easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

        gl.setRenderTarget(buffer);
        gl.render(scene, camera);
        gl.setRenderTarget(null);
    });

    return (
        <>
            {createPortal(
                <Text
                    position={[0, 0, 12]}
                    fontSize={0.8}
                    letterSpacing={-0.05}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                >
                    {text}
                </Text>,
                scene
            )}
            <mesh scale={[viewport.width, viewport.height, 1]}>
                <planeGeometry />
                <meshBasicMaterial map={buffer.texture} transparent />
            </mesh>
            <mesh ref={ref} scale={0.3}>
                <sphereGeometry args={[1, 64, 64]} />
                <MeshTransmissionMaterial
                    buffer={buffer.texture}
                    ior={1.2}
                    thickness={3}
                    anisotropy={0.1}
                    chromaticAberration={0.2}
                    transmission={1}
                    roughness={0}
                    color="#7B2CBF"
                />
            </mesh>
        </>
    );
}
