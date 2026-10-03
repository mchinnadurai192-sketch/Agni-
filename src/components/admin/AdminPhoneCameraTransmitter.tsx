import React, { useState, useEffect, useRef } from 'react';
import {
  Smartphone,
  Radio,
  Camera,
  RefreshCw,
  Zap,
  ZapOff,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Eye,
  Video,
  Power,
  ShieldCheck,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { cameraStreamManager, AvailableVideoDevice } from '../../services/cameraStreamManager';

export const AdminPhoneCameraTransmitter: React.FC = () => {
  const { cameras, updateCameraStatus, setActiveCameraId } = useCricket();

  const cam1 = cameras.find((c) => c.id === 'cam-1') || cameras[0];
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [showPitchGrid, setShowPitchGrid] = useState<boolean>(true);
  const [resolution, setResolution] = useState<'1080p' | '720p'>('1080p');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<AvailableVideoDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const liveVideoPreviewRef = useRef<HTMLVideoElement>(null);

  // Check if camera is currently streaming
  useEffect(() => {
    setIsBroadcasting(cameraStreamManager.hasActiveStream('cam-1'));
  }, []);

  // Enumerate devices
  useEffect(() => {
    cameraStreamManager.getAvailableMobileCameras().then((devs) => {
      setAvailableDevices(devs);
      if (devs.length > 0 && !selectedDeviceId) {
        const back = devs.find((d) => d.facing === 'environment') || devs[0];
        setSelectedDeviceId(back.deviceId);
      }
    });
  }, [selectedDeviceId]);

  // Start Broadcasting Phone Camera 1 to Viewers
  const handleStartBroadcast = async () => {
    setErrorMsg(null);
    try {
      const stream = await cameraStreamManager.startMobileCamera('cam-1', {
        deviceId: selectedDeviceId || undefined,
        facingMode,
        resolution,
        fps: 30,
      });

      if (liveVideoPreviewRef.current) {
        liveVideoPreviewRef.current.srcObject = stream;
      }

      setIsBroadcasting(true);
      updateCameraStatus('cam-1', {
        status: 'CONNECTED',
        isMobileStream: true,
        facingMode,
        resolution,
        fps: 30,
        signalQuality: 'EXCELLENT',
        latencyMs: 120,
      });

      // Switch program feed to Cam 1 so viewers immediately watch the live phone feed
      setActiveCameraId('cam-1');
    } catch (err: any) {
      console.error('Error starting phone camera broadcast:', err);
      setErrorMsg(
        err.message || 'Camera permission denied or camera device unavailable on this browser.'
      );
      setIsBroadcasting(false);
    }
  };

  // Stop Broadcasting
  const handleStopBroadcast = () => {
    cameraStreamManager.stopCameraStream('cam-1');
    setIsBroadcasting(false);
    if (liveVideoPreviewRef.current) {
      liveVideoPreviewRef.current.srcObject = null;
    }
    updateCameraStatus('cam-1', {
      isMobileStream: false,
      status: 'CONNECTED',
    });
  };

  // Flip Lens (Back vs Front)
  const handleFlipLens = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isBroadcasting) {
      await cameraStreamManager.startMobileCamera('cam-1', {
        facingMode: nextFacing,
        resolution,
        fps: 30,
      });
      const stream = cameraStreamManager.getActiveStream('cam-1');
      if (stream && liveVideoPreviewRef.current) {
        liveVideoPreviewRef.current.srcObject = stream;
      }
    }
  };

  // Toggle Torch
  const handleToggleTorch = async () => {
    const nextTorch = !torchOn;
    const success = await cameraStreamManager.toggleTorch('cam-1', nextTorch);
    if (success) {
      setTorchOn(nextTorch);
    }
  };

  return (
    <div className="rounded-xl bg-gradient-to-r from-orange-950/60 via-zinc-950 to-zinc-900 border-2 border-orange-500/60 p-4 sm:p-5 shadow-2xl space-y-4">
      {/* Top Banner: Admin Only Phone Camera 1 */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-lg shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded border border-orange-500/40">
                ADMIN ONLY
              </span>
              <h3 className="text-sm sm:text-base font-black font-display tracking-tight text-white uppercase">
                CAMERA PHONE 1 — LIVE VIDEO TRANSMITTER
              </h3>
            </div>
            <p className="text-xs text-zinc-300 mt-0.5">
              Transmit live video from this device/phone directly to all viewers on{' '}
              <strong className="text-orange-400">Camera 1 (Main Pitch)</strong>
            </p>
          </div>
        </div>

        {/* Live Broadcast Status Badge */}
        <div className="flex items-center gap-2">
          {isBroadcasting ? (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs uppercase shadow animate-pulse">
              <Radio className="w-3.5 h-3.5" />
              <span>LIVE TRANSMITTING TO VIEWERS</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 font-semibold text-xs border border-zinc-700">
              <Power className="w-3.5 h-3.5" />
              <span>Transmitter Ready</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Live Preview & Transmitter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Live Video Preview (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative aspect-video rounded-xl bg-black border border-zinc-800 overflow-hidden shadow-inner flex items-center justify-center">
            {isBroadcasting ? (
              <>
                <video
                  ref={liveVideoPreviewRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${
                    facingMode === 'user' ? '-scale-x-100' : ''
                  }`}
                />

                {/* Pitch alignment grid overlay */}
                {showPitchGrid && (
                  <div className="absolute inset-0 pointer-events-none opacity-40">
                    <div className="absolute inset-x-0 top-1/3 border-b border-dashed border-white/60" />
                    <div className="absolute inset-x-0 top-2/3 border-b border-dashed border-white/60" />
                    <div className="absolute inset-y-0 left-1/3 border-r border-dashed border-white/60" />
                    <div className="absolute inset-y-0 left-2/3 border-r border-dashed border-white/60" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-36 border-2 border-orange-500 rounded flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                    </div>
                  </div>
                )}

                {/* On Air Watermark */}
                <div className="absolute top-2.5 left-2.5 bg-red-600/90 text-white font-black text-[10px] px-2.5 py-1 rounded shadow flex items-center gap-1.5 uppercase">
                  <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                  <span>ON AIR · TRANSMITTING TO VIEWERS</span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-[10px] text-emerald-400 font-mono-numbers px-2 py-0.5 rounded border border-zinc-800">
                  30 FPS · {resolution} · 120ms latency
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400 space-y-2">
                <div className="h-12 w-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-400">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-bold text-sm text-zinc-200 block">
                    Phone Camera 1 Standby
                  </span>
                  <p className="text-xs text-zinc-400 max-w-sm mt-0.5">
                    Click "Start Phone Camera Broadcast" below to capture and send live video to
                    viewers in real-time.
                  </p>
                </div>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="mt-2 p-2.5 rounded-lg bg-red-950/80 border border-red-600/80 text-xs text-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Transmission Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {/* Primary Action Button */}
          {!isBroadcasting ? (
            <button
              onClick={handleStartBroadcast}
              className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Start Phone Camera 1 Broadcast</span>
            </button>
          ) : (
            <button
              onClick={handleStopBroadcast}
              className="w-full py-3.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Power className="w-4 h-4" />
              <span>Stop Phone Camera Broadcast</span>
            </button>
          )}

          {/* Quick Hardware Controls */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Flip Lens */}
            <button
              onClick={handleFlipLens}
              className="py-2.5 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-semibold flex items-center justify-center gap-1.5 transition-colors"
              title="Flip between Back and Front lenses"
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-400" />
              <span>{facingMode === 'environment' ? 'Back Lens' : 'Selfie Lens'}</span>
            </button>

            {/* Torch Toggle */}
            <button
              onClick={handleToggleTorch}
              className={`py-2.5 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                torchOn
                  ? 'bg-amber-500 text-zinc-950 border-amber-400'
                  : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
              }`}
            >
              {torchOn ? <Zap className="w-3.5 h-3.5 fill-zinc-950" /> : <ZapOff className="w-3.5 h-3.5" />}
              <span>{torchOn ? 'Torch ON' : 'Torch OFF'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Pitch Guidelines */}
            <button
              onClick={() => setShowPitchGrid(!showPitchGrid)}
              className={`py-2 px-3 rounded-lg border font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                showPitchGrid
                  ? 'bg-orange-950/60 text-orange-300 border-orange-500/50'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Pitch Grid</span>
            </button>

            {/* Resolution Selector */}
            <button
              onClick={() => setResolution(resolution === '1080p' ? '720p' : '1080p')}
              className="py-2 px-3 rounded-lg bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white font-mono font-bold flex items-center justify-center gap-1.5"
            >
              <Video className="w-3.5 h-3.5 text-orange-400" />
              <span>{resolution} HD</span>
            </button>
          </div>

          {/* Viewer Sync Notification */}
          <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              All connected viewers are strictly <strong className="text-zinc-200">watch only</strong>{' '}
              and receive this stream instantly!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
