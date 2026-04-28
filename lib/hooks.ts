import { useState, useEffect, useRef } from "react";

export function useCountUp(target: number, ms = 900) {
  const [v, setV] = useState(target);
  const prev = useRef(target);

  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;

    let start: number | null = null;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / ms, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setV(Math.round(from + ease * (target - from)));
      if (p < 1) requestAnimationFrame(tick);
    };

    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, ms]);

  return v;
}
