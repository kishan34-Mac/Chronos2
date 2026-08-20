interface WaveDividerProps {
  fill?: string;
  flip?: boolean;
}

export default function WaveDivider({ fill = 'var(--bg2)', flip = false }: WaveDividerProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        lineHeight: 0,
        transform: flip ? 'rotate(180deg)' : 'none',
      }}
    >
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        style={{ width: '100%', height: 60, display: 'block' }}
      >
        <path
          d="M0,30 C240,60 480,0 720,20 C960,40 1200,60 1440,30 L1440,60 L0,60 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
