import { useEffect, useRef } from 'react';
import { useChronos } from '@/context/ChronosContext';
import {
  getChapterRanges,
  getChapterIndex,
  getChapterProgress,
  getAgeExact,
} from '@/utils/lifeCalc';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CHAPTERS = getChapterRanges();

const BOUNDARIES = [0, 13, 20, 36, 56, 76, 80];

export default function LifeChapters() {
  const { dob } = useChronos();
  const sectionRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.chapter-label',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: sectionRef.current!, start: 'top 85%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.chapter-heading',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.chapter-arc',
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.3, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.chapter-card',
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          scrollTrigger: { trigger: '.chapter-cards-container', start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
    }, sectionRef);

    // Animate the arc dot
    if (arcRef.current && dob) {
      const currentIdx = getChapterIndex(dob);
      const chapterProgress = getChapterProgress(dob);
      // Position along the arc (0-1 across all chapters)
      let lifeFraction = 0;
      for (let i = 0; i < currentIdx; i++) {
        lifeFraction += (BOUNDARIES[i + 1] - BOUNDARIES[i]);
      }
      lifeFraction += (BOUNDARIES[currentIdx + 1] - BOUNDARIES[currentIdx]) * (chapterProgress / 100);
      lifeFraction = lifeFraction / 80;

      gsap.fromTo(
        arcRef.current,
        { attr: { cx: 20 } },
        {
          attr: { cx: 20 + lifeFraction * 360 },
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: sectionRef.current!, start: 'top 70%', toggleActions: 'play none none none' },
        }
      );
    }

    return () => ctx.revert();
  }, [dob]);

  if (!dob) return null;

  const currentIdx = getChapterIndex(dob);
  const ageExact = getAgeExact(dob);

  // Arc setup
  const arcWidth = 380;
  const arcHeight = 190;
  const arcRadius = 180;
  const cx = 190;
  const cy = 190;
  const segments = CHAPTERS.map((chapter, i) => {
    const startAngle = Math.PI - (BOUNDARIES[i] / 80) * Math.PI;
    const endAngle = Math.PI - (BOUNDARIES[i + 1] / 80) * Math.PI;
    const x1 = cx + arcRadius * Math.cos(startAngle);
    const y1 = cy - arcRadius * Math.sin(startAngle);
    const x2 = cx + arcRadius * Math.cos(endAngle);
    const y2 = cy - arcRadius * Math.sin(endAngle);
    const largeArc = (endAngle - startAngle) > Math.PI / 2 ? 1 : 0;
    return {
      path: `M ${x1} ${y1} A ${arcRadius} ${arcRadius} 0 ${largeArc} 1 ${x2} ${y2}`,
      color: chapter.color,
    };
  });

  // Current position
  let lifeFraction = 0;
  for (let i = 0; i < currentIdx; i++) {
    lifeFraction += BOUNDARIES[i + 1] - BOUNDARIES[i];
  }
  lifeFraction += (BOUNDARIES[currentIdx + 1] - BOUNDARIES[currentIdx]) * (getChapterProgress(dob) / 100);
  lifeFraction = lifeFraction / 80;
  const dotAngle = Math.PI - lifeFraction * Math.PI;
  const dotX = cx + arcRadius * Math.cos(dotAngle);
  const dotY = cy - arcRadius * Math.sin(dotAngle);

  return (
    <section
      id="life-chapters"
      ref={sectionRef}
      style={{ background: 'var(--bg)', padding: '100px 6vw' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="chapter-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.25em', marginBottom: '1rem' }}>
          YOUR CHAPTERS
        </div>
        <h2 className="chapter-heading" style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)' }}>
          The story so far.
        </h2>
      </div>

      {/* Chapter Progress Arc */}
      <div className="chapter-arc" style={{ display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
        <svg width={arcWidth} height={arcHeight} viewBox="0 0 380 200">
          {segments.map((seg, i) => (
            <path
              key={i}
              d={seg.path}
              fill="none"
              stroke={seg.color}
              strokeWidth="4"
              strokeLinecap="round"
              opacity={i === currentIdx ? 1 : i < currentIdx ? 0.6 : 0.25}
            />
          ))}
          <circle
            ref={arcRef}
            cx={dotX}
            cy={dotY}
            r="6"
            fill="var(--gold)"
            stroke="var(--bg)"
            strokeWidth="2"
          />
        </svg>
      </div>

      <div
        className="chapter-cards-container"
        style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth < 768 ? '1fr' : 'repeat(2, 1fr)',
          gap: '1.5rem',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        {CHAPTERS.map((chapter, i) => {
          const isPast = i < currentIdx;
          const isActive = i === currentIdx;
          const isFuture = i > currentIdx;
          const progress = isActive ? getChapterProgress(dob) : 0;
          const chapterStart = BOUNDARIES[i];
          const chapterEnd = BOUNDARIES[i + 1];

          const cardStyle: React.CSSProperties = {
            background: isActive
              ? `linear-gradient(135deg, var(--card), ${chapter.color}0d)`
              : 'var(--card)',
            border: `1px solid ${isActive ? chapter.color : 'var(--border)'}`,
            borderRadius: 4,
            padding: '2rem',
            opacity: isPast ? 0.7 : isFuture ? 0.35 : 1,
            boxShadow: isActive ? `0 0 30px ${chapter.color}1a` : 'none',
            position: 'relative',
            transition: 'opacity 0.3s ease',
          };

          return (
            <div key={i} className="chapter-card" style={cardStyle}>
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 10,
                    color: chapter.color,
                    border: `1px solid ${chapter.color}`,
                    padding: '2px 8px',
                    borderRadius: 2,
                  }}
                >
                  NOW
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: 32 }}>{chapter.emoji}</span>
                <span style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 22, color: chapter.color }}>
                  {chapter.name}
                </span>
              </div>

              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)', marginBottom: '1rem' }}>
                Ages {chapter.range}
              </div>

              <div style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 15, color: 'var(--text2)', marginBottom: '1rem', lineHeight: 1.5 }}>
                {chapter.description}
              </div>

              {isPast && (
                <div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--green)', border: '1px solid var(--green)', padding: '2px 8px', borderRadius: 2, marginRight: '0.5rem' }}>
                    COMPLETED
                  </span>
                  <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text2)' }}>
                    Lasted {chapterEnd - chapterStart} years.
                  </span>
                </div>
              )}

              {isActive && (
                <div>
                  <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: '0.5rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: chapter.color, borderRadius: 2, transition: 'width 0.5s ease' }} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: chapter.color }}>
                    {progress.toFixed(1)}% complete · Age {ageExact.years}
                  </span>
                </div>
              )}

              {isFuture && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 2 }}>
                  UPCOMING
                </span>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
