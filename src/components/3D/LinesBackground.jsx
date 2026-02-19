import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function LinesBackground() {
  const linesRef = useRef(null);

  useEffect(() => {
    gsap.to(linesRef.current, {
      backgroundPosition: "300% 300%",
      duration: 60,
      repeat: -1,
      ease: "none",
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      
      {/* Animated Grid + Lines */}
      <div
        ref={linesRef}
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px),
            linear-gradient(120deg, rgba(99,102,241,0.15) 1px, transparent 1px),
            linear-gradient(60deg, rgba(59,130,246,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px, 60px 60px, 120px 120px, 120px 120px",
        }}
      />

      {/* Glow Layer for Depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]" />

      {/* Softer Gradient Overlay (so lines remain visible) */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-indigo-950/70 to-slate-900/80" />
    </div>
  );
}
