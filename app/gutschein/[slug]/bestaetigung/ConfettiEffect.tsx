'use client';

import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function ConfettiEffect() {
  useEffect(() => {
    const end = Date.now() + 1800;
    const colors = ['#ff718d', '#fdff6a', '#a8edea', '#fed6e3', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return null;
}
