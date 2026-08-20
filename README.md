# CHRONOS

**Your life, visualized in real time.**

Enter your date of birth and watch your entire life transform into a living visualization — past, present, and future. Every second updates in real time. Deeply personal, mathematically accurate, and visually stunning.

## Features

- **Real-time life stats** — heartbeats, breaths, steps, meals, words spoken, dreams, sunrises — all updating every second
- **3D breathing orb** — a Three.js sphere that shrinks as your life progresses, with orbiting particle rings and mouse parallax
- **Life in Weeks grid** — all 4,160 weeks of an 80-year life rendered as color-coded dots, with hover tooltips revealing evocative messages for each week
- **Life Chapters** — six chapter cards (Childhood → Legacy) with a progress arc showing exactly where you are in your story
- **Life in Numbers** — eight dramatic statistic cards with live-updating figures
- **Goal Calculator** — interactive cards that show how long your goals will take based on daily time investment
- **Final Sentence** — a shareable verdict on your life so far, exportable as a PNG image
- **Custom cursor** — gold ring + dot with lerp-based smooth following
- **Film grain overlay** — subtle animated noise for a cinematic feel
- **localStorage persistence** — returning users skip the entry screen and go directly to their dashboard
- **Fully responsive** — Three.js orb on desktop, CSS breathing animation on mobile

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — build tool and dev server
- **Three.js** — 3D breathing orb
- **GSAP** + **ScrollTrigger** — scroll animations
- **Framer Motion** — entry/exit transitions and stagger animations
- **Lenis** — smooth scrolling
- **html2canvas** — share card image generation
- **lucide-react** — icons
- **Tailwind CSS** — utility classes

## Running Locally

```bash
npm install
npm run dev
```

Open the URL shown in your terminal (typically `http://localhost:5173`).

## Building for Production

```bash
npm run build
```

This generates a `dist/` folder with all static assets, ready to deploy.

## Deploying to Vercel

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repository
3. Vercel auto-detects Vite — no configuration needed
4. Click Deploy

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Architecture

- **Zero backend** — all calculations run client-side in `src/utils/lifeCalc.ts`
- **No API keys** — no external services required
- **Single timer** — one `setInterval` in `ChronosContext` updates all live stats every second
- **Performance** — Three.js geometries/materials disposed on unmount, all `requestAnimationFrame` loops cancelled, GSAP contexts reverted

## Privacy

Your date of birth never leaves your device. It is stored only in your browser's `localStorage` and used for client-side calculations. No data is sent to any server.
