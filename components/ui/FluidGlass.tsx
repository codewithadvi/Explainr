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

interface FluidGlassProps {
    mode?: 'lens';
    lensProps?: {
        scale?: number;
        ior?: number;
        thickness?: number;
        chromaticAberration?: number;
        anisotropy?: number;
    };
}

export default function FluidGlass({ mode = 'lens', lensProps = {} }: FluidGlassProps) {
    return (
        <div style={{ height: '200px', width: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }} style={{ background: 'transparent' }}>
                <Lens modeProps={lensProps}>
                    <Typography />
                </Lens>
            </Canvas>
        </div>
    );
}

function Lens({ modeProps, children }: any) {
    const ref = useRef<THREE.Mesh>(null);
    const buffer = useFBO();
    const { viewport: vp } = useThree();
    const [scene] = useState(() => new THREE.Scene());

    useFrame((state, delta) => {
        if (!ref.current) return;

        const { gl, viewport, pointer, camera } = state;
        const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

        // Follow pointer
        const destX = (pointer.x * v.width) / 2;
        const destY = (pointer.y * v.height) / 2;
        easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);

        // Render scene to buffer
        gl.setRenderTarget(buffer);
        gl.render(scene, camera);
        gl.setRenderTarget(null);
    });

    const { scale, ior, thickness, anisotropy, chromaticAberration } = modeProps;

    return (
        <>
            {createPortal(children, scene)}
            <mesh scale={[vp.width, vp.height, 1]}>
                <planeGeometry />
                <meshBasicMaterial map={buffer.texture} transparent />
            </mesh>
            <mesh ref={ref} scale={scale ?? 0.25} rotation-x={Math.PI / 2}>
                <cylinderGeometry args={[1, 1, 0.5, 64]} />
                <MeshTransmissionMaterial
                    buffer={buffer.texture}
                    ior={ior ?? 1.15}
                    thickness={thickness ?? 5}
                    anisotropy={anisotropy ?? 0.01}
                    chromaticAberration={chromaticAberration ?? 0.1}
                    transmission={1}
                    roughness={0}
                    color="#7B2CBF"
                />
            </mesh>
        </>
    );
}

function Typography() {
    const DEVICE = {
        mobile: { fontSize: 0.3 },
        tablet: { fontSize: 0.5 },
        desktop: { fontSize: 0.8 }
    };

    const getDevice = () => {
        if (typeof window === 'undefined') return 'desktop';
        const w = window.innerWidth;
        return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
    };

    const [device, setDevice] = useState(getDevice());

    useEffect(() => {
        const onResize = () => setDevice(getDevice());
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const { fontSize } = DEVICE[device];

    return (
        <Text
            position={[0, 0, 12]}
            fontSize={fontSize}
            letterSpacing={-0.05}
            outlineWidth={0}
            outlineBlur="20%"
            outlineColor="#000"
            outlineOpacity={0.5}
            color="white"
            anchorX="center"
            anchorY="middle"
        >
            Explainr
        </Text>
    );
}
