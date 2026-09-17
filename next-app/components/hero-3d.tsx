'use client';

import { useEffect, useRef } from 'react';

export default function Hero3D() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const onMove = (event: PointerEvent) => {
      const rect = scene.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      scene.style.setProperty('--mx', `${x * 2}`);
      scene.style.setProperty('--my', `${y * 2}`);
    };
    const onLeave = () => {
      scene.style.setProperty('--mx', '0');
      scene.style.setProperty('--my', '0');
    };

    scene.addEventListener('pointermove', onMove);
    scene.addEventListener('pointerleave', onLeave);
    return () => {
      scene.removeEventListener('pointermove', onMove);
      scene.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div ref={sceneRef} className="hero-scene" aria-label="Interactive industrial procurement network visualization">
      <div className="hero-orbit orbit-a" />
      <div className="hero-orbit orbit-b" />
      <div className="hero-orbit orbit-c" />
      <div className="hero-core">
        <div className="core-grid" />
        <div className="core-ring ring-one" />
        <div className="core-ring ring-two" />
        <div className="core-ring ring-three" />
        <div className="core-center">
          <span>IC</span>
          <small>PROCUREMENT<br />NETWORK</small>
        </div>
      </div>
      <div className="hero-node node-a"><b>RFQ</b><span>LIVE MATCH</span></div>
      <div className="hero-node node-b"><b>₹50L+</b><span>CONTRACT</span></div>
      <div className="hero-node node-c"><b>48H</b><span>INSPECTION</span></div>
      <div className="hero-node node-d"><b>QC</b><span>PROOF LAYER</span></div>
      <div className="hero-scan" />
    </div>
  );
}
