"use client";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface VortexProps {
    children?: React.ReactNode;
    className?: string;
    backgroundColor?: string;
    containerClassName?: string;
    particleCount?: number;
    rangeY?: number;
    baseHue?: number;
    baseSpeed?: number;
    rangeSpeed?: number;
    baseRadius?: number;
    rangeRadius?: number;
    baseSize?: number;
    rangeSize?: number;
}

export const Vortex = ({
    children,
    className = "",
    backgroundColor = "black",
    containerClassName = "",
    particleCount = 700,
    rangeY = 400,
    baseHue = 170,
    baseSpeed = 0.1,
    rangeSpeed = 1.5,
    baseRadius = 1,
    rangeRadius = 2,
    baseSize = 1,
    rangeSize = 2,
}: VortexProps) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let w = (canvas.width = window.innerWidth);
        let h = (canvas.height = window.innerHeight);

        const particles: Particle[] = [];
        const mouse = { x: w / 2, y: h / 2 };

        class Particle {
            x: number;
            y: number;
            speed: number;
            radius: number;
            size: number;
            hue: number;

            constructor() {
                this.x = Math.random() * w;
                this.y = Math.random() * h;
                this.speed = baseSpeed + Math.random() * rangeSpeed;
                this.radius = baseRadius + Math.random() * rangeRadius;
                this.size = baseSize + Math.random() * rangeSize;
                this.hue = baseHue + Math.random() * 60;
            }

            update() {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx);

                this.x += Math.cos(angle) * this.speed;
                this.y += Math.sin(angle) * this.speed;

                if (dist < 150) {
                    this.x -= Math.cos(angle) * this.speed * 3;
                    this.y -= Math.sin(angle) * this.speed * 3;
                }

                if (this.x < 0 || this.x > w) this.x = Math.random() * w;
                if (this.y < 0 || this.y > h) this.y = Math.random() * h;
            }

            draw() {
                if (!ctx) return;

                // Add glow effect
                ctx.shadowBlur = 15;
                ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, 0.8)`;

                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = `hsla(${this.hue}, 100%, 70%, 0.9)`;
                ctx.fill();

                // Reset shadow for next particle
                ctx.shadowBlur = 0;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
            ctx.fillRect(0, 0, w, h);

            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleResize = () => {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("resize", handleResize);

        animate();

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("resize", handleResize);
        };
    }, [
        isMounted,
        particleCount,
        rangeY,
        baseHue,
        baseSpeed,
        rangeSpeed,
        baseRadius,
        rangeRadius,
        baseSize,
        rangeSize,
        backgroundColor,
    ]);

    return (
        <div className={`relative ${containerClassName}`}>
            <canvas
                ref={canvasRef}
                className="absolute inset-0 z-0"
                style={{ backgroundColor }}
            />
            <div className={`relative z-10 ${className}`}>{children}</div>
        </div>
    );
};
