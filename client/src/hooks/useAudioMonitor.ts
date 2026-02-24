import { useCallback, useRef, useEffect, useState } from 'react';

export function useAudioMonitor(stream: MediaStream | null, outputDeviceId?: string) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const stopMonitoring = useCallback(() => {
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    audioContextRef.current?.close();
    audioContextRef.current = null;
    setIsMonitoring(false);
  }, []);

  const startMonitoring = useCallback(async () => {
    if (!stream || stream.getAudioTracks().length === 0) return false;
    try {
      const ctx = new AudioContext();
      if (outputDeviceId && 'setSinkId' in ctx) {
        try {
          await (ctx as AudioContext & { setSinkId: (id: string) => Promise<void> }).setSinkId(outputDeviceId);
        } catch {}
      }
      const source = ctx.createMediaStreamSource(stream);
      source.connect(ctx.destination);
      audioContextRef.current = ctx;
      sourceRef.current = source;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      setIsMonitoring(true);
      return true;
    } catch {
      return false;
    }
  }, [stream, outputDeviceId]);

  const toggleMonitoring = useCallback(async () => {
    if (isMonitoring) {
      stopMonitoring();
    } else {
      await startMonitoring();
    }
  }, [isMonitoring, startMonitoring, stopMonitoring]);

  useEffect(() => {
    return () => stopMonitoring();
  }, [stopMonitoring]);

  useEffect(() => {
    if (!stream) stopMonitoring();
  }, [stream, stopMonitoring]);

  return { isMonitoring, startMonitoring, stopMonitoring, toggleMonitoring };
}
