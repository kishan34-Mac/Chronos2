import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useChronos } from '@/context/ChronosContext';
import { gsap } from 'gsap';

// Simple pseudo-noise function for vertex displacement
function noise3D(x: number, y: number, z: number): number {
  return (
    Math.sin(x * 2.1 + y * 1.7) * 0.5 +
    Math.cos(y * 3.2 + z * 2.5) * 0.3 +
    Math.sin(z * 1.8 + x * 4.1) * 0.2
  );
}

function BreathingOrb({ percentageRemaining }: { percentageRemaining: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(percentageRemaining);

  // Update the scale ref without re-creating the scene
  useEffect(() => {
    scaleRef.current = percentageRemaining;
  }, [percentageRemaining]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.appendChild(renderer.domElement);

    // Orb group
    const orbGroup = new THREE.Group();
    scene.add(orbGroup);

    // Main orb — 64 segments is plenty visually, 4x fewer vertices than 128
    const orbGeo = new THREE.SphereGeometry(1.8, 64, 64);
    const positions = orbGeo.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = positions.getZ(i);
      const noise = noise3D(x * 0.8, y * 0.8, z * 0.8);
      const len = Math.sqrt(x * x + y * y + z * z);
      const nx = (x / len) * (1.8 + noise * 0.15);
      const ny = (y / len) * (1.8 + noise * 0.15);
      const nz = (z / len) * (1.8 + noise * 0.15);
      positions.setXYZ(i, nx, ny, nz);
    }
    orbGeo.computeVertexNormals();

    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x0a0820,
      emissive: 0xD4AF37,
      emissiveIntensity: 0.12,
      roughness: 0.4,
      metalness: 0.6,
    });
    const orbMesh = new THREE.Mesh(orbGeo, orbMat);
    orbGroup.add(orbMesh);

    // Wireframe overlay — same 64 segments
    const wireGeo = new THREE.SphereGeometry(1.82, 64, 64);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0xD4AF37,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    orbGroup.add(wireMesh);

    // Inner glow — 16 segments is enough for a glow sphere
    const glowGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xD4AF37,
      transparent: true,
      opacity: 0.04,
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    orbGroup.add(glowMesh);

    // Particle ring — use Points for a single draw call instead of 300 meshes
    const PARTICLE_COUNT = 300;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const particleData: { speed: number; offset: number; orbitR: number }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const orbitR = Math.random() * 1.0 + 2.2;
      const speed = Math.random() * 0.3 + 0.1;
      const offset = Math.random() * Math.PI * 2;
      particleData.push({ speed, offset, orbitR });
      particlePositions[i * 3] = Math.cos(offset) * orbitR;
      particlePositions[i * 3 + 1] = 0;
      particlePositions[i * 3 + 2] = Math.sin(offset) * orbitR;
      const opacity = Math.random() * 0.6 + 0.2;
      particleColors[i * 3] = 0xD4 / 255 * opacity;
      particleColors[i * 3 + 1] = 0xAF / 255 * opacity;
      particleColors[i * 3 + 2] = 0x37 / 255 * opacity;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // Lighting
    const ambient = new THREE.AmbientLight(0x1a1520, 0.3);
    scene.add(ambient);
    const goldLight = new THREE.PointLight(0xD4AF37, 1.5, 100);
    goldLight.position.set(3, 3, 4);
    scene.add(goldLight);
    const blueLight = new THREE.PointLight(0x4488ff, 0.4, 100);
    blueLight.position.set(-4, -2, -3);
    scene.add(blueLight);

    // Mouse parallax
    const targetRot = { x: 0, y: 0 };
    const currentRot = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      targetRot.y = (e.clientX / window.innerWidth - 0.5) * 0.24;
      targetRot.x = (e.clientY / window.innerHeight - 0.5) * 0.3;
    };
    window.addEventListener('mousemove', onMouseMove);

    const lerp = (a: number, b: number, n: number) => a + (b - a) * n;

    const clock = new THREE.Clock();
    let rafId: number;

    const animate = () => {
      const time = clock.getElapsedTime();
      const breathScale = 1 + Math.sin(time * 0.6) * 0.04;
      const baseScale = Math.max(0.05, scaleRef.current / 100);
      const finalScale = baseScale * breathScale;

      orbGroup.scale.setScalar(finalScale);
      orbMat.emissiveIntensity = 0.08 + Math.sin(time * 0.6) * 0.06;

      currentRot.x = lerp(currentRot.x, targetRot.x, 0.03);
      currentRot.y = lerp(currentRot.y, targetRot.y, 0.03);
      orbGroup.rotation.x = currentRot.x;
      orbGroup.rotation.y = currentRot.y;

      // Update particle positions in-place
      const posAttr = particleGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const p = particleData[i];
        posAttr.setXYZ(
          i,
          Math.cos(time * p.speed + p.offset) * p.orbitR,
          Math.sin(time * 0.3 + p.offset) * 0.1,
          Math.sin(time * p.speed + p.offset) * p.orbitR
        );
      }
      posAttr.needsUpdate = true;
      particles.rotation.y = time * 0.05;

      renderer.render(scene, camera);
      rafId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      mount.removeChild(renderer.domElement);
      orbGeo.dispose();
      orbMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100%', height: '100%', minHeight: 400 }} />;
}

