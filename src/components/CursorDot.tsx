import { useEffect, useRef } from 'react';

export default function CursorDot() {
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: 0, y: 0 });
  const dotPos = useRef({ x: 0, y: 0 });
  const mousePos = useRef({ x: 0, y: 0 });
  const isDown = useRef(false);
  const isHovering = useRef(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;

    const onMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      const target = e.target as HTMLElement;
      isHovering.current = !!target.closest('a, button, select, input, [data-cursor="interactive"], .chronos-select, .chronos-range, .chronos-input');
    };

    const onDown = () => { isDown.current = true; };
    const onUp = () => { isDown.current = false; };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const animate = () => {
      dotPos.current.x = lerp(dotPos.current.x, mousePos.current.x, 0.28);
      dotPos.current.y = lerp(dotPos.current.y, mousePos.current.y, 0.28);
      ringPos.current.x = lerp(ringPos.current.x, mousePos.current.x, 0.1);
      ringPos.current.y = lerp(ringPos.current.y, mousePos.current.y, 0.1);

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x - 2}px, ${dotPos.current.y - 2}px)`;
      }

      if (ringRef.current) {
        let ringSize = isHovering.current ? 32 : 18;
        let sx = 1, sy = 1;
        if (isDown.current) { sx = 0.6; sy = 1.4; }
        const offset = ringSize / 2;
        ringRef.current.style.transform = `translate(${ringPos.current.x - offset}px, ${ringPos.current.y - offset}px) scale(${sx}, ${sy})`;
        ringRef.current.style.width = `${ringSize}px`;
        ringRef.current.style.height = `${ringSize}px`;
        ringRef.current.style.background = isHovering.current ? 'rgba(212,175,55,0.08)' : 'transparent';
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 18,
          height: 18,
          border: '1.5px solid rgba(212,175,55,0.5)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
          transition: 'width 0.2s ease, height 0.2s ease, background 0.2s ease',
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          background: 'var(--gold)',
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </>
  );
}
