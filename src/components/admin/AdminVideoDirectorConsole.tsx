import React, { useState } from 'react';
import {
  Tv,
  Radio,
  Camera,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Sliders,
  Eye,
  Layers,
  MessageSquare,
  Check,
  X,
  Volume2,
  Share2,
  RefreshCw,
  Flame,
  Award,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { BroadcastVideoMode, BroadcastLowerThird } from '../../types/cricket';
import { AdminPhoneCameraTransmitter } from './AdminPhoneCameraTransmitter';

export const AdminVideoDirectorConsole: React.FC = () => {
  const {
    match,
    cameras,
    activeCameraId,
    operateBroadcastCamera,
    adminVideoState,
    operateVideoMode,
    operateLowerThird,
    clearLowerThird,
    operateDirectorNotice,
    setForceFollowAdmin,
    systemHealth,
  } = useCricket();

  const [customNoticeInput, setCustomNoticeInput] = useState<string>('');
  const [selectedReplaySpeed, setSelectedReplaySpeed] = useState<number>(0.5);

  const striker = match.teamA.players
    .concat(match.teamB.players)
    .find((p) => p.id === match.activeStrikerId);
  const bowler = match.teamA.players
    .concat(match.teamB.players)
    .find((p) => p.id === match.activeBowlerId);

  const battingStats = match.battingStats[match.activeStrikerId];
  const bowlingStats = match.bowlingStats[match.activeBowlerId];

  const handlePushStrikerSpotlight = () => {
    if (!striker) return;
    operateLowerThird({
      type: 'BATTER_SPOTLIGHT',
      playerId: striker.id,
      title: `${striker.name.toUpperCase()} (JRSY #${striker.jerseyNumber})`,
      subtitle: `${striker.battingStyle} · ${battingStats?.runs || 0} runs off ${battingStats?.balls || 0} balls (SR: ${battingStats?.strikeRate || 0})`,
      extraInfo: `4s: ${battingStats?.fours || 0} · 6s: ${battingStats?.sixes || 0} · Tournament Runs: ${striker.tournamentRuns || 0}`,
    });
  };

  const handlePushBowlerSpotlight = () => {
    if (!bowler) return;
    operateLowerThird({
      type: 'BOWLER_SPOTLIGHT',
      playerId: bowler.id,
      title: `${bowler.name.toUpperCase()} (JRSY #${bowler.jerseyNumber})`,
      subtitle: `${bowler.bowlingStyle} · ${bowlingStats?.wickets || 0} wkts for ${bowlingStats?.runsConceded || 0} (${bowlingStats?.overs || 0} ov)`,
      extraInfo: `Economy: ${bowlingStats?.economy || '0.0'} · Dots: ${bowlingStats?.dots || 0}`,
    });
  };

  const handlePushTargetTracker = () => {
    const innings = match.currentInnings === 2 && match.innings2 ? match.innings2 : match.innings1;
    const target = innings.target || 0;
    const needed = Math.max(0, target - innings.totalRuns);
    const ballsRemaining = Math.max(0, match.totalOvers * 6 - innings.ballsTotal);

    operateLowerThird({
      type: 'TARGET_TRACKER',
      title: `MATCH EQUATION: ${match.title.toUpperCase()}`,
      subtitle: match.currentInnings === 2
        ? `NEED ${needed} RUNS IN ${ballsRemaining} BALLS · RRR: ${innings.requiredRunRate || '0.0'}`
        : `1ST INNINGS: ${innings.totalRuns}/${innings.wickets} IN ${innings.overs} OVERS (CRR: ${innings.currentRunRate})`,
      extraInfo: `Projected Total: ${Math.round(innings.currentRunRate * match.totalOvers)} runs`,
    });
  };

  const handleBroadcastNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customNoticeInput.trim()) return;
    operateDirectorNotice(customNoticeInput.trim());
    setCustomNoticeInput('');
  };

  const activeCam = cameras.find((c) => c.id === adminVideoState.activeCameraId) || cameras[0];

  return (
    <div className="flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-6 shadow-2xl space-y-6">
      {/* Top Header: Title & Program Status */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-950 border border-red-700/60 text-red-400 font-bold text-xs uppercase flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              DIRECTOR ON-AIR CONSOLE
            </span>
            <h3 className="text-base sm:text-xl font-black font-display tracking-tight text-white uppercase">
              OPERATE LIVE VIDEO TO ALL VIEWERS
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Switch live camera angles, trigger instant slow-motion replays, run DRS Hawk-Eye reviews, and project player graphics directly to the viewers' dashboard
          </p>
        </div>

        {/* Master Director Lock Toggle */}
        <div className="flex items-center gap-3 bg-zinc-950 p-2 rounded-xl border border-zinc-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-zinc-200">
            <input
              type="checkbox"
              checked={adminVideoState.forceFollowAdmin}
              onChange={(e) => setForceFollowAdmin(e.target.checked)}
              className="rounded accent-orange-500 h-4 w-4"
            />
            <span>Broadcast Director Lock (Viewers Auto-Follow)</span>
          </label>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-mono-numbers font-semibold">
            {systemHealth.activeViewers} Viewers Watching
          </span>
        </div>
      </div>

      {/* Main Grid: Left Program Video Preview (What Viewers See), Right Director Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Live Program Monitor (What Viewers See) */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              PROGRAM MONITOR (LIVE ON VIEWERS' DASHBOARD)
            </span>
            <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-[10px] text-zinc-400 font-mono">
              {activeCam.name} · {activeCam.resolution} · {activeCam.fps} FPS
            </span>
          </div>

          {/* Video Preview Box */}
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border-2 border-orange-500/70 shadow-2xl group select-none">
            {activeCam.streamUrl ? (
              <img
                src={activeCam.streamUrl}
                alt={activeCam.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-zinc-950 flex items-center justify-center text-zinc-600 text-xs">
                No Video Signal
              </div>
            )}

            {/* Broadcast Mode Graphic Bugs */}
            {adminVideoState.videoMode === 'REPLAY_SLOWMO' && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1 rounded-md bg-amber-600/90 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-lg animate-pulse border border-white">
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>{adminVideoState.replayTitle || 'INSTANT REPLAY (0.5x)'}</span>
              </div>
            )}

            {adminVideoState.videoMode === 'DRS_REVIEW' && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1 rounded-md bg-purple-600 text-white font-black text-xs uppercase tracking-wider shadow-lg border border-white animate-bounce">
                <ShieldAlert className="w-4 h-4" />
                <span>DRS HAWK-EYE REVIEW IN PROGRESS</span>
              </div>
            )}

            {adminVideoState.videoMode === 'HIGHLIGHT' && (
              <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-3 py-1 rounded-md bg-blue-600 text-white font-black text-xs uppercase tracking-wider shadow-lg border border-white">
                <Sparkles className="w-4 h-4" />
                <span>MATCH HIGHLIGHTS</span>
              </div>
            )}

            {/* Live On-Air Pill */}
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-sm border border-zinc-700 text-[10px] font-bold text-red-500 uppercase">
              <span className="h-2 w-2 rounded-full bg-red-600 animate-ping inline-block" />
              <span>ON AIR</span>
            </div>

            {/* Active Lower-Third Graphic (Projected on Viewers' Screen) */}
            {adminVideoState.lowerThird.type !== 'NONE' && (
              <div className="absolute bottom-3 inset-x-3 z-30 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950/95 border-l-4 border-orange-500 rounded-lg p-2.5 shadow-2xl text-xs backdrop-blur-md animate-in slide-in-from-bottom duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-orange-600 text-white text-[9px] font-black uppercase">
                      {adminVideoState.lowerThird.type.replace('_', ' ')}
                    </span>
                    <span className="font-bold text-white tracking-wide text-xs">
                      {adminVideoState.lowerThird.title}
                    </span>
                  </div>
                  <button
                    onClick={clearLowerThird}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white"
                    title="Remove Graphic"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-orange-300 mt-0.5 font-medium">
                  {adminVideoState.lowerThird.subtitle}
                </div>
                {adminVideoState.lowerThird.extraInfo && (
                  <div className="text-[10px] text-zinc-400 mt-0.5 font-mono-numbers">
                    {adminVideoState.lowerThird.extraInfo}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick status bar */}
          <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300">
              Active Video Mode: <strong className="text-orange-400">{adminVideoState.videoMode.replace('_', ' ')}</strong>
            </span>
            <span className="font-mono-numbers text-[11px]">
              Last operated: {new Date(adminVideoState.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Right Column: Master Camera Matrix & Operator Deck */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Section 1: 6-Camera Live Matrix Switcher */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-orange-400" />
                1. Camera Matrix Switcher (Instant Broadcast)
              </span>
              <span className="text-[10px] text-zinc-500">Click to switch viewers' feed</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {cameras.map((cam) => {
                const isLive = cam.id === adminVideoState.activeCameraId;
                return (
                  <button
                    key={cam.id}
                    onClick={() => operateBroadcastCamera(cam.id)}
                    className={`p-2.5 rounded-xl flex flex-col items-center justify-center text-center transition-all ${
                      isLive
                        ? 'bg-orange-600 text-white font-bold shadow-lg ring-2 ring-orange-400'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-black uppercase">CAM {cam.number}</span>
                      {isLive && <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-medium truncate max-w-[85px] mt-0.5">
                      {cam.purpose}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                      {cam.fps}fps · {cam.resolution}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Video Mode Operator (Live, Slow-Mo Replay, DRS, Highlight) */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 text-orange-400" />
              2. Video Stream Mode (Operate Viewers' Screen)
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* Return to Live */}
              <button
                onClick={() => operateVideoMode('LIVE_FEED')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  adminVideoState.videoMode === 'LIVE_FEED'
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>🔴 Live Match Stream</span>
              </button>

              {/* Instant Replay 0.5x */}
              <button
                onClick={() =>
                  operateVideoMode('REPLAY_SLOWMO', {
                    replayTitle: 'SLOW-MOTION REPLAY 0.5x',
                    replaySpeed: 0.5,
                  })
                }
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  adminVideoState.videoMode === 'REPLAY_SLOWMO'
                    ? 'bg-amber-600 text-zinc-950 shadow-lg'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>⏪ Instant Replay (0.5x)</span>
              </button>

              {/* DRS Optical Review Screen */}
              <button
                onClick={() => operateVideoMode('DRS_REVIEW')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  adminVideoState.videoMode === 'DRS_REVIEW'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>⚖️ DRS Hawk-Eye Review</span>
              </button>

              {/* Match Highlights */}
              <button
                onClick={() => operateVideoMode('HIGHLIGHT')}
                className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  adminVideoState.videoMode === 'HIGHLIGHT'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>⚡ Boundary Highlights</span>
              </button>
            </div>
          </div>

          {/* Section 3: Project Lower-Third Graphics to Viewers' Screen */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-white flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                3. Push Lower-Third Graphics to Video
              </span>
              {adminVideoState.lowerThird.type !== 'NONE' && (
                <button
                  onClick={clearLowerThird}
                  className="text-[10px] font-bold text-red-400 hover:underline"
                >
                  Clear Graphic
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handlePushStrikerSpotlight}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-orange-600 hover:text-white border border-zinc-800 text-zinc-200 text-xs font-bold transition-all text-center flex flex-col items-center"
              >
                <span className="text-[10px] text-orange-400 uppercase">Striker</span>
                <span className="truncate max-w-[85px] mt-0.5">{striker?.shortName || 'Batter'}</span>
              </button>

              <button
                onClick={handlePushBowlerSpotlight}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-blue-600 hover:text-white border border-zinc-800 text-zinc-200 text-xs font-bold transition-all text-center flex flex-col items-center"
              >
                <span className="text-[10px] text-blue-400 uppercase">Bowler</span>
                <span className="truncate max-w-[85px] mt-0.5">{bowler?.shortName || 'Bowler'}</span>
              </button>

              <button
                onClick={handlePushTargetTracker}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-purple-600 hover:text-white border border-zinc-800 text-zinc-200 text-xs font-bold transition-all text-center flex flex-col items-center"
              >
                <span className="text-[10px] text-purple-400 uppercase">Equation</span>
                <span className="truncate max-w-[85px] mt-0.5">Target RRR</span>
              </button>
            </div>

            {/* Custom Director Broadcast Notice Ticker */}
            <form onSubmit={handleBroadcastNotice} className="flex items-center gap-2 pt-1">
              <input
                type="text"
                placeholder="Broadcast breaking notice (e.g. FREE HIT, RAIN DELAY)..."
                value={customNoticeInput}
                onChange={(e) => setCustomNoticeInput(e.target.value)}
                className="flex-1 py-1.5 px-3 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition-colors shrink-0"
              >
                Push Notice
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Admin Phone Camera 1 Live Transmitter */}
      <div className="pt-2 border-t border-zinc-800">
        <AdminPhoneCameraTransmitter />
      </div>
    </div>
  );
};
