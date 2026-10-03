import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Maximize2,
  Minimize2,
  Video,
  Radio,
  Battery,
  Sliders,
  ArrowLeft,
  Tv,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { cameraStreamManager, AvailableVideoDevice } from '../../services/cameraStreamManager';

interface MobileCameraBroadcasterProps {
  initialCameraId?: string;
  onExit: () => void;
}

export const MobileCameraBroadcaster: React.FC<MobileCameraBroadcasterProps> = ({
  initialCameraId = 'cam-1',
  onExit,
}) => {
  const { cameras, activeCameraId, setActiveCameraId, updateCameraStatus } = useCricket();

  const [selectedCamId, setSelectedCamId] = useState<string>(initialCameraId);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableDevices, setAvailableDevices] = useState<AvailableVideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [showPitchGrid, setShowPitchGrid] = useState<boolean>(true);
  const [batteryPct, setBatteryPct] = useState<number | null>(null);
  const [liveFps, setLiveFps] = useState<number>(30);
  const [streamError, setStreamError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const currentCam = cameras.find((c) => c.id === selectedCamId) || cameras[0];

  // Check battery
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((bat: any) => {
        setBatteryPct(Math.round(bat.level * 100));
        bat.addEventListener('levelchange', () => {
          setBatteryPct(Math.round(bat.level * 100));
        });
      }).catch(() => {});
    }
  }, []);

  // Enumerate physical phone lenses
  useEffect(() => {
    cameraStreamManager.getAvailableMobileCameras().then((devs) => {
      setAvailableDevices(devs);
      if (devs.length > 0 && !selectedDeviceId) {
        // prefer environment/back camera by default
        const back = devs.find((d) => d.facing === 'environment') || devs[0];
        setSelectedDeviceId(back.deviceId);
      }
    });
  }, [selectedDeviceId]);

  // Start phone camera
  const startCamera = async (camId: string, deviceId?: string, facing?: 'environment' | 'user') => {
    setStreamError(null);
    try {
      const stream = await cameraStreamManager.startMobileCamera(camId, {
        deviceId,
        facingMode: facing || facingMode,
        fps: 30,
        resolution: '1080p',
      });

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setIsStreaming(true);
      updateCameraStatus(camId, {
        status: 'CONNECTED',
        isMobileStream: true,
        facingMode: facing || facingMode,
        latencyMs: 140,
        fps: 30,
        signalQuality: 'EXCELLENT',
      });
    } catch (err: any) {
      console.error('Failed to start mobile phone camera:', err);
      setStreamError(err.message || 'Camera permission denied or camera not accessible');
      setIsStreaming(false);
    }
  };

  // Auto-start on mount
  useEffect(() => {
    startCamera(selectedCamId, selectedDeviceId, facingMode);

    return () => {
      cameraStreamManager.stopCameraStream(selectedCamId);
    };
  }, [selectedCamId]);

  // Switch phone camera lens
  const handleToggleFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    await startCamera(selectedCamId, undefined, nextFacing);
  };

  // Toggle flash torch
  const handleToggleTorch = async () => {
    const nextState = !torchOn;
    const ok = await cameraStreamManager.toggleTorch(selectedCamId, nextState);
    if (ok) setTorchOn(nextState);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden select-none">
      {/* Top Mobile Broadcaster Status Header */}
      <div className="px-4 py-3 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-2">
          <button
            onClick={onExit}
            className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              <span className="font-black text-xs uppercase tracking-wider text-red-500">
                PHONE BROADCASTER
              </span>
            </div>
            <span className="text-[11px] font-bold text-white uppercase">
              {currentCam.name} · {currentCam.purpose}
            </span>
          </div>
        </div>

        {/* Battery & Telemetry */}
        <div className="flex items-center gap-2 text-xs font-mono-numbers">
          {batteryPct !== null && (
            <span className="flex items-center gap-1 text-zinc-300 bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-[11px]">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              {batteryPct}%
            </span>
          )}
          <span className="px-2 py-1 rounded bg-orange-600 font-bold text-[11px] text-white">
            1080p · {liveFps} FPS
          </span>
        </div>
      </div>

      {/* Main Viewfinder Video Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        <video
          ref={videoPreviewRef}
          autoPlay
          playsInline
          muted
          className={`h-full w-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
        />

        {/* Pitch Alignment Guide Overlay (Crosshairs & Crease guide lines) */}
        {showPitchGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-40">
            {/* Rule of thirds grid */}
            <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-white/60" />
            <div className="absolute inset-x-0 top-2/3 border-b border-dashed border-white/60" />
            <div className="absolute inset-y-0 left-1/3 border-r border-dashed border-white/60" />
            <div className="absolute inset-y-0 left-2/3 border-r border-dashed border-white/60" />

            {/* Pitch Center Target Box */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-28 w-44 border-2 border-orange-500 rounded-lg flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-orange-500" />
            </div>

            <div className="absolute bottom-6 inset-x-0 text-center text-[10px] text-orange-400 font-bold uppercase tracking-wider bg-black/50 py-1">
              ALIGN TRIPOD WITH PITCH CREASE & STUMPS
            </div>
          </div>
        )}

        {/* Error overlay if camera blocked */}
        {streamError && (
          <div className="absolute inset-4 m-auto max-w-sm h-fit p-4 rounded-xl bg-red-950/90 border border-red-500 text-center space-y-2 z-20">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
            <span className="font-bold text-sm text-white block">Camera Access Issue</span>
            <p className="text-xs text-red-200">{streamError}</p>
            <button
              onClick={() => startCamera(selectedCamId, selectedDeviceId, facingMode)}
              className="mt-2 px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
            >
              Retry Permission
            </button>
          </div>
        )}

        {/* Live on air watermark */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700 text-xs">
          <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span className="font-bold text-white uppercase tracking-wider">
            TRANSMITTING TO AGNI OTT
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar: Assign to Camera 1-6, Flip Lens, Torch, Grid */}
      <div className="p-4 bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800 space-y-3 z-30">
        {/* Assign phone to camera slot (1 to 6) */}
        <div>
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
            Broadcast As Camera Channel:
          </span>
          <div className="grid grid-cols-6 gap-1.5">
            {cameras.map((cam) => {
              const isSelected = cam.id === selectedCamId;
              return (
                <button
                  key={cam.id}
                  onClick={() => setSelectedCamId(cam.id)}
                  className={`py-2 px-1 rounded-lg text-center font-bold text-xs transition-colors flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-orange-600 text-white shadow ring-2 ring-orange-400'
                      : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                  }`}
                >
                  <span className="text-[11px] font-mono-numbers">CAM {cam.number}</span>
                  <span className="text-[9px] text-zinc-400 truncate max-w-[45px] hidden sm:inline">
                    {cam.purpose}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Physical Camera Controls */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-850">
          {/* Flip Front / Back camera */}
          <button
            onClick={handleToggleFacing}
            className="flex-1 py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <RefreshCw className="w-4 h-4 text-orange-400" />
            <span>{facingMode === 'environment' ? 'Back Lens' : 'Selfie Front'}</span>
          </button>

          {/* Torch Toggle */}
          <button
            onClick={handleToggleTorch}
            className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95 ${
              torchOn
                ? 'bg-amber-500 text-zinc-950 border-amber-400'
                : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
            }`}
            title="Torch Flashlight"
          >
            {torchOn ? <Zap className="w-4 h-4 fill-zinc-950" /> : <ZapOff className="w-4 h-4" />}
            <span className="hidden sm:inline">Torch</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowPitchGrid(!showPitchGrid)}
            className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
              showPitchGrid
                ? 'bg-orange-600/30 text-orange-400 border-orange-500/50'
                : 'bg-zinc-900 text-zinc-400 border-zinc-700'
            }`}
            title="Toggle Pitch Alignment Lines"
          >
            <Sliders className="w-4 h-4" />
            <span className="hidden sm:inline">Pitch Lines</span>
          </button>

          {/* Exit Broadcaster */}
          <button
            onClick={onExit}
            className="py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs border border-zinc-700 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};
