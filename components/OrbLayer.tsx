"use client";

interface OrbLayerProps {
  visible?: boolean;
  speed?: number;
  intensity?: number;
}

export function OrbLayer({ visible = true, speed = 1, intensity = 0.26 }: OrbLayerProps) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
        overflow: "hidden",
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease",
      }}
    >
      <div style={{
        position: "absolute",
        width: 340,
        height: 340,
        borderRadius: "50%",
        filter: "blur(72px)",
        background: `oklch(0.50 0.22 145 / ${(intensity * 1.2).toFixed(2)})`,
        top: -80,
        left: -60,
        animation: `orbA ${(9 / speed).toFixed(1)}s ease-in-out infinite alternate`,
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute",
        width: 300,
        height: 300,
        borderRadius: "50%",
        filter: "blur(72px)",
        background: `oklch(0.50 0.20 240 / ${intensity.toFixed(2)})`,
        bottom: 80,
        right: -60,
        animation: `orbB ${(11 / speed).toFixed(1)}s ease-in-out infinite alternate`,
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute",
        width: 260,
        height: 260,
        borderRadius: "50%",
        filter: "blur(88px)",
        background: `oklch(0.58 0.18 60 / ${(intensity * 0.65).toFixed(2)})`,
        top: "44%",
        left: "12%",
        animation: `orbC ${(14 / speed).toFixed(1)}s ease-in-out infinite alternate`,
        willChange: "transform",
      }} />
    </div>
  );
}
