import React, { useState } from 'react';
import { Camera, Radio, RefreshCw, Power, Settings2, CheckCircle2, AlertTriangle, MonitorPlay } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { CameraFeed } from '../../types/cricket';
import { AdminPhoneCameraTransmitter } from './AdminPhoneCameraTransmitter';

export const CameraControlHub: React.FC = () => {
  const {
    cameras,
    activeCameraId,
    setActiveCameraId,
    updateCameraStatus,
    reconnectCamera,
    setViewMode,
    setBroadcasterCameraId,
  } = useCricket();

  const [previewCameraId, setPreviewCameraId] = useState<string | null>(null);
  const [editingCameraId, setEditingCameraId] = useState<string | null>(null);
  const [streamUrlInput, setStreamUrlInput] = useState<string>('');

  const handleStartStop = (cam: CameraFeed) => {
    const newStatus = cam.status === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    updateCameraStatus(cam.id, { status: newStatus });
  };

  const handleOpenEdit = (cam: CameraFeed) => {
    setEditingCameraId(cam.id);
    setStreamUrlInput(cam.streamUrl || '');
  };

  const handleSaveStreamUrl = (cameraId: string) => {
    updateCameraStatus(cameraId, { streamUrl: streamUrlInput });
    setEditingCameraId(null);
  };

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            6-CAMERA MASTER BROADCAST HUB
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time low-latency streams connected via Wi-Fi/WebRTC media server
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-numbers">
          <span className="text-zinc-400">Program Feed:</span>
          <span className="px-2.5 py-1 rounded bg-orange-600 font-bold text-white uppercase text-[11px]">
            CAM {cameras.find((c) => c.id === activeCameraId)?.number} ACTIVE
          </span>
        </div>
      </div>

      {/* Admin Only Camera Phone 1 Live Video Transmitter */}
      <AdminPhoneCameraTransmitter />

      {/* 6 Camera Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cameras.map((cam) => {
          const isProgram = cam.id === activeCameraId;
          const isConnected = cam.status === 'CONNECTED';

          return (
            <div
              key={cam.id}
              className={`flex flex-col justify-between rounded-xl p-4 transition-all border ${
                isProgram
                  ? 'bg-zinc-950 border-orange-500/80 shadow-lg ring-1 ring-orange-500/50'
                  : 'bg-zinc-950/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Camera Title & Status */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white uppercase tracking-wide">
                      {cam.name}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <span className="text-xs text-orange-400 font-semibold">{cam.purpose}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        isConnected
                          ? 'bg-emerald-500 animate-pulse'
                          : cam.status === 'RECONNECTING'
                          ? 'bg-amber-500 animate-spin'
                          : 'bg-red-500'
                      }`}
                    />
                    <span
                      className={
                        isConnected
                          ? 'text-emerald-400'
                          : cam.status === 'RECONNECTING'
                          ? 'text-amber-400'
                          : 'text-red-400'
                      }
                    >
                      {cam.status}
                    </span>
                  </div>
                </div>

                {/* Video Preview Thumbnail */}
                <div className="relative aspect-video rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 mb-3 group">
                  <img
                    src={cam.streamUrl}
                    alt={cam.name}
                    className="h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-opacity"
                  />
                  {isProgram && (
                    <div className="absolute top-2 left-2 bg-orange-600 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded shadow">
                      LIVE ON AIR
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-sm text-[10px] text-zinc-300 font-mono-numbers px-2 py-0.5 rounded">
                    {cam.fps} FPS · {cam.resolution}
                  </div>
                </div>

                {/* Telemetry Stats: Signal, FPS, Resolution, Latency */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono-numbers p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 mb-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase">Signal</span>
                    <span className="text-zinc-200 font-semibold">{cam.signalQuality}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase">Latency</span>
                    <span className="text-zinc-200 font-semibold">{cam.latencyMs} ms</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: Switch to Program, Phone Cam, Start/Stop, Reconnect, Config */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveCameraId(cam.id)}
                    disabled={!isConnected}
                    className={`flex-1 py-1.5 px-2 rounded font-bold transition-colors flex items-center justify-center gap-1 ${
                      isProgram
                        ? 'bg-orange-600 text-white cursor-default'
                        : isConnected
                        ? 'bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-200'
                        : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'
                    }`}
                  >
                    <MonitorPlay className="w-3.5 h-3.5" />
                    <span>{isProgram ? 'ON AIR' : 'SWITCH'}</span>
                  </button>

                  {/* Connect this Phone Camera directly */}
                  <button
                    onClick={() => {
                      setBroadcasterCameraId(cam.id);
                      setViewMode('CAMERA');
                    }}
                    className="py-1.5 px-2.5 rounded bg-orange-950/80 text-orange-400 border border-orange-500/40 hover:bg-orange-900 hover:text-white font-bold transition-colors flex items-center gap-1"
                    title="Launch mobile phone camera broadcast for this angle"
                  >
                    <span>📱 Phone Cam</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-1 text-[11px] text-zinc-400">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartStop(cam)}
                      className={`p-1.5 rounded border transition-colors ${
                        isConnected
                          ? 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-red-950 hover:text-red-400'
                          : 'bg-emerald-950 text-emerald-400 border-emerald-800 hover:bg-emerald-900'
                      }`}
                      title={isConnected ? 'Stop Camera' : 'Start Camera'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => reconnectCamera(cam.id)}
                      className="p-1.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                      title="Reconnect Wi-Fi Stream"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenEdit(cam)}
                      className="p-1.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                      title="Stream URL & Device Setup"
                    >
                      <Settings2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    #camera/{cam.id}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stream URL configuration modal */}
      {editingCameraId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-orange-400" />
              Camera Stream Configuration
            </h3>
            <p className="text-xs text-zinc-400">
              Provide an RTSP / HTTP WebRTC video stream URL, or upload local feed coordinates.
            </p>

            <div>
              <label className="text-xs font-semibold text-zinc-300 block mb-1">
                Stream URL / Video Asset Path
              </label>
              <input
                type="text"
                value={streamUrlInput}
                onChange={(e) => setStreamUrlInput(e.target.value)}
                className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-200 text-xs font-mono"
                placeholder="https://... or /src/assets/..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800 text-xs">
              <button
                onClick={() => setEditingCameraId(null)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveStreamUrl(editingCameraId)}
                className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold"
              >
                Save Stream
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
