import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

interface EntryScreenProps {
  onBegin: (dateString: string) => void;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MAX_YEAR = new Date().getFullYear();
const MIN_YEAR = 1940;

function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      opacity: Math.random() * 0.2 + 0.1,
    }));

    const orbs = Array.from({ length: 5 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 120 + 80,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
      opacity: Math.random() * 0.03 + 0.03,
    }));

    const onResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      orbs.forEach((orb) => {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -orb.r) orb.x = w + orb.r;
        if (orb.x > w + orb.r) orb.x = -orb.r;
        if (orb.y < -orb.r) orb.y = h + orb.r;
        if (orb.y > h + orb.r) orb.y = -orb.r;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        grad.addColorStop(0, `rgba(212,175,55,${orb.opacity})`);
        grad.addColorStop(1, 'rgba(212,175,55,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      stars.forEach((star) => {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0) star.x = w;
        if (star.x > w) star.x = 0;
        if (star.y < 0) star.y = h;
        if (star.y > h) star.y = 0;

        ctx.fillStyle = `rgba(212,175,55,${star.opacity})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  );
}

export default function EntryScreen({ onBegin }: EntryScreenProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [isExiting, setIsExiting] = useState(false);

  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => i + 1), []);
  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = MAX_YEAR; y >= MIN_YEAR; y--) arr.push(y);
    return arr;
  }, []);

  const isValid = day && month && year;

  const handleBegin = () => {
    if (!isValid) return;
    const monthIndex = MONTHS.indexOf(month);
    const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setIsExiting(true);
    setTimeout(() => onBegin(dateStr), 600);
  };

  const logoLetters = 'CHRONOS'.split('');

  const selectStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text3)',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  };

  return (
    <motion.div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--bg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      initial={{ opacity: 1 }}
      animate={isExiting ? { opacity: 0, scale: 1.05 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <StarfieldCanvas />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 600, padding: '2rem' }}>
        <motion.div
          style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
        >
          {logoLetters.map((letter, i) => (
            <motion.span
              key={i}
              style={{
                fontFamily: 'var(--font-head)',
                fontWeight: 700,
                fontSize: 'clamp(3rem, 8vw, 6rem)',
                letterSpacing: '0.15em',
                color: 'var(--gold)',
                display: 'inline-block',
              }}
              variants={{ hidden: { y: 60, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>

        <motion.p
          style={{
            fontFamily: 'var(--font-head)',
            fontStyle: 'italic',
            fontWeight: 300,
            fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
            color: 'var(--text2)',
            marginBottom: '1rem',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Your life, visualized in real time.
        </motion.p>

        <motion.div
          style={{ width: 60, height: 1, background: 'var(--border)', margin: '1.5rem auto' }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        />

        <motion.p
          style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', marginBottom: '2rem' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          Enter your date of birth to begin.
        </motion.p>

        <motion.div
          style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.8 }}
        >
          <div style={selectStyle}>
            <span style={labelStyle}>Day</span>
            <select className="chronos-select" value={day} onChange={(e) => setDay(e.target.value)}>
              <option value="">--</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div style={selectStyle}>
            <span style={labelStyle}>Month</span>
            <select className="chronos-select" value={month} onChange={(e) => setMonth(e.target.value)}>
              <option value="">--</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
          <div style={selectStyle}>
            <span style={labelStyle}>Year</span>
            <select className="chronos-select" value={year} onChange={(e) => setYear(e.target.value)}>
              <option value="">--</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {isValid && (
          <motion.button
            onClick={handleBegin}
            style={{
              background: 'var(--gold)',
              color: '#050508',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 15,
              padding: '14px 36px',
              borderRadius: 2,
              border: 'none',
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02, backgroundColor: 'var(--gold2)' }}
            whileTap={{ scale: 0.98 }}
          >
            Begin your journey →
          </motion.button>
        )}

        <motion.div
          style={{
            marginTop: '2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.4rem',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <Lock size={12} color="var(--text3)" />
          <span style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 12, color: 'var(--text3)' }}>
            Your date of birth never leaves your device.
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
