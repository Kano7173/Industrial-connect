'use client';

import { useEffect, useState } from 'react';

export function InspectionCountdown({ deadline }: { deadline: string | null }) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!deadline) return;
    const tick = () => setRemaining(Math.max(0, new Date(deadline).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [deadline]);

  if (!deadline) return <span className="text-black/50">Inspection window not started</span>;
  const total = Math.floor(remaining / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return <span className={remaining === 0 ? 'text-orange' : 'text-cobalt'}>{h}h {m}m {s}s</span>;
}
