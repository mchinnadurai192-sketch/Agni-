import React, { useRef, useState, useEffect } from 'react';
import { Camera, Maximize, Volume2, VolumeX, ShieldAlert, Sparkles, Radio, Eye } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { cameraStreamManager } from '../../services/cameraStreamManager';

export const LiveVideoPlayer: React.FC = () => {
  const {
    cameras,
    activeCameraId,
    setActiveCameraId,
    reviewState,
    match,
    isAudioMuted,
    setIsAudioMuted,
  } = useCricket();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeStreamVideoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [remoteFrame, setRemoteFrame] = useState<string | null>(null);

  const activeCam = cameras.find((c) => c.id === activeCameraId) || cameras[0];
  const lastBall = match.currentOverBalls[match.currentOverBalls.length - 1];

  // Check if camera has local active MediaStream from admin phone camera
  const activeLocalStream = cameraStreamManager.getActiveStream(activeCam.id);

  useEffect(() => {
    if (activeStreamVideoRef.current && activeLocalStream) {
      activeStreamVideoRef.current.srcObject = activeLocalStream;
    }
  }, [activeLocalStream, activeCam.id]);

  // Listen to remote frame updates sent across tabs or devices via BroadcastChannel
  useEffect(() => {
    setRemoteFrame(null);
    const unsubscribe = cameraStreamManager.onRemoteFrame(activeCam.id, (frameData) => {
      setRemoteFrame(frameData);
    });
    return () => {
      unsubscribe();
    };
  }, [activeCam.id]);

  // Handle Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const isLiveAdminPhoneStream =
    (activeCam.id === 'cam-1' || activeCam.isMobileStream) &&
    (!!activeLocalStream || !!remoteFrame || !!activeCam.streamFrameBase64);

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl group select-none"
    >
      {/* Video Content: Live Admin Phone Stream or Simulated Broadcast Feed */}
      {activeLocalStream ? (
        <video
          ref={activeStreamVideoRef}
          autoPlay
          playsInline
          muted
          className="h-full w-full object-cover"
        />
      ) : remoteFrame || activeCam.streamFrameBase64 ? (
        <div className="relative h-full w-full">
          <img
            src={remoteFrame || activeCam.streamFrameBase64}
            alt={activeCam.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="relative h-full w-full overflow-hidden">
          <img
            src={activeCam.streamUrl}
            alt={activeCam.name}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
          />
          {/* Subtle atmospheric stadium scanline overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/60 pointer-events-none" />

          {/* Animated ball trajectory line when tracking */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none opacity-40">
            <path
              d="M 120 400 Q 380 280 620 340 T 880 290"
              fill="none"
              stroke="#ea580c"
              strokeWidth="2.5"
              strokeDasharray="6 6"
              className="animate-pulse"
            />
          </svg>
        </div>
      )}

      {/* Top Left: Broadcast Header Watermark */}
      <div className="absolute top-4 left-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/90 backdrop-blur-md border border-zinc-700/60 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
          </span>
          <span className="text-xs font-bold tracking-wider text-red-500 uppercase">LIVE</span>
          <span className="text-zinc-600">|</span>
          <span className="text-xs font-semibold text-zinc-200 tracking-wide uppercase font-display">
            THAMIYANUR AGNI OTT
          </span>
        </div>

        {/* Live Admin Phone Camera Active Badge */}
        {isLiveAdminPhoneStream && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-orange-600/95 text-white font-bold text-xs uppercase shadow-xl animate-pulse border border-orange-400">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE FEED FROM ADMIN PHONE CAMERA 1</span>
          </div>
        )}
      </div>

      {/* Top Right: Watch Only Indicator, Speed Bug & Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        {/* Watch Only Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-zinc-900/90 backdrop-blur-md border border-zinc-700 text-[11px] font-semibold text-zinc-300 shadow">
          <Eye className="w-3.5 h-3.5 text-orange-400" />
          <span className="hidden sm:inline">WATCH ONLY</span>
        </div>

        {/* AI Ball Speed Bug */}
        {lastBall?.aiAnalysis && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-900/90 backdrop-blur-md border border-orange-500/40 text-xs shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-zinc-400 uppercase text-[10px] tracking-wider">Speed:</span>
            <span className="font-mono-numbers font-bold text-orange-400 text-sm">
              {lastBall.aiAnalysis.speedKmh}{' '}
              <span className="text-[10px] font-normal text-zinc-400">km/h</span>
            </span>
          </div>
        )}

        {/* Audio Mute / Unmute */}
        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="p-2 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors backdrop-blur-md"
          title={isAudioMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isAudioMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-zinc-200" />
          )}
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-md bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700/60 transition-colors backdrop-blur-md"
          title="Fullscreen"
        >
          <Maximize className="w-4 h-4 text-zinc-200" />
        </button>
      </div>

      {/* Review Active Banner Overlay */}
      {reviewState.isActive && (
        <div className="absolute inset-x-0 top-16 mx-auto w-fit z-30 animate-bounce">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-amber-500/95 text-zinc-950 font-bold text-xs uppercase tracking-wider shadow-2xl border-2 border-white">
            <ShieldAlert className="w-4 h-4 animate-pulse text-zinc-950" />
            <span>UMPIRE REVIEW IN PROGRESS: {reviewState.reviewType.replace('_', ' ')}</span>
          </div>
        </div>
      )}

      {/* Bottom Overlay: 6-Camera Angle Quick Switcher (Viewer Watch Selection) */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-col sm:flex-row items-center justify-between gap-2 p-2 rounded-lg bg-zinc-950/85 backdrop-blur-md border border-zinc-800/80 opacity-90 transition-opacity hover:opacity-100">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-semibold text-zinc-200 uppercase tracking-wide text-[11px]">
            Watch Angles:
          </span>
        </div>

        {/* 6 Camera Selector Buttons */}
        <div className="grid grid-cols-6 gap-1.5 w-full sm:w-auto">
          {cameras.map((cam) => {
            const isSelected = cam.id === activeCameraId;
            const isPhoneCam = cam.id === 'cam-1' && isLiveAdminPhoneStream;

            return (
              <button
                key={cam.id}
                onClick={() => setActiveCameraId(cam.id)}
                className={`flex flex-col items-center justify-center px-2.5 py-1 rounded transition-all text-center ${
                  isSelected
                    ? 'bg-orange-600 text-white font-semibold shadow-md ring-1 ring-orange-400'
                    : 'bg-zinc-900/90 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800'
                }`}
              >
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-bold tracking-tight uppercase">
                    Cam {cam.number}
                  </span>
                  {isPhoneCam && (
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping inline-block" />
                  )}
                </div>
                <span className="text-[9px] text-zinc-400 truncate max-w-[55px] hidden md:inline">
                  {cam.purpose}
                </span>
              </button>
            );
          })}
        </div>

        {/* Signal & Resolution Pill */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] text-zinc-400 font-mono-numbers">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
            {activeCam.fps} FPS
          </span>
          <span>·</span>
          <span>{activeCam.resolution}</span>
          <span>·</span>
          <span>{activeCam.latencyMs} ms</span>
        </div>
      </div>
    </div>
  );
};
