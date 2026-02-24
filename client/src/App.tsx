import { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Video, VideoOff, MicOff, Download, Trash2, Radio, Volume2, VolumeX, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { DeviceSelector } from '@/components/DeviceSelector';
import { CameraPreview } from '@/components/CameraPreview';
import { AudioWaveform } from '@/components/AudioWaveform';
import { useMediaDevices } from '@/hooks/useMediaDevices';
import { useMediaRecorder } from '@/hooks/useMediaRecorder';
import { useAudioMonitor } from '@/hooks/useAudioMonitor';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';

function App() {
  const [audioDeviceId, setAudioDeviceId] = useState<string>('');
  const [outputDeviceId, setOutputDeviceId] = useState<string>('');
  const [videoDeviceId, setVideoDeviceId] = useState<string>('');
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const audioDeviceIdRef = useRef(audioDeviceId);
  const videoDeviceIdRef = useRef(videoDeviceId);
  audioStreamRef.current = audioStream;
  videoStreamRef.current = videoStream;
  audioDeviceIdRef.current = audioDeviceId;
  videoDeviceIdRef.current = videoDeviceId;

  const {
    audioInputs,
    audioOutputs,
    videoInputs,
    permissionState,
    error: devicesError,
    requestPermissions,
    refreshDevices,
  } = useMediaDevices();

  const { isRecording, recordedBlob, error: recordingError, startRecording, stopRecording, downloadRecording, playRecording, clearRecording } =
    useMediaRecorder(audioStream);
  const { isMonitoring, toggleMonitoring } = useAudioMonitor(audioStream, outputDeviceId);

  const startStreams = useCallback(async () => {
    const audioId = audioDeviceIdRef.current;
    const videoId = videoDeviceIdRef.current;
    setStreamError(null);
    try {
      const needsAudio = audioInputs.length > 0;
      const needsVideo = cameraEnabled && videoInputs.length > 0;

      if (needsAudio && needsVideo) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioId ? { deviceId: { exact: audioId } } : true,
          video: videoId ? { deviceId: { exact: videoId } } : true,
        });
        setAudioStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return stream;
        });
        setVideoStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return stream;
        });
      } else if (needsAudio) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audioId ? { deviceId: { exact: audioId } } : true,
        });
        setAudioStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return stream;
        });
        setVideoStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return null;
        });
      } else if (needsVideo) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: videoId ? { deviceId: { exact: videoId } } : true,
        });
        setAudioStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return null;
        });
        setVideoStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return stream;
        });
      } else {
        setAudioStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return null;
        });
        setVideoStream((prev) => {
          prev?.getTracks().forEach((t) => t.stop());
          return null;
        });
      }
    } catch (err) {
      setStreamError(err instanceof Error ? err.message : 'Failed to access media');
    }
  }, [cameraEnabled, audioInputs.length, videoInputs.length]);

  const stopStreams = useCallback(() => {
    audioStreamRef.current?.getTracks().forEach((t) => t.stop());
    videoStreamRef.current?.getTracks().forEach((t) => t.stop());
    audioStreamRef.current = null;
    videoStreamRef.current = null;
    setAudioStream(null);
    setVideoStream(null);
  }, []);

  useEffect(() => {
    if (permissionState === 'granted' && (audioInputs.length > 0 || (cameraEnabled && videoInputs.length > 0))) {
      startStreams();
    } else {
      stopStreams();
    }
    return () => stopStreams();
  }, [permissionState, audioDeviceId, videoDeviceId, cameraEnabled, audioInputs.length, videoInputs.length, startStreams, stopStreams]);

  useEffect(() => {
    if (audioInputs.length > 0 && !audioDeviceId) setAudioDeviceId(audioInputs[0].deviceId);
    if (audioOutputs.length > 0 && !outputDeviceId) setOutputDeviceId(audioOutputs[0].deviceId);
    if (videoInputs.length > 0 && !videoDeviceId) setVideoDeviceId(videoInputs[0].deviceId);
  }, [audioInputs, audioOutputs, videoInputs, audioDeviceId, outputDeviceId, videoDeviceId]);

  const needsPermission = permissionState !== 'granted';
  const hasDevices = audioInputs.length > 0 || audioOutputs.length > 0 || videoInputs.length > 0;

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 sm:py-8">
        <header className="relative mb-6 sm:mb-8">
          <div className="pr-12 text-center sm:pr-0 sm:text-left">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mic Mirror</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Test your microphone and camera
            </p>
          </div>
          <div className="absolute right-0 top-0">
            <ThemeToggle />
          </div>
        </header>

        {needsPermission && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Permission required</CardTitle>
              <CardDescription>
                Allow access to your microphone and camera to detect devices and test them.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={requestPermissions} className="w-full">
                Allow access
              </Button>
              {devicesError && (
                <p className="mt-2 text-sm text-destructive">{devicesError}</p>
              )}
            </CardContent>
          </Card>
        )}

        {permissionState === 'granted' && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mic className="h-4 w-4" />
                  Microphone
                </CardTitle>
                <CardDescription>Select and test your microphone</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <DeviceSelector
                  devices={audioInputs}
                  value={audioDeviceId}
                  onChange={setAudioDeviceId}
                  placeholder="Select microphone"
                  disabled={audioInputs.length === 0}
                />
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-muted-foreground">
                    Output (speakers / headphones)
                  </label>
                  <DeviceSelector
                    devices={audioOutputs}
                    value={outputDeviceId}
                    onChange={setOutputDeviceId}
                    placeholder="Select output device"
                    disabled={audioOutputs.length === 0}
                  />
                </div>
                {audioStream && (
                  <>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-500" />
                        <span className="text-sm text-muted-foreground">Microphone active</span>
                      </div>
                      <Button
                        variant={isMonitoring ? 'default' : 'outline'}
                        size="sm"
                        onClick={toggleMonitoring}
                      >
                        {isMonitoring ? (
                          <Volume2 className="mr-1.5 h-3.5 w-3.5" />
                        ) : (
                          <VolumeX className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        {isMonitoring ? 'Listening' : 'Hear yourself'}
                      </Button>
                    </div>
                    <AudioWaveform stream={audioStream} className="h-16" />
                  </>
                )}
                {streamError && (
                  <p className="text-sm text-destructive">{streamError}</p>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Video className="h-4 w-4" />
                  Camera
                </CardTitle>
                <CardDescription>Turn on to see yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Enable camera</span>
                  <Switch
                    checked={cameraEnabled}
                    onCheckedChange={setCameraEnabled}
                    disabled={videoInputs.length === 0}
                  />
                </div>
                {cameraEnabled && (
                  <DeviceSelector
                    devices={videoInputs}
                    value={videoDeviceId}
                    onChange={setVideoDeviceId}
                    placeholder="Select camera"
                    disabled={videoInputs.length === 0}
                  />
                )}
                {cameraEnabled && videoStream && (
                  <CameraPreview
                    stream={videoStream}
                    className="aspect-video w-full"
                  />
                )}
                {cameraEnabled && !videoStream && !streamError && (
                  <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                    <VideoOff className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Radio className="h-4 w-4" />
                  Record audio
                </CardTitle>
                <CardDescription>Record and download a short clip</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {audioStream ? (
                  <div className="space-y-4">
                    <AudioWaveform stream={audioStream} className="h-16" />
                    <div className="flex flex-wrap gap-2">
                      {!isRecording ? (
                        <Button onClick={startRecording} variant="default">
                          <Mic className="mr-2 h-4 w-4" />
                          Start recording
                        </Button>
                      ) : (
                        <Button onClick={stopRecording} variant="destructive">
                          <MicOff className="mr-2 h-4 w-4" />
                          Stop recording
                        </Button>
                      )}
                      {recordedBlob && (
                        <>
                          <Button onClick={() => playRecording(outputDeviceId)} variant="outline">
                            <Play className="mr-2 h-4 w-4" />
                            Play
                          </Button>
                          <Button onClick={downloadRecording} variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          <Button onClick={clearRecording} variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                    {recordingError && (
                      <p className="w-full text-sm text-destructive">{recordingError}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Enable microphone access above to record.
                  </p>
                )}
              </CardContent>
            </Card>

            {!hasDevices && permissionState === 'granted' && (
              <Card className="border-muted">
                <CardContent className="py-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    No input devices found. Connect a microphone or camera and{' '}
                    <button
                      onClick={refreshDevices}
                      className="text-primary underline underline-offset-2"
                    >
                      refresh
                    </button>
                    .
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default App;