function CSSOrb({ percentageRemaining }: { percentageRemaining: number }) {
  const scale = Math.max(0.15, percentageRemaining / 100);
  return (
    <div style={{ width: '100%', height: '100%', minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div
        style={{
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 35%, rgba(212,175,55,0.4), rgba(10,8,32,0.9) 70%)',
          boxShadow: '0 0 60px rgba(212,175,55,0.2), inset 0 0 40px rgba(212,175,55,0.1)',
          transform: `scale(${scale})`,
          animation: 'breathe 4s ease-in-out infinite',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 280,
            height: 280,
            borderRadius: '50%',
            border: '1px solid rgba(212,175,55,0.15)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      </div>
    </div>
  );
}

export default function HeroOrb() {
  const { stats } = useChronos();
  const barRef = useRef<HTMLDivElement>(null);
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

  useEffect(() => {
    if (!barRef.current || !stats) return;
    gsap.fromTo(
      barRef.current,
      { width: '0%' },
      { width: `${Math.min(stats.percentageLived, 100)}%`, duration: 2, ease: 'power2.out' }
    );
    // Only animate once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!stats) return null;

  return (
    <section
      id="hero-orb"
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        display: 'flex',
        alignItems: 'center',
        padding: '80px 6vw 40px',
        position: 'relative',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '45% 55%',
          gap: '2rem',
          width: '100%',
          alignItems: 'center',
        }}
      >
        <motion.div
          style={{ zIndex: 2 }}
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.15, delayChildren: 0.3 } } }}
        >
          <motion.div
            style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', letterSpacing: '0.25em', marginBottom: '1rem' }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            YOU HAVE LIVED
          </motion.div>

          <motion.div
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'var(--gold)', lineHeight: 1 }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            {stats.daysLived.toLocaleString()}
          </motion.div>

          <motion.div
            style={{ fontFamily: 'var(--font-head)', fontStyle: 'italic', fontWeight: 300, fontSize: 24, color: 'var(--text2)', marginBottom: '1.5rem' }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            days
          </motion.div>

          <motion.div
            style={{ fontFamily: 'var(--font-mono)', fontWeight: 400, fontSize: 18, color: 'var(--text3)', marginBottom: '2rem' }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            {stats.secondsLived.toLocaleString()} seconds
          </motion.div>

          <motion.div
            style={{ marginBottom: '2rem' }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)', letterSpacing: '0.15em' }}>
                LIFE ELAPSED
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--gold)' }}>
                {stats.percentageLived.toFixed(3)}%
              </span>
            </div>
            <div style={{ maxWidth: 400, height: 2, background: 'var(--border)', position: 'relative' }}>
              <div
                ref={barRef}
                style={{
                  height: '100%',
                  background: 'linear-gradient(to right, var(--gold), var(--gold2))',
                  width: `${Math.min(stats.percentageLived, 100)}%`,
                }}
              />
            </div>
          </motion.div>

          <motion.div
            style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>
              ♡ {stats.heartbeats.toLocaleString()} heartbeats
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text3)' }}>
              ◎ {stats.daysRemaining.toLocaleString()} days ahead
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          style={{ width: '100%', height: isMobile ? 300 : '70vh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {isMobile ? (
            <CSSOrb percentageRemaining={stats.percentageRemaining} />
          ) : (
            <BreathingOrb percentageRemaining={stats.percentageRemaining} />
          )}
        </motion.div>
      </div>

      <motion.div
        style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text3)' }}>
          scroll to explore your life
        </span>
        <div style={{ animation: 'scrollHint 2s ease-in-out infinite', color: 'var(--gold)' }}>
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
