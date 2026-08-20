import { useEffect, useRef, useState } from 'react';
import { useChronos } from '@/context/ChronosContext';
import { getGoalTime } from '@/utils/lifeCalc';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface Goal {
  name: string;
  totalHours: number;
  hoursPerDay: number;
}

const DEFAULT_GOALS: Goal[] = [
  { name: 'Write a novel', totalHours: 500, hoursPerDay: 1 },
  { name: 'Learn a language', totalHours: 600, hoursPerDay: 1 },
  { name: 'Master photography', totalHours: 300, hoursPerDay: 0.5 },
];

const QUICK_HOURS = [100, 500, 1000, 5000];

const ENCOURAGEMENTS = [
  'More than enough.',
  'Start today and you\'ll be done before you know it.',
  'That\'s achievable. The only question is when you begin.',
  'Completely within reach. What are you waiting for?',
  'Time is on your side — but only if you use it.',
];

export default function GoalCalculator() {
  const { stats } = useChronos();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [goals, setGoals] = useState<Goal[]>(DEFAULT_GOALS);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.goal-label',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: sectionRef.current!, start: 'top 85%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.goal-heading',
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.goal-subheading',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.15, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.goal-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          scrollTrigger: { trigger: '.goal-cards', start: 'top 75%', toggleActions: 'play none none none' },
        }
      );
      gsap.fromTo(
        '.goal-insight',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.3, scrollTrigger: { trigger: '.goal-insight', start: 'top 85%', toggleActions: 'play none none none' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  if (!stats) return null;

  const updateGoal = (index: number, updates: Partial<Goal>) => {
    setGoals((prev) => prev.map((g, i) => (i === index ? { ...g, ...updates } : g)));
  };

  const addGoal = () => {
    if (goals.length >= 4) return;
    setGoals((prev) => [...prev, { name: '', totalHours: 100, hoursPerDay: 1 }]);
  };

  const cols = window.innerWidth < 640 ? 1 : goals.length > 3 ? 2 : 3;

  return (
    <section
      id="goals"
      ref={sectionRef}
      style={{ background: 'var(--bg)', padding: '100px 6vw' }}
    >
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div className="goal-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.25em', marginBottom: '1rem' }}>
          YOUR GOALS
        </div>
        <h2 className="goal-heading" style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontWeight: 300, fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--text)', lineHeight: 1.2 }}>
          Time is the only
          <br />
          currency that matters.
        </h2>
        <p className="goal-subheading" style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 16, color: 'var(--text2)', marginTop: '1rem', maxWidth: 500, margin: '1rem auto 0' }}>
          You have approximately {stats.daysRemaining.toLocaleString()} days left. Here is what you can do with them.
        </p>
      </div>

      <div
        className="goal-cards"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: '1.5rem',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        {goals.map((goal, i) => {
          const result = getGoalTime(goal.hoursPerDay, goal.totalHours);
          const isFeasible = result.days <= stats.daysRemaining;
          const encouragement = ENCOURAGEMENTS[i % ENCOURAGEMENTS.length];
          const showResult = goal.name && goal.totalHours > 0;

          return (
            <div
              key={i}
              className="goal-card"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                padding: '2rem',
                borderRadius: 4,
              }}
            >
              <input
                className="chronos-input"
                type="text"
                value={goal.name}
                placeholder="Learn guitar"
                onChange={(e) => updateGoal(i, { name: e.target.value })}
                data-cursor="interactive"
              />

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.15em', marginBottom: '0.5rem' }}>
                  HOURS NEEDED
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {QUICK_HOURS.map((h) => (
                    <button
                      key={h}
                      onClick={() => updateGoal(i, { totalHours: h })}
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                        padding: '4px 10px',
                        borderRadius: 2,
                        background: goal.totalHours === h ? 'var(--gold-dim)' : 'transparent',
                        color: goal.totalHours === h ? 'var(--gold)' : 'var(--text3)',
                        border: `1px solid ${goal.totalHours === h ? 'var(--border2)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      data-cursor="interactive"
                    >
                      {h.toLocaleString()} hrs
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={goal.totalHours}
                  onChange={(e) => updateGoal(i, { totalHours: Number(e.target.value) || 0 })}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border)',
                    color: 'var(--text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    padding: '6px 0',
                    marginTop: '0.75rem',
                    outline: 'none',
                  }}
                  data-cursor="interactive"
                />
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text3)', letterSpacing: '0.15em' }}>
                    HOURS PER DAY
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)' }}>
                    {goal.hoursPerDay} hr/day
                  </span>
                </div>
                <input
                  type="range"
                  className="chronos-range"
                  min="0.5"
                  max="4"
                  step="0.5"
                  value={goal.hoursPerDay}
                  onChange={(e) => updateGoal(i, { hoursPerDay: Number(e.target.value) })}
                  data-cursor="interactive"
                />
              </div>

              {showResult && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginBottom: '0.5rem' }}>
                    At {goal.hoursPerDay} hours/day:
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 36, color: 'var(--gold)', lineHeight: 1, marginBottom: '0.5rem' }}>
                    {Math.ceil(result.days).toLocaleString()} days
                  </div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text2)', marginBottom: '0.75rem' }}>
                    That's {Math.ceil(result.months)} months — or {result.years.toFixed(1)} years.
                  </div>
                  <div style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 14, color: isFeasible ? 'var(--green)' : 'var(--crimson)' }}>
                    {encouragement}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length < 4 && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={addGoal}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 12,
              color: 'var(--text3)',
              background: 'transparent',
              border: '1px solid var(--border)',
              padding: '10px 24px',
              borderRadius: 2,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border2)';
              e.currentTarget.style.color = 'var(--gold)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text3)';
            }}
            data-cursor="interactive"
          >
            <Plus size={14} />
            Add your own
          </button>
        </div>
      )}

      <div className="goal-insight" style={{ textAlign: 'center', marginTop: '3rem', maxWidth: 700, margin: '3rem auto 0' }}>
        <p style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 18, color: 'var(--text2)', lineHeight: 1.5 }}>
          If you spent just 1 hour a day on something that matters, you would accumulate {stats.daysRemaining.toLocaleString()} hours. That is enough to master almost anything.
        </p>
      </div>
    </section>
  );
}
