import React from 'react';
import { Camera, Radio, Maximize2, Minimize2, Flame, Sparkles } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';

interface TvDisplayModeProps {
  onExit: () => void;
}

export const TvDisplayMode: React.FC<TvDisplayModeProps> = ({ onExit }) => {
  const { match, cameras, activeCameraId, setActiveCameraId, reviewState } = useCricket();

  const activeCam = cameras.find((c) => c.id === activeCameraId) || cameras[0];
  const battingTeam = match.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = match.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const currentInnings = match.currentInnings === 1 ? match.innings1 : (match.innings2 || match.innings1);

  const striker = battingTeam.players.find((p) => p.id === match.activeStrikerId);
  const nonStriker = battingTeam.players.find((p) => p.id === match.activeNonStrikerId);
  const bowler = bowlingTeam.players.find((p) => p.id === match.activeBowlerId);

  const strikerStats = match.battingStats[match.activeStrikerId] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
  const nonStrikerStats = match.battingStats[match.activeNonStrikerId] || { runs: 0, balls: 0, fours: 0, sixes: 0 };
  const bowlerStats = match.bowlingStats[match.activeBowlerId] || { overs: 0, maidens: 0, runsConceded: 0, wickets: 0 };

  const lastBall = match.currentOverBalls[match.currentOverBalls.length - 1];

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col overflow-hidden select-none">
      {/* Top TV Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
          <h1 className="text-xl md:text-2xl font-black font-display tracking-wider uppercase text-white">
            THAMIYANUR AGNI SPORTS OTT
          </h1>
          <span className="text-zinc-600">|</span>
          <span className="text-xs font-semibold text-zinc-300 uppercase tracking-widest hidden md:inline">
            STADIUM BROADCAST MODE
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* 6-Camera Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveCameraId(cam.id)}
                className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${
                  cam.id === activeCameraId
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                CAM {cam.number}
              </button>
            ))}
          </div>

          {/* LIVE Pill */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/80 border border-red-600 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-500" />
            <span>LIVE 🔴</span>
          </div>

          {/* Exit TV Mode Button */}
          <button
            onClick={onExit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition-colors"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Exit TV Mode</span>
          </button>
        </div>
      </div>

      {/* Main Split: Live Video (Left) + Broadcast Graphic Tower (Right) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        {/* Live Video (8 Columns on desktop) */}
        <div className="lg:col-span-8 bg-zinc-950 relative flex items-center justify-center overflow-hidden">
          <img
            src={activeCam.streamUrl}
            alt={activeCam.name}
            className="h-full w-full object-cover"
          />

          {/* Camera Tag & FPS */}
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-zinc-950/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-800 text-xs">
            <Camera className="w-4 h-4 text-orange-500" />
            <span className="font-bold text-white uppercase">{activeCam.name}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-zinc-300">{activeCam.purpose}</span>
            <span className="text-zinc-500">·</span>
            <span className="text-emerald-400 font-mono-numbers">{activeCam.fps} FPS</span>
          </div>

          {/* DRS In Progress Banner */}
          {reviewState.isActive && (
            <div className="absolute top-4 right-4 bg-amber-500 text-zinc-950 px-4 py-2 rounded-lg font-black uppercase text-xs tracking-wider shadow-2xl animate-pulse">
              UMPIRE REVIEW IN PROGRESS: {reviewState.reviewType.replace('_', ' ')}
            </div>
          )}

          {/* Ball Speed Bug */}
          {lastBall?.aiAnalysis && (
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-zinc-950/90 backdrop-blur-md px-3.5 py-2 rounded-lg border border-orange-500/40 shadow-xl">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <div className="flex flex-col">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Ball Speed</span>
                <span className="text-lg font-black font-mono-numbers text-orange-400">
                  {lastBall.aiAnalysis.speedKmh} <span className="text-xs font-normal text-zinc-400">km/h</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Stadium Broadcast Tower (4 Columns on desktop) */}
        <div className="lg:col-span-4 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 p-6 flex flex-col justify-between border-l border-zinc-800/80">
          <div className="space-y-6">
            {/* Team & Score Header */}
            <div>
              <div className="text-xs font-bold text-orange-400 uppercase tracking-widest">
                BATTTING TEAM
              </div>
              <h2 className="text-3xl font-black font-display tracking-tight text-white mt-1">
                {battingTeam.name}
              </h2>

              <div className="mt-2 flex items-baseline gap-3">
                <span className="text-6xl font-black font-mono-numbers text-white tracking-tight">
                  {currentInnings.totalRuns}/{currentInnings.wickets}
                </span>
                <span className="text-2xl font-bold font-mono-numbers text-orange-400">
                  {currentInnings.overs} <span className="text-sm font-normal text-zinc-400">OVERS</span>
                </span>
              </div>

              <div className="flex items-center gap-3 mt-1 text-xs text-zinc-400 font-mono-numbers">
                <span>CRR: {currentInnings.currentRunRate}</span>
                <span>·</span>
                <span>PARTNERSHIP: {match.currentPartnership.runs} ({match.currentPartnership.balls}b)</span>
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Batters */}
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                BATTERS
              </div>
              <div className="space-y-3 font-mono-numbers">
                <div className="flex items-center justify-between p-3 rounded-lg bg-orange-950/20 border border-orange-500/40">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-400 font-black text-sm">*</span>
                    <span className="font-bold text-base text-white">{striker?.name || 'Striker'}</span>
                  </div>
                  <span className="text-xl font-black text-orange-400">
                    {strikerStats.runs}* <span className="text-xs text-zinc-400 font-normal">({strikerStats.balls})</span>
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
                  <span className="font-semibold text-base text-zinc-200">{nonStriker?.name || 'Non-Striker'}</span>
                  <span className="text-xl font-bold text-zinc-300">
                    {nonStrikerStats.runs} <span className="text-xs text-zinc-400 font-normal">({nonStrikerStats.balls})</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-zinc-800" />

            {/* Bowler */}
            <div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">
                BOWLER
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/40 border border-zinc-800">
                <div className="flex flex-col">
                  <span className="font-bold text-base text-white">{bowler?.name || 'Bowler'}</span>
                  <span className="text-xs text-zinc-400">{bowler?.bowlingStyle}</span>
                </div>
                <div className="text-right font-mono-numbers">
                  <div className="text-xl font-black text-white">
                    {bowlerStats.wickets}/{bowlerStats.runsConceded}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {bowlerStats.overs} overs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick tournament tag */}
          <div className="text-[11px] text-zinc-500 text-center uppercase tracking-widest pt-4 border-t border-zinc-800/60">
            {match.tournament} · {match.venue}
          </div>
        </div>
      </div>

      {/* Bottom Television Ticker Bar */}
      <div className="px-6 py-3.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        {/* Last Ball */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-500/40 px-2.5 py-1 rounded">
            LAST BALL:
          </span>
          <span className="text-sm font-bold text-white">
            {lastBall ? lastBall.commentary : 'Starting play...'}
          </span>
        </div>

        {/* THIS OVER Balls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
            THIS OVER:
          </span>
          <div className="flex items-center gap-1.5">
            {match.currentOverBalls.map((b) => (
              <span
                key={b.id}
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold font-mono-numbers ${
                  b.isWicket
                    ? 'bg-red-600 text-white'
                    : b.runs === 6
                    ? 'bg-purple-600 text-white'
                    : b.runs === 4
                    ? 'bg-blue-600 text-white'
                    : b.runs === 0
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    : 'bg-zinc-700 text-white'
                }`}
              >
                {b.isWicket ? 'W' : b.extraType === 'WIDE' ? 'Wd' : b.runs}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
