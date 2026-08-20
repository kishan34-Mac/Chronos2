import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface NavbarProps {
  onReset: () => void;
}

const NAV_LINKS = [
  { label: 'Grid', target: 'life-grid' },
  { label: 'Chapters', target: 'life-chapters' },
  { label: 'Numbers', target: 'life-numbers' },
  { label: 'Goals', target: 'goals' },
];

export default function Navbar({ onReset }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6vw',
        background: scrolled ? 'rgba(5,5,8,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        transition: 'all 0.4s ease',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-head)',
          fontWeight: 700,
          fontSize: 18,
          color: 'var(--gold)',
          letterSpacing: '0.1em',
          cursor: 'pointer',
        }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        CHRONOS
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        {NAV_LINKS.map((link) => (
          <button
            key={link.target}
            onClick={() => scrollTo(link.target)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text3)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
          >
            {link.label}
          </button>
        ))}
        <button
          onClick={onReset}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text3)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'color 0.3s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--gold)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text3)')}
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>
    </nav>
  );
}
