import { useEffect, useRef } from 'react';

export default function GrainOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const frameCount = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Tiny offscreen grain texture, then tile/scale up — avoids writing millions of pixels per frame
    const grainCanvas = document.createElement('canvas');
    grainCanvas.width = 128;
    grainCanvas.height = 128;
    const grainCtx = grainCanvas.getContext('2d');
    if (!grainCtx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drawGrain = () => {
      frameCount.current++;
      if (frameCount.current % 3 === 0) {
        // Redraw tiny noise texture (16K pixels vs 2M+ at full res)
        const imageData = grainCtx.createImageData(128, 128);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const noise = Math.random() * 255;
          data[i] = noise;
          data[i + 1] = noise;
          data[i + 2] = noise;
          data[i + 3] = Math.random() * 30;
        }
        grainCtx.putImageData(imageData, 0, 0);

        // Scale up the small texture to fill viewport
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const pattern = ctx.createPattern(grainCanvas, 'repeat');
        if (pattern) {
          ctx.fillStyle = pattern;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
      rafRef.current = requestAnimationFrame(drawGrain);
    };

    rafRef.current = requestAnimationFrame(drawGrain);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9000,
        opacity: 0.03,
        mixBlendMode: 'overlay',
      }}
    />
  );
}
