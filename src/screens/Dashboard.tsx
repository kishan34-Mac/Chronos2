import { useEffect, useRef } from 'react';
import Lenis from '@studio-freight/lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useChronos } from '@/context/ChronosContext';
import Navbar from '@/components/Navbar';
import WaveDivider from '@/components/WaveDivider';
import HeroOrb from '@/sections/HeroOrb';
import LifeGrid from '@/sections/LifeGrid';
import LifeChapters from '@/sections/LifeChapters';
import LifeInNumbers from '@/sections/LifeInNumbers';
import GoalCalculator from '@/sections/GoalCalculator';
import FinalSentence from '@/sections/FinalSentence';

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
  const { clearDob } = useChronos();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <Navbar onReset={clearDob} />
      <HeroOrb />
      <WaveDivider fill="var(--bg2)" />
      <LifeGrid />
      <WaveDivider fill="var(--bg)" flip />
      <LifeChapters />
      <WaveDivider fill="var(--bg2)" />
      <LifeInNumbers />
      <WaveDivider fill="var(--bg)" flip />
      <GoalCalculator />
      <WaveDivider fill="var(--bg2)" />
      <FinalSentence />
    </motion.div>
  );
}
