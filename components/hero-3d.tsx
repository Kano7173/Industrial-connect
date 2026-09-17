'use client';

import { useEffect, useRef } from 'react';

const nodes = [
  { label: 'RFQ / LIVE', className: 'n1' },
  { label: '₹50L+', className: 'n2' },
  { label: 'QC VERIFIED', className: 'n3' },
  { label: '48H', className: 'n4' },
];

export default function Hero3D() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const update = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      const scroll = Math.min(window.scrollY / Math.max(window.innerHeight, 1), 2);

      el.style.setProperty('--mx', `${currentX * 7 + scroll * 5}deg`);
      el.style.setProperty('--my', `${currentY * -6 - scroll * 3}deg`);
      el.style.setProperty('--scroll-depth', `${scroll}`);
      raf = requestAnimationFrame(update);
    };

    const onPointerMove = (event: PointerEvent) => {
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetY = (event.clientY / window.innerHeight - 0.5) * 2;
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    raf = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div ref={ref} className="hero-3d" aria-hidden="true">
      <div className="hero-glow" />
      <div className="orbital o1" />
      <div className="orbital o2" />
      <div className="orbital o3" />
      <div className="orbital o4" />
      <div className="orbit-dot d1" />
      <div className="orbit-dot d2" />
      <div className="orbit-dot d3" />

      <div className="core-shell">
        <div className="core-ring ring-a" />
        <div className="core-ring ring-b" />
        <div className="core">
          <div className="core-grid" />
          <div className="core-noise" />
          <strong>IC</strong>
          <span>INDUSTRIAL<br />NETWORK</span>
        </div>
      </div>

      {nodes.map((node) => (
        <div className={`node ${node.className}`} key={node.label}>
          <i />
          {node.label}
        </div>
      ))}

      <div className="scan" />
      <div className="axis axis-x" />
      <div className="axis axis-y" />
      <div className="hero-caption">SCROLL TO NAVIGATE <b>↓</b></div>
    </div>
  );
}
