import { useState, useRef, useCallback } from 'react';

export function useMediaRecorder(stream: MediaStream | null) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(() => {
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setError('No audio track available');
      return;
    }
    setError(null);
    setRecordedBlob(null);
    chunksRef.current = [];

    try {
      const audioOnlyStream = new MediaStream(audioTracks);
      const mimeTypes = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg'];
      const mimeType = mimeTypes.find((m) => MediaRecorder.isTypeSupported(m));
      const options = mimeType ? { mimeType } : {};

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(audioOnlyStream, options);
      } catch {
        recorder = new MediaRecorder(audioOnlyStream);
      }

      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const active = mediaRecorderRef.current;
        const type = chunksRef.current.length > 0 && active ? active.mimeType : 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        setRecordedBlob(blob);
        setIsRecording(false);
      };

      recorder.onerror = () => {
        setError('Recording failed');
        setIsRecording(false);
      };

      try {
        recorder.start(1000);
      } catch {
        if (options && Object.keys(options).length > 0) {
          const fallbackRecorder = new MediaRecorder(audioOnlyStream);
          fallbackRecorder.ondataavailable = recorder.ondataavailable;
          fallbackRecorder.onstop = recorder.onstop;
          fallbackRecorder.onerror = recorder.onerror;
          mediaRecorderRef.current = fallbackRecorder;
          fallbackRecorder.start(1000);
        } else {
          throw new Error('Recording not supported');
        }
      }
      setIsRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  }, [stream]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const downloadRecording = useCallback(() => {
    if (!recordedBlob) return;
    const ext = recordedBlob.type.includes('mp4') ? 'mp4' : 'webm';
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [recordedBlob]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    chunksRef.current = [];
  }, []);

  const playRecording = useCallback(
    async (outputDeviceId?: string) => {
      if (!recordedBlob) return;
      const audio = new Audio(URL.createObjectURL(recordedBlob));
      if (outputDeviceId && 'setSinkId' in HTMLMediaElement.prototype) {
        try {
          await (audio as HTMLAudioElement & { setSinkId: (id: string) => Promise<void> }).setSinkId(outputDeviceId);
        } catch {}
      }
      audio.play();
      audio.onended = () => URL.revokeObjectURL(audio.src);
    },
    [recordedBlob]
  );

  return {
    isRecording,
    recordedBlob,
    error,
    startRecording,
    stopRecording,
    downloadRecording,
    playRecording,
    clearRecording,
  };
}
