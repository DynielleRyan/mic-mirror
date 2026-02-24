import { useState, useEffect, useCallback } from 'react';

export interface MediaDevice {
  deviceId: string;
  kind: 'audioinput' | 'audiooutput' | 'videoinput';
  label: string;
  groupId: string;
}

export function useMediaDevices() {
  const [devices, setDevices] = useState<MediaDevice[]>([]);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [error, setError] = useState<string | null>(null);

  const refreshDevices = useCallback(async () => {
    try {
      setError(null);
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const deviceList: MediaDevice[] = mediaDevices
        .filter((d) => d.kind === 'audioinput' || d.kind === 'audiooutput' || d.kind === 'videoinput')
        .map((d) => ({
          deviceId: d.deviceId,
          kind: d.kind as 'audioinput' | 'audiooutput' | 'videoinput',
          label: d.label || `${d.kind} ${d.deviceId.slice(0, 8)}`,
          groupId: d.groupId,
        }));
      setDevices(deviceList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enumerate devices');
      setDevices([]);
    }
  }, []);

  useEffect(() => {
    refreshDevices();

    const handleChange = () => {
      refreshDevices();
    };

    navigator.mediaDevices.addEventListener('devicechange', handleChange);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handleChange);
  }, [refreshDevices]);

  const requestPermissions = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      stream.getTracks().forEach((t) => t.stop());
      setPermissionState('granted');
      await refreshDevices();
    } catch (err) {
      setPermissionState('denied');
      setError(err instanceof Error ? err.message : 'Permission denied');
    }
  }, [refreshDevices]);

  const audioInputs = devices.filter((d) => d.kind === 'audioinput');
  const audioOutputs = devices.filter((d) => d.kind === 'audiooutput');
  const videoInputs = devices.filter((d) => d.kind === 'videoinput');

  return {
    devices,
    audioInputs,
    audioOutputs,
    videoInputs,
    permissionState,
    error,
    refreshDevices,
    requestPermissions,
  };
}
