export interface AvailableVideoDevice {
  deviceId: string;
  label: string;
  facing: 'environment' | 'user' | 'unknown';
}

class CameraStreamManager {
  private activeStreams: Map<string, MediaStream> = new Map();
  private frameBroadcasters: Map<string, number> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private onFrameCallbacks: Map<string, Set<(frameData: string) => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('agni_camera_frames_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'FRAME_UPDATE') {
            const { cameraId, frameData } = event.data;
            const cbs = this.onFrameCallbacks.get(cameraId);
            if (cbs) {
              cbs.forEach((cb) => cb(frameData));
            }
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel error in CameraStreamManager:', e);
      }
    }
  }

  // Enumerate all physical phone camera lenses (Back Wide, Ultra-wide, Telephoto, Front)
  public async getAvailableMobileCameras(): Promise<AvailableVideoDevice[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      return [];
    }

    try {
      // Must prompt or have existing permission to see actual labels
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');

      return videoDevices.map((device, index) => {
        const label = device.label || `Mobile Camera ${index + 1}`;
        const lower = label.toLowerCase();
        let facing: 'environment' | 'user' | 'unknown' = 'unknown';

        if (lower.includes('back') || lower.includes('rear') || lower.includes('environment')) {
          facing = 'environment';
        } else if (lower.includes('front') || lower.includes('selfie') || lower.includes('user')) {
          facing = 'user';
        } else {
          facing = index === 0 ? 'environment' : 'user';
        }

        return {
          deviceId: device.deviceId,
          label,
          facing,
        };
      });
    } catch (err) {
      console.warn('Failed to enumerate mobile cameras:', err);
      return [];
    }
  }

  // Start mobile camera for a specific camera channel (e.g. cam-1, cam-2, etc.)
  public async startMobileCamera(
    cameraId: string,
    options?: {
      deviceId?: string;
      facingMode?: 'environment' | 'user';
      resolution?: '1080p' | '720p';
      fps?: number;
    }
  ): Promise<MediaStream> {
    // Stop any existing stream for this camera
    this.stopCameraStream(cameraId);

    const facing = options?.facingMode || 'environment';
    const is1080p = options?.resolution !== '720p';

    const constraints: MediaStreamConstraints = {
      audio: false,
      video: options?.deviceId
        ? {
            deviceId: { exact: options.deviceId },
            width: { ideal: is1080p ? 1920 : 1280 },
            height: { ideal: is1080p ? 1080 : 720 },
            frameRate: { ideal: options?.fps || 30 },
          }
        : {
            facingMode: { ideal: facing },
            width: { ideal: is1080p ? 1920 : 1280 },
            height: { ideal: is1080p ? 1080 : 720 },
            frameRate: { ideal: options?.fps || 30 },
          },
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    this.activeStreams.set(cameraId, stream);

    // Start background frame sync so other tabs or the viewer see this phone stream in real time
    this.startFrameBroadcasting(cameraId, stream);

    return stream;
  }

  public getActiveStream(cameraId: string): MediaStream | undefined {
    return this.activeStreams.get(cameraId);
  }

  public hasActiveStream(cameraId: string): boolean {
    return this.activeStreams.has(cameraId);
  }

  public stopCameraStream(cameraId: string) {
    const stream = this.activeStreams.get(cameraId);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      this.activeStreams.delete(cameraId);
    }

    const intervalId = this.frameBroadcasters.get(cameraId);
    if (intervalId) {
      clearInterval(intervalId);
      this.frameBroadcasters.delete(cameraId);
    }
  }

  public stopAllStreams() {
    this.activeStreams.forEach((stream) => {
      stream.getTracks().forEach((track) => track.stop());
    });
    this.activeStreams.clear();

    this.frameBroadcasters.forEach((id) => clearInterval(id));
    this.frameBroadcasters.clear();
  }

  // Toggle mobile flashlight / torch if supported by hardware
  public async toggleTorch(cameraId: string, enabled: boolean): Promise<boolean> {
    const stream = this.activeStreams.get(cameraId);
    if (!stream) return false;

    const track = stream.getVideoTracks()[0];
    if (!track) return false;

    try {
      const capabilities = (track.getCapabilities?.() || {}) as { torch?: boolean };
      if (capabilities.torch) {
        await (track as any).applyConstraints({
          advanced: [{ torch: enabled }],
        });
        return true;
      }
    } catch (e) {
      console.warn('Torch not supported or error:', e);
    }
    return false;
  }

  // Toggle digital zoom on phone camera
  public async setZoom(cameraId: string, zoomFactor: number): Promise<boolean> {
    const stream = this.activeStreams.get(cameraId);
    if (!stream) return false;

    const track = stream.getVideoTracks()[0];
    if (!track) return false;

    try {
      const capabilities = (track.getCapabilities?.() || {}) as { zoom?: { min: number; max: number } };
      if (capabilities.zoom) {
        const clamped = Math.max(capabilities.zoom.min, Math.min(capabilities.zoom.max, zoomFactor));
        await (track as any).applyConstraints({
          advanced: [{ zoom: clamped }],
        });
        return true;
      }
    } catch (e) {
      console.warn('Zoom adjustment error:', e);
    }
    return false;
  }

  // Listen to remote frames broadcasted from another phone tab
  public onRemoteFrame(cameraId: string, callback: (frameData: string) => void): () => void {
    if (!this.onFrameCallbacks.has(cameraId)) {
      this.onFrameCallbacks.set(cameraId, new Set());
    }
    this.onFrameCallbacks.get(cameraId)!.add(callback);

    return () => {
      this.onFrameCallbacks.get(cameraId)?.delete(callback);
    };
  }

  // Broadcast captured frame across tabs so control room and viewers see real-time phone feed
  private startFrameBroadcasting(cameraId: string, stream: MediaStream) {
    if (typeof document === 'undefined') return;

    const video = document.createElement('video');
    video.srcObject = stream;
    video.muted = true;
    video.playsInline = true;
    video.play().catch(() => {});

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 270;
    const ctx = canvas.getContext('2d');

    const intervalId = window.setInterval(() => {
      if (!ctx || video.readyState < 2) return;
      try {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.55);

        // Notify local callbacks
        const cbs = this.onFrameCallbacks.get(cameraId);
        if (cbs) {
          cbs.forEach((cb) => cb(dataUrl));
        }

        // Notify cross-tab BroadcastChannel
        if (this.broadcastChannel) {
          this.broadcastChannel.postMessage({
            type: 'FRAME_UPDATE',
            cameraId,
            frameData: dataUrl,
          });
        }
      } catch {
        // Frame capture skipped
      }
    }, 120); // ~8 FPS thumbnail sync across tabs, full 30-60 FPS local

    this.frameBroadcasters.set(cameraId, intervalId);
  }
}

export const cameraStreamManager = new CameraStreamManager();
