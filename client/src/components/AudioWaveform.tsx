import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

// canvas fillStyle doesn't resolve CSS vars
function getCanvasColor(cssVar: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  try {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
    if (!value) return fallback;
    return `hsl(${value})`;
  } catch {
    return fallback;
  }
}

interface AudioWaveformProps {
  stream: MediaStream | null;
  className?: string;
  barCount?: number;
  active?: boolean;
}

export function AudioWaveform({ stream, className, barCount = 32, active = true }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    if (!stream || !active || stream.getAudioTracks().length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);

    source.connect(analyser);
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    analyser.minDecibels = -60;
    analyser.maxDecibels = -10;

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;
    sourceRef.current = source;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    window.addEventListener('resize', resize);

    const draw = () => {
      if (!analyserRef.current || !canvasRef.current) return;
      const analyserNode = analyserRef.current;
      const c = canvasRef.current;
      const rect = c.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      animationRef.current = requestAnimationFrame(draw);

      analyserNode.getByteFrequencyData(dataArray);

      const bgColor = getCanvasColor('--background', 'hsl(222 47% 6%)');
      const primaryColor = getCanvasColor('--primary', 'hsl(199 89% 48%)');

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, width, height);

      const barWidth = width / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[dataIndex] ?? 0;
        const barHeight = (value / 255) * height * 0.8;

        const x = i * barWidth + gap / 2;
        const y = height - barHeight;

        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, primaryColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, barWidth - gap, barHeight);
      }
    };

    if (audioContext.state === 'suspended') {
      audioContext.resume().then(draw);
    } else {
      draw();
    }

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      source.disconnect();
      audioContext.close();
      audioContextRef.current = null;
      analyserRef.current = null;
      sourceRef.current = null;
    };
  }, [stream, active, barCount]);

  if (!stream || !active) return null;

  return (
    <div className={cn('overflow-hidden rounded-lg bg-muted/50', className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ width: '100%', height: '64px', display: 'block' }}
      />
    </div>
  );
}
