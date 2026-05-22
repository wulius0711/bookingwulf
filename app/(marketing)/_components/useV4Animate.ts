'use client';

import { useEffect } from 'react';

export function useV4Animate() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.v4-animate');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                el.classList.add('v4-visible');
              });
            });
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}
