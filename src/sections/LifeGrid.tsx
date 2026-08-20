import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChronos } from '@/context/ChronosContext';
import { getTotalWeeksTotal, getWeekData, getChapterColorForWeek } from '@/utils/lifeCalc';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_WEEKS = getTotalWeeksTotal(); // 4160
const COLS = 52;
const ROWS = 80;

const LEGEND = [
  { color: 'var(--gold)', label: 'Lived' },
  { color: 'var(--gold2)', label: 'This week', glow: true },
  { color: 'transparent', border: 'rgba(212,175,55,0.15)', label: 'Ahead' },
];

const CHAPTER_LEGEND = [
  { color: 'rgba(74,222,128,0.7)', label: 'Childhood' },
  { color: 'rgba(96,165,250,0.7)', label: 'Teen' },
  { color: 'rgba(249,115,22,0.7)', label: 'Young Adult' },
  { color: 'rgba(212,175,55,0.9)', label: 'Prime' },
  { color: 'rgba(167,139,250,0.7)', label: 'Elder' },
  { color: 'rgba(240,208,96,0.7)', label: 'Legacy' },
];

interface HoverInfo {
  x: number;
  y: number;
  weekIndex: number;
}

// Parse a CSS color string to a usable fill color for canvas
function resolveColor(color: string): string {
  if (color.startsWith('rgba') || color.startsWith('rgb') || color.startsWith('#')) {
    return color;
  }
  // CSS var fallbacks
  if (color.includes('gold2')) return '#f0d060';
  if (color.includes('gold')) return '#D4AF37';
  return '#D4AF37';
}

export default function LifeGrid() {
  const { stats, dob } = useChronos();
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hovered, setHovered] = useState<HoverInfo | null>(null);
  const animProgressRef = useRef(0);
  const rafRef = useRef<number>(0);
  const [animDone, setAnimDone] = useState(false);

  // Responsive dot sizing
  const dotSize = typeof window !== 'undefined' && window.innerWidth < 640 ? 4 : window.innerWidth < 1024 ? 6 : 8;
  const gap = 3;
  const cellSize = dotSize + gap;
  const gridWidth = COLS * cellSize - gap;
  const gridHeight = ROWS * cellSize - gap;

  // Draw the grid on canvas
  useEffect(() => {
    if (!canvasRef.current || !stats) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = gridWidth * dpr;
    canvas.height = gridHeight * dpr;
    canvas.style.width = `${gridWidth}px`;
    canvas.style.height = `${gridHeight}px`;
    ctx.scale(dpr, dpr);

    const currentWeek = stats.weeksLived;

    const draw = () => {
      ctx.clearRect(0, 0, gridWidth, gridHeight);
      const progress = animProgressRef.current;
      const rowsToShow = Math.floor(progress * ROWS);

      for (let r = 0; r < ROWS; r++) {
        const rowVisible = r < rowsToShow ? 1 : r === rowsToShow ? progress * ROWS - rowsToShow : 0;
        if (rowVisible <= 0) continue;
        for (let c = 0; c < COLS; c++) {
          const weekIndex = r * COLS + c;
          if (weekIndex >= TOTAL_WEEKS) continue;
          const x = c * cellSize;
          const y = r * cellSize;
          const radius = dotSize / 2;

          ctx.beginPath();
          ctx.arc(x + radius, y + radius, radius, 0, Math.PI * 2);

          if (weekIndex === currentWeek) {
            // Current week — glowing gold
            const pulse = 0.8 + Math.sin(Date.now() * 0.003) * 0.2;
            ctx.shadowColor = '#D4AF37';
            ctx.shadowBlur = 8 * pulse;
            ctx.fillStyle = '#f0d060';
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (weekIndex < currentWeek) {
            // Past — chapter color
            ctx.fillStyle = resolveColor(getChapterColorForWeek(weekIndex));
            ctx.fill();
          } else {
            // Future — hollow circle
            ctx.strokeStyle = 'rgba(212,175,55,0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    // Entrance animation via rAF
    const animate = () => {
      if (animProgressRef.current < 1) {
        animProgressRef.current = Math.min(1, animProgressRef.current + 0.02);
        draw();
        rafRef.current = requestAnimationFrame(animate);
        if (animProgressRef.current >= 1) setAnimDone(true);
      } else {
        draw();
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    // Start animation when scrolled into view
    const st = ScrollTrigger.create({
      trigger: canvas,
      start: 'top 80%',
      onEnter: () => {
        animProgressRef.current = 0;
        rafRef.current = requestAnimationFrame(animate);
      },
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      st.kill();
    };
  }, [stats, gridWidth, gridHeight, cellSize, dotSize]);

  // Section header animations
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.grid-label',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: sectionRef.current!, start: 'top 85%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.grid-heading',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.grid-subheading',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.15, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!stats || !dob) return null;

  const currentWeek = stats.weeksLived;
  const remaining = TOTAL_WEEKS - stats.weeksLived;

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    if (col >= 0 && col < COLS && row >= 0 && row < ROWS) {
      const weekIndex = row * COLS + col;
      if (weekIndex < TOTAL_WEEKS) {
        setHovered({ x: e.clientX, y: e.clientY, weekIndex });
      }
    }
  };

  const hoverData = hovered !== null ? getWeekData(hovered.weekIndex, dob) : null;

  return (
    <section
      id="life-grid"
      ref={sectionRef}
      style={{ background: 'var(--bg2)', padding: '100px 6vw', overflow: 'hidden' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="grid-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.25em', marginBottom: '1rem' }}>
          YOUR LIFE IN WEEKS
        </div>
        <h2 className="grid-heading" style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)', lineHeight: 1.2 }}>
          Every week you have
          <br />
          ever lived.
        </h2>
        <p className="grid-subheading" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15, color: 'var(--text2)', marginTop: '1rem' }}>
          Each dot is one week. {stats.weeksLived.toLocaleString()} are gone. {remaining.toLocaleString()} remain.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', overflowX: 'auto', paddingBottom: '1rem' }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handleCanvasMove}
          onMouseLeave={() => setHovered(null)}
          data-cursor="interactive"
          style={{ cursor: 'pointer' }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '2rem', flexWrap: 'wrap' }}>
        {LEGEND.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: item.color,
                border: item.border ? `1px solid ${item.border}` : 'none',
                boxShadow: item.glow ? '0 0 6px var(--gold)' : 'none',
              }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{item.label}</span>
          </div>
        ))}
        <div style={{ width: 1, background: 'var(--border)' }} />
        {CHAPTER_LEGEND.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {hovered !== null && hoverData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              left: hovered.x,
              top: hovered.y - 10,
              transform: 'translate(-50%, -100%)',
              background: 'var(--card)',
              border: '1px solid var(--border2)',
              padding: '10px 14px',
              borderRadius: 4,
              pointerEvents: 'none',
              zIndex: 1000,
              whiteSpace: 'nowrap',
            }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', marginBottom: '0.25rem' }}>
              Week {hovered.weekIndex + 1}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)', marginBottom: '0.25rem' }}>
              Age ~{hoverData.approximateAge} · {hoverData.seasonEmoji} {hoverData.approximateSeason}
            </div>
            <div style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 13, color: 'var(--text)', marginBottom: '0.25rem' }}>
              "{hoverData.message}"
            </div>
            {hovered.weekIndex === currentWeek ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)' }}>← You are here</div>
            ) : hoverData.isPast ? (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>Lived</div>
            ) : (
              <div style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 11, color: 'var(--text3)' }}>Still unwritten.</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
