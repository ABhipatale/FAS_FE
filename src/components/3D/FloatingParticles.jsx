import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function FloatingParticles({ count = 30 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const particles = [];

    for (let i = 0; i < count; i++) {
      const particle = document.createElement("span");
      particle.className =
        "absolute block rounded-full bg-blue-200 backdrop-blur-sm";

      const size = Math.random() * 6 + 4; // 4px - 10px
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = `-${size}px`;

      container.appendChild(particle);
      particles.push(particle);

      animateParticle(particle);
    }

    function animateParticle(el) {
      const duration = gsap.utils.random(6, 12);
      const delay = gsap.utils.random(0, 5);
      const drift = gsap.utils.random(-50, 50);

      gsap.to(el, {
        y: -window.innerHeight - 100,
        x: drift,
        opacity: 0,
        duration: duration,
        delay: delay,
        ease: "none",
        onComplete: () => {
          gsap.set(el, {
            y: 0,
            x: 0,
            opacity: gsap.utils.random(0.2, 0.6),
            left: `${Math.random() * 100}%`,
          });
          animateParticle(el);
        },
      });
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [count]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden pointer-events-none"
    />
  );
}
