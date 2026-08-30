"use client";

import * as React from "react";

interface FlightRadarCanvasProps {
  nodeCount?: number;
  className?: string;
}

interface FlightNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  zone: number;
  pulseRadius: number;
  maxPulse: number;
  pulseSpeed: number;
}

interface FlightPlane {
  id: number;
  fromIdx: number;
  toIdx: number;
  progress: number;
  baseSpeed: number;
  currentSpeed: number;
}

// Helper to draw a top-down airplane icon
function drawAirplaneShape(ctx: CanvasRenderingContext2D, size: number = 8) {
  ctx.beginPath();
  // Nose
  ctx.moveTo(size, 0);
  // Right Wing
  ctx.lineTo(size * 0.1, size * 0.25);
  ctx.lineTo(-size * 0.2, size * 0.95);
  ctx.lineTo(-size * 0.45, size * 0.95);
  ctx.lineTo(-size * 0.3, size * 0.25);
  // Right Tail
  ctx.lineTo(-size * 0.75, size * 0.18);
  ctx.lineTo(-size * 0.85, size * 0.5);
  ctx.lineTo(-size * 1.0, size * 0.5);
  ctx.lineTo(-size * 0.9, 0);
  // Left Tail
  ctx.lineTo(-size * 1.0, -size * 0.5);
  ctx.lineTo(-size * 0.85, -size * 0.5);
  ctx.lineTo(-size * 0.75, -size * 0.18);
  // Left Wing
  ctx.lineTo(-size * 0.3, -size * 0.25);
  ctx.lineTo(-size * 0.45, -size * 0.95);
  ctx.lineTo(-size * 0.2, -size * 0.95);
  ctx.lineTo(size * 0.1, -size * 0.25);
  ctx.closePath();
}

