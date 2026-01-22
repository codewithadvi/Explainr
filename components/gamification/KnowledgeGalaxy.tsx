"use client";

import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { KnowledgeNode } from "@/types";
import { getKnowledgeRelationships } from "@/lib/storage/local-storage";

interface KnowledgeGalaxyProps {
    nodes: KnowledgeNode[];
    onNodeClick?: (node: KnowledgeNode) => void;
    className?: string;
}

export default function KnowledgeGalaxy({
    nodes,
    onNodeClick,
    className = "",
}: KnowledgeGalaxyProps) {
    const graphRef = useRef<any>();
    const [relationships, setRelationships] = useState<any[]>([]);

    useEffect(() => {
        // Load semantic relationships
        const rels = getKnowledgeRelationships();
        setRelationships(rels);
    }, [nodes]);

    function getMasteryColor(mastery: number): string {
        if (mastery < 30) return "#FF2A6D";
        if (mastery < 70) return "#E2E8F0";
        return "#00FF94";
    }

    function getRelationshipColor(type?: string): string {
        switch (type) {
            case 'prerequisite': return "#3B82F6"; // Blue - foundational
            case 'related': return "#A855F7"; // Purple - similar domain
            case 'partOf': return "#EC4899"; // Pink - hierarchical
            case 'enables': return "#10B981"; // Green - unlocks
            default: return "rgba(255, 255, 255, 0.3)"; // White - default
        }
    }

    const activeNodes = nodes;

    const graphData = {
        nodes: activeNodes.map((node: any) => ({
            id: node.id,
            name: node.topic,
            val: node.mastery / 10,
            color: node.color || getMasteryColor(node.mastery),
            domain: node.domain,
            tags: node.tags,
            difficulty: node.difficulty,
        })),
        links: activeNodes.flatMap((node: any) =>
            node.connections.map((targetId: string) => {
                // Find relationship metadata
                const rel = relationships.find(
                    r => (r.sourceId === node.id && r.targetId === targetId) ||
                        (r.targetId === node.id && r.sourceId === targetId)
                );

                return {
                    source: node.id,
                    target: targetId,
                    type: rel?.type,
                    strength: rel?.strength || 0.5,
                    reason: rel?.reason,
                };
            })
        ),
    };

    useEffect(() => {
        // Center and fit the graph with padding
        if (graphRef.current) {
            setTimeout(() => {
                graphRef.current.zoomToFit(800, 50); // More time and padding
            }, 100);
        }
    }, [activeNodes]);

    return (
        <div className={`relative rounded-3xl overflow-hidden bg-black/40 border border-white/10 backdrop-blur-md shadow-2xl ${className}`}>
            {/* Background Atmosphere */}
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-emerald-900/10 pointer-events-none" />

            {activeNodes.length === 0 ? (
                <div className="flex items-center justify-center h-full text-white/30 flex-col gap-4 p-8">
                    <div className="text-center">
                        <h3 className="text-xl font-display font-bold text-white mb-2">Galaxy Unexplored</h3>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto mb-4">Complete your first session to see your knowledge galaxy grow.</p>
                    </div>
                </div>
            ) : (
                <>
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={graphData}
                        nodeLabel={(node: any) => node.name || ""}
                        nodeCanvasObject={(node: any, ctx, globalScale) => {
                            const label = node.name || "";
                            const fontSize = 14 / globalScale; // Slightly larger font
                            const radius = Math.max((node.val || 5) * 1.5, 6); // Larger nodes

                            // Draw node circle with glow
                            ctx.shadowBlur = 25;
                            ctx.shadowColor = node.color;

                            // Outer glow
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
                            ctx.fillStyle = node.color;
                            ctx.globalAlpha = 0.4;
                            ctx.fill();
                            ctx.globalAlpha = 1;

                            // Core circle
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
                            ctx.fillStyle = node.color;
                            ctx.fill();

                            // Reset shadow for text
                            ctx.shadowBlur = 0;

                            // Draw label - ALWAYS VISIBLE
                            ctx.font = `bold ${fontSize}px 'Space Grotesk', sans-serif`;
                            ctx.textAlign = "center";
                            ctx.textBaseline = "middle";

                            const textWidth = ctx.measureText(label).width;
                            const padding = fontSize * 0.5;
                            const bgWidth = textWidth + padding * 2;
                            const bgHeight = fontSize * 1.4;

                            // Background for text - more opaque
                            const textX = node.x;
                            const textY = node.y + radius + fontSize + 6;

                            ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
                            ctx.fillRect(
                                textX - bgWidth / 2,
                                textY - bgHeight / 2,
                                bgWidth,
                                bgHeight
                            );

                            // Border around text background
                            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
                            ctx.lineWidth = 1;
                            ctx.strokeRect(
                                textX - bgWidth / 2,
                                textY - bgHeight / 2,
                                bgWidth,
                                bgHeight
                            );

                            // White text - ALWAYS VISIBLE
                            ctx.fillStyle = "#FFFFFF";
                            ctx.fillText(label, textX, textY);
                        }}
                        nodePointerAreaPaint={(node: any, color, ctx) => {
                            const radius = Math.max((node.val || 5) * 1.5, 6);
                            ctx.fillStyle = color;
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, radius + 5, 0, 2 * Math.PI);
                            ctx.fill();
                        }}
                        onNodeClick={(node: any) => {
                            const knowledgeNode = activeNodes.find((n: any) => n.id === node.id);
                            if (knowledgeNode && onNodeClick) {
                                console.log('Clicked node:', knowledgeNode.topic); // Debug
                                onNodeClick(knowledgeNode);
                            }
                        }}
                        backgroundColor="rgba(0,0,0,0)"
                        linkColor={(link: any) => getRelationshipColor(link.type)}
                        linkWidth={(link: any) => (link.strength || 0.5) * 3}
                        linkLabel={(link: any) => link.reason || link.type || ""}
                        linkDirectionalParticles={(link: any) => link.type === 'prerequisite' ? 3 : 1}
                        linkDirectionalParticleSpeed={0.005}
                        linkDirectionalParticleWidth={3}
                        linkDirectionalParticleColor={(link: any) => getRelationshipColor(link.type)}
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.3}
                    />
                </>
            )}
        </div>
    );
}
