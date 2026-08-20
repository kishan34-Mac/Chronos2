import { useEffect, useRef } from 'react';
import { useChronos } from '@/context/ChronosContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Heart, Wind, Moon, Footprints, Coffee, MessageCircle, Sparkles, Sun } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function LifeInNumbers() {
  const { stats } = useChronos();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.numbers-label',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: sectionRef.current!, start: 'top 85%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.numbers-heading',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.numbers-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: { trigger: '.numbers-grid', start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo(
        '.numbers-footer',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, scrollTrigger: { trigger: '.numbers-footer', start: 'top 85%', toggleActions: 'play none none none' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!stats) return null;

  const cards = [
    { icon: Heart, value: stats.heartbeats, label: 'Times your heart has beaten' },
    { icon: Wind, value: stats.breaths, label: 'Breaths you have taken' },
    { icon: Moon, value: stats.sleepHours, label: 'Hours spent sleeping' },
    { icon: Footprints, value: stats.stepsWalked, label: 'Steps walked (estimated)' },
    { icon: Coffee, value: stats.mealsEaten, label: 'Meals you have eaten' },
    { icon: MessageCircle, value: stats.wordsSpoken, label: 'Words you have spoken' },
    { icon: Sparkles, value: stats.dreamsHad, label: 'Dreams you have dreamed' },
    { icon: Sun, value: stats.sunrisesSeen, label: 'Sunrises since your birth' },
  ];

  const cols = window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 4;

  return (
    <section
      id="life-numbers"
      ref={sectionRef}
      style={{ background: 'var(--bg2)', padding: '100px 6vw' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <span className="numbers-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.25em' }}>
            BY THE NUMBERS
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', animation: 'livePulse 2s ease-in-out infinite' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)' }}>Updating live</span>
          </div>
        </div>
        <h2 className="numbers-heading" style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)', lineHeight: 1.2 }}>
          The mathematics
          <br />
          of your existence.
        </h2>
      </div>

      <div
        className="numbers-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '1.5rem',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="numbers-card"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                padding: '2rem',
                borderRadius: 4,
                transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border2)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              data-cursor="interactive"
            >
              <Icon size={24} color="var(--gold)" />
              <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', color: 'var(--gold)', margin: '0.75rem 0 0.5rem', lineHeight: 1 }}>
                {card.value.toLocaleString()}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
                {card.label}
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                (approx.)
              </div>
            </div>
          );
        })}
      </div>

      <div className="numbers-footer" style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 22, color: 'var(--text2)' }}>
          Every one of these numbers is uniquely yours.
        </p>
      </div>
    </section>
  );
}