export function FlightRadarCanvas({ nodeCount = 8, className = "" }: FlightRadarCanvasProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = canvas.clientWidth || window.innerWidth;
      canvas.height = canvas.clientHeight || window.innerHeight * 0.45;
    };
    resize();
    window.addEventListener("resize", resize);

    // Create 4 distinct screen zones across canvas width (Left, Mid-Left, Mid-Right, Right)
    const zoneWidth = canvas.width / 4;
    const nodes: FlightNode[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const zone = i % 4;
      const minX = zone * zoneWidth + 30;
      const maxX = (zone + 1) * zoneWidth - 30;
      nodes.push({
        x: minX + Math.random() * (maxX - minX),
        y: 30 + Math.random() * (canvas.height - 60),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        zone,
        pulseRadius: 0,
        maxPulse: 25 + Math.random() * 25,
        pulseSpeed: 0.15 + Math.random() * 0.2,
      });
    }

    // Helper to get a long-haul cross-screen route
    const getLongHaulRoute = (existingPlanes: FlightPlane[], currentFromIdx?: number) => {
      const usedRoutes = new Set(
        existingPlanes.flatMap((p) => [`${p.fromIdx}-${p.toIdx}`, `${p.toIdx}-${p.fromIdx}`])
      );

      let fromIdx = currentFromIdx !== undefined ? currentFromIdx : Math.floor(Math.random() * nodeCount);
      let toIdx = Math.floor(Math.random() * nodeCount);
      let attempts = 0;

      while (attempts < 40) {
        if (currentFromIdx === undefined) fromIdx = Math.floor(Math.random() * nodeCount);
        toIdx = Math.floor(Math.random() * nodeCount);

        const p1 = nodes[fromIdx];
        const p2 = nodes[toIdx];
        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

        // Require route distance >= 280px and different airport zones
        if (
          toIdx !== fromIdx &&
          !usedRoutes.has(`${fromIdx}-${toIdx}`) &&
          dist >= 280 &&
          Math.abs(p1.zone - p2.zone) >= 1
        ) {
          break;
        }
        attempts++;
      }

      return { fromIdx, toIdx };
    };

    // Initialize 3 active planes spaced across the screen on long-haul routes
    const planes: FlightPlane[] = [];
    for (let i = 0; i < 3; i++) {
      const route = getLongHaulRoute(planes);
      const speed = 0.0003 + Math.random() * 0.00025;
      planes.push({
        id: i,
        fromIdx: route.fromIdx,
        toIdx: route.toIdx,
        progress: (i * 0.33 + 0.1) % 1, // Well-separated initial positions
        baseSpeed: speed,
        currentSpeed: speed,
      });
    }

    const calculatePlanePos = (plane: FlightPlane) => {
      const p1 = nodes[plane.fromIdx];
      const p2 = nodes[plane.toIdx];
      if (!p1 || !p2) return { x: 0, y: 0, angle: 0 };

      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2 - dist * 0.12;

      const t = plane.progress;
      const x = (1 - t) ** 2 * p1.x + 2 * (1 - t) * t * midX + t ** 2 * p2.x;
      const y = (1 - t) ** 2 * p1.y + 2 * (1 - t) * t * midY + t ** 2 * p2.y;

      const tNext = Math.min(1, t + 0.01);
      const nextX = (1 - tNext) ** 2 * p1.x + 2 * (1 - tNext) * tNext * midX + tNext ** 2 * p2.x;
      const nextY = (1 - tNext) ** 2 * p1.y + 2 * (1 - tNext) * tNext * midY + tNext ** 2 * p2.y;

      const angle = Math.atan2(nextY - y, nextX - x);
      return { x, y, angle };
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Flight Arcs (Only long-haul cross-zone connections)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.hypot(dx, dy);

          if (dist < 500 && dist > 180) {
            ctx.beginPath();
            const midX = (nodes[i].x + nodes[j].x) / 2;
            const midY = (nodes[i].y + nodes[j].y) / 2 - dist * 0.12;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.quadraticCurveTo(midX, midY, nodes[j].x, nodes[j].y);

            const lineAlpha = 0.14 * (1 - dist / 500);
            ctx.strokeStyle = `rgba(255, 200, 0, ${lineAlpha})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      // 2. Air Traffic Control (ATC) Collision Avoidance System
      const planePositions = planes.map((plane) => ({
        plane,
        pos: calculatePlanePos(plane),
      }));

      const MIN_SAFETY_GAP = 90; // Enforce minimum 90px separation

      for (let i = 0; i < planePositions.length; i++) {
        for (let j = i + 1; j < planePositions.length; j++) {
          const pA = planePositions[i];
          const pB = planePositions[j];
          const gap = Math.hypot(pA.pos.x - pB.pos.x, pA.pos.y - pB.pos.y);

          if (gap < MIN_SAFETY_GAP) {
            pB.plane.currentSpeed = pB.plane.baseSpeed * 0.2; // Slow down plane B
            pA.plane.currentSpeed = pA.plane.baseSpeed * 1.15; // Speed up plane A
          } else {
            pA.plane.currentSpeed = pA.plane.baseSpeed;
            pB.plane.currentSpeed = pB.plane.baseSpeed;
          }
        }
      }

      // 3. Render Airplanes
      planePositions.forEach(({ plane, pos }) => {
        plane.progress += plane.currentSpeed;

        if (plane.progress >= 1) {
          plane.progress = 0;
          const nextRoute = getLongHaulRoute(planes, plane.toIdx);
          plane.fromIdx = nextRoute.fromIdx;
          plane.toIdx = nextRoute.toIdx;
        }

        ctx.save();
        ctx.translate(pos.x, pos.y);
        ctx.rotate(pos.angle);

        ctx.shadowColor = "#FFC800";
        ctx.shadowBlur = 8;

        drawAirplaneShape(ctx, 8.5);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();

        ctx.strokeStyle = "#eb5757";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      });

      // 4. Update & Draw Airport Nodes with Radar Pings
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;

        // Keep node within its assigned zone bounds
        const minZoneX = node.zone * zoneWidth + 20;
        const maxZoneX = (node.zone + 1) * zoneWidth - 20;

        if (node.x < minZoneX || node.x > maxZoneX) node.vx *= -1;
        if (node.y < 25 || node.y > canvas.height - 25) node.vy *= -1;

        node.pulseRadius += node.pulseSpeed;
        if (node.pulseRadius > node.maxPulse) {
          node.pulseRadius = 0;
        }

        const pulseAlpha = 0.3 * (1 - node.pulseRadius / node.maxPulse);

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(235, 87, 87, ${pulseAlpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 200, 0, 0.3)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = "#FFC800";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [nodeCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute top-0 left-0 w-full z-10 opacity-80 mix-blend-screen ${className}`}
    />
  );
}
