import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CameraPreviewProps {
  stream: MediaStream | null;
  muted?: boolean;
  mirrored?: boolean;
  className?: string;
}

export function CameraPreview({ stream, muted = true, mirrored = true, className }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !stream) return;
    const videoTracks = stream.getVideoTracks();
    if (videoTracks.length === 0) return;
    const allEnded = videoTracks.every((t) => t.readyState === 'ended');
    if (allEnded) return;
    try {
      video.srcObject = stream;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } catch {}
    return () => {
      try {
        video.srcObject = null;
      } catch {}
    };
  }, [stream]);

  if (!stream) return null;

  return (
    <div className={cn('relative overflow-hidden rounded-lg bg-black', className)}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={cn(
          'h-full w-full object-cover',
          mirrored && 'scale-x-[-1]'
        )}
      />
    </div>
  );
}
