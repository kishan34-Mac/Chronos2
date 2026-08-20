import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useChronos } from '@/context/ChronosContext';
import { generateFinalSentence } from '@/utils/lifeCalc';
import { generateShareCard, copyToClipboard, formatToday } from '@/utils/shareCard';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Share2, Download } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function FinalSentence() {
  const { stats, dob } = useChronos();
  const sectionRef = useRef<HTMLDivElement>(null);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const finalSentence = (() => {
    if (!dob) return '';
    return generateFinalSentence(dob);
  })();

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.final-label',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, scrollTrigger: { trigger: sectionRef.current!, start: 'top 80%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.final-stats',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.5, scrollTrigger: { trigger: sectionRef.current!, start: 'top 70%', toggleActions: 'play none none none' } }
      );
      gsap.fromTo(
        '.final-share',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, delay: 0.8, scrollTrigger: { trigger: sectionRef.current!, start: 'top 65%', toggleActions: 'play none none none' } }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const words = finalSentence.split(' ');

  const handleShare = async () => {
    if (shareCardRef.current) {
      await generateShareCard(shareCardRef.current);
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(finalSentence);
    if (success) {
      setToast('Copied to clipboard');
      setTimeout(() => setToast(null), 2500);
    }
  };

  if (!stats || !dob) return null;

  return (
    <section
      id="final-sentence"
      ref={sectionRef}
      style={{
        background: 'var(--bg2)',
        padding: '120px 6vw',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.04), transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="final-label" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.3em', marginBottom: '2rem', position: 'relative' }}>
        YOUR VERDICT
      </div>

      <motion.div
        style={{
          maxWidth: 700,
          textAlign: 'center',
          position: 'relative',
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {words.map((word, i) => (
          <motion.span
            key={i}
            style={{
              fontFamily: 'var(--font-head)',
              fontStyle: 'italic',
              fontWeight: 300,
              fontSize: 'clamp(1.8rem, 3.5vw, 3rem)',
              color: 'var(--text)',
              lineHeight: 1.5,
              display: 'inline-block',
              marginRight: '0.3em',
            }}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.5 }}
          >
            {word}
          </motion.span>
        ))}
      </motion.div>

      <div className="final-stats" style={{ display: 'flex', gap: '3rem', marginTop: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--gold)', fontWeight: 500 }}>
            {stats.percentageLived.toFixed(2)}%
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: '0.25rem' }}>elapsed</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--gold)', fontWeight: 500 }}>
            {stats.daysLived.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: '0.25rem' }}>days lived</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--gold)', fontWeight: 500 }}>
            {stats.daysRemaining.toLocaleString()}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', marginTop: '0.25rem' }}>days ahead</div>
        </div>
      </div>

      <div className="final-share" style={{ marginTop: '3rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handleShare}
          style={{
            background: 'var(--gold)',
            color: '#050508',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            fontSize: 14,
            padding: '14px 32px',
            borderRadius: 2,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'background 0.3s ease, transform 0.2s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--gold2)'; e.currentTarget.style.transform = 'scale(1.02)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.transform = 'scale(1)'; }}
          data-cursor="interactive"
        >
          <Download size={16} />
          Share your sentence
        </button>
        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            color: 'var(--text2)',
            fontFamily: 'var(--font-body)',
            fontWeight: 400,
            fontSize: 14,
            padding: '14px 32px',
            borderRadius: 2,
            border: '1px solid var(--border2)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text2)'; e.currentTarget.style.borderColor = 'var(--border2)'; }}
          data-cursor="interactive"
        >
          <Share2 size={16} />
          Copy text
        </button>
      </div>

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)', fontStyle: 'italic' }}>
          chronos.app · Your data never leaves your device.
        </span>
      </div>

      {/* Hidden share card for html2canvas */}
      <div
        ref={shareCardRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: 600,
          height: 320,
          background: '#050508',
          border: '1px solid #D4AF37',
          padding: '2.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 20, color: '#D4AF37' }}>
          CHRONOS
        </div>
        <div style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontSize: 22, color: '#f0ede8', textAlign: 'center', lineHeight: 1.4, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {finalSentence}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#55525a' }}>
            Generated on {formatToday()}
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#D4AF37', fontWeight: 500 }}>{stats.percentageLived.toFixed(1)}%</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#55525a' }}>elapsed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#D4AF37', fontWeight: 500 }}>{stats.daysLived.toLocaleString()}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#55525a' }}>days lived</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: '#D4AF37', fontWeight: 500 }}>{stats.daysRemaining.toLocaleString()}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: '#55525a' }}>days ahead</div>
            </div>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#55525a' }}>
            chronos.app
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          style={{
            position: 'fixed',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--card)',
            border: '1px solid var(--border2)',
            padding: '10px 20px',
            borderRadius: 4,
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            color: 'var(--gold)',
            zIndex: 10000,
          }}
        >
          {toast}
        </motion.div>
      )}
    </section>
  );
}
