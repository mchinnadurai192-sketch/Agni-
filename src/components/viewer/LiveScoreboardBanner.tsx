import React from 'react';
import { Flame, Trophy, Activity, Target } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { BallEvent } from '../../types/cricket';

interface LiveScoreboardBannerProps {
  onSelectBall?: (ball: BallEvent) => void;
}

export const LiveScoreboardBanner: React.FC<LiveScoreboardBannerProps> = ({ onSelectBall }) => {
  const { match } = useCricket();

  const battingTeam = match.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = match.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const currentInnings = match.currentInnings === 1 ? match.innings1 : (match.innings2 || match.innings1);

  const striker = battingTeam.players.find((p) => p.id === match.activeStrikerId);
  const nonStriker = battingTeam.players.find((p) => p.id === match.activeNonStrikerId);
  const bowler = bowlingTeam.players.find((p) => p.id === match.activeBowlerId);

  const strikerStats = match.battingStats[match.activeStrikerId] || {
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
  };

  const nonStrikerStats = match.battingStats[match.activeNonStrikerId] || {
    runs: 0,
    balls: 0,
    fours: 0,
    sixes: 0,
    strikeRate: 0,
  };

  const bowlerStats = match.bowlingStats[match.activeBowlerId] || {
    overs: 0,
    maidens: 0,
    runsConceded: 0,
    wickets: 0,
    economy: 0,
  };

  const totalMatchOvers = match.totalOvers || 6;
  const isSecondInnings = match.currentInnings === 2;
  const targetRuns = currentInnings.target || 0;
  const runsNeeded = Math.max(0, targetRuns - currentInnings.totalRuns);
  const ballsRemaining = Math.max(0, totalMatchOvers * 6 - currentInnings.ballsTotal);

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl">
      {/* Top Banner: Match Status & Teams */}
      <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-3.5 h-3.5 text-orange-400" />
          <span className="font-bold text-white uppercase tracking-wider">{match.title}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-orange-400 font-semibold">{totalMatchOvers} OVERS MATCH</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono-numbers">
          <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-400 font-bold uppercase text-[10px]">
            {match.status}
          </span>
          <span>{match.teamA.shortName} vs {match.teamB.shortName}</span>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/60">
        <div>
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
              {battingTeam.name}
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
              {match.currentInnings === 1 ? '1st Innings' : '2nd Innings'}
            </span>
          </div>

          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-4xl sm:text-5xl font-black font-mono-numbers text-white tracking-tight">
              {currentInnings.totalRuns}/{currentInnings.wickets}
            </span>
            <span className="text-lg sm:text-xl font-bold font-mono-numbers text-orange-400">
              {currentInnings.overs} / {totalMatchOvers}.0 <span className="text-xs font-normal text-zinc-400 uppercase">Overs</span>
            </span>
          </div>
        </div>

        {/* Target & Required Run Rate / Projected Score */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono-numbers">
          <div className="flex flex-col bg-zinc-900 px-3.5 py-2 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Run Rate (CRR)</span>
            <span className="text-base font-bold text-white">{currentInnings.currentRunRate}</span>
          </div>

          {isSecondInnings ? (
            <div className="flex flex-col bg-orange-950/40 px-3.5 py-2 rounded-lg border border-orange-500/40">
              <span className="text-[10px] text-orange-400 uppercase tracking-wider font-bold">
                Target: {targetRuns} runs
              </span>
              <span className="text-sm font-bold text-white">
                Need {runsNeeded} in {ballsRemaining} balls <span className="text-xs text-orange-400">({currentInnings.requiredRunRate || '0.0'} RRR)</span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col bg-zinc-900 px-3.5 py-2 rounded-lg border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Projected (6 ov)</span>
              <span className="text-base font-bold text-orange-400">
                {Math.round(currentInnings.currentRunRate * totalMatchOvers)} runs
              </span>
            </div>
          )}

          <div className="flex flex-col bg-zinc-900 px-3.5 py-2 rounded-lg border border-zinc-800">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Partnership</span>
            <span className="text-base font-bold text-emerald-400">
              {match.currentPartnership.runs} <span className="text-xs text-zinc-400 font-normal">({match.currentPartnership.balls}b)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Batters and Bowler Live Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 bg-zinc-900/40 text-xs">
        {/* Batters */}
        <div className="p-3.5 sm:p-4 space-y-2">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Current Batsman</span>
            <div className="flex items-center gap-4 text-zinc-500 font-mono-numbers pr-2">
              <span className="w-8 text-right">R</span>
              <span className="w-8 text-right">B</span>
              <span className="w-8 text-right">4s</span>
              <span className="w-8 text-right">6s</span>
              <span className="w-10 text-right">SR</span>
            </div>
          </div>

          {/* Striker */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-orange-950/20 border border-orange-500/30">
            <div className="flex items-center gap-1.5 font-medium text-zinc-100">
              <span className="text-orange-400 font-bold text-sm">*</span>
              <span className="font-semibold text-sm">{striker?.name || 'Striker'}</span>
              <span className="text-[10px] text-orange-400 font-bold uppercase">(ON STRIKE)</span>
            </div>
            <div className="flex items-center gap-4 font-mono-numbers text-right pr-2">
              <span className="w-8 font-bold text-sm text-white">{strikerStats.runs}</span>
              <span className="w-8 text-zinc-400">{strikerStats.balls}</span>
              <span className="w-8 text-zinc-400">{strikerStats.fours}</span>
              <span className="w-8 text-zinc-400">{strikerStats.sixes}</span>
              <span className="w-10 font-medium text-orange-400">{strikerStats.strikeRate}</span>
            </div>
          </div>

          {/* Non-Striker */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/30 border border-zinc-800/50">
            <div className="flex items-center gap-1.5 font-medium text-zinc-200">
              <span className="font-semibold text-sm">{nonStriker?.name || 'Non-Striker'}</span>
            </div>
            <div className="flex items-center gap-4 font-mono-numbers text-right pr-2">
              <span className="w-8 font-bold text-sm text-white">{nonStrikerStats.runs}</span>
              <span className="w-8 text-zinc-400">{nonStrikerStats.balls}</span>
              <span className="w-8 text-zinc-400">{nonStrikerStats.fours}</span>
              <span className="w-8 text-zinc-400">{nonStrikerStats.sixes}</span>
              <span className="w-10 font-medium text-zinc-300">{nonStrikerStats.strikeRate}</span>
            </div>
          </div>
        </div>

        {/* Current Bowler */}
        <div className="p-3.5 sm:p-4 space-y-2">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Current Bowler</span>
            <div className="flex items-center gap-4 text-zinc-500 font-mono-numbers pr-2">
              <span className="w-8 text-right">O</span>
              <span className="w-8 text-right">M</span>
              <span className="w-8 text-right">R</span>
              <span className="w-8 text-right">W</span>
              <span className="w-10 text-right">ECON</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-800/40 border border-zinc-700/60">
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-zinc-100">{bowler?.name || 'Bowler'}</span>
              <span className="text-[10px] text-zinc-400">{bowler?.bowlingStyle || 'Right Arm Fast'}</span>
            </div>
            <div className="flex items-center gap-4 font-mono-numbers text-right pr-2">
              <span className="w-8 font-bold text-zinc-200">{bowlerStats.overs}</span>
              <span className="w-8 text-zinc-400">{bowlerStats.maidens}</span>
              <span className="w-8 text-zinc-400">{bowlerStats.runsConceded}</span>
              <span className="w-8 font-bold text-sm text-red-400">{bowlerStats.wickets}</span>
              <span className="w-10 font-medium text-emerald-400">{bowlerStats.economy}</span>
            </div>
          </div>

          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-zinc-400 font-mono-numbers">
            <span>Dot deliveries: {bowlerStats.dots || 0}</span>
            <span>Wides: {bowlerStats.wides || 0}</span>
            <span>No balls: {bowlerStats.noBalls || 0}</span>
          </div>
        </div>
      </div>

      {/* THIS OVER Strip */}
      <div className="p-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            THIS OVER:
          </span>

          <div className="flex items-center gap-1.5 flex-wrap">
            {match.currentOverBalls.map((ball) => (
              <span
                key={ball.id}
                className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono-numbers font-bold shadow-sm ${
                  ball.isWicket
                    ? 'bg-red-600 text-white'
                    : ball.runs === 6
                    ? 'bg-purple-600 text-white'
                    : ball.runs === 4
                    ? 'bg-blue-600 text-white'
                    : ball.extraType === 'WIDE'
                    ? 'bg-amber-600 text-zinc-950'
                    : ball.runs === 0
                    ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    : 'bg-zinc-700 text-white'
                }`}
              >
                {ball.isWicket ? 'W' : ball.extraType === 'WIDE' ? 'Wd' : ball.runs}
              </span>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 font-mono-numbers">
          Extras: {currentInnings.extras.total} (w {currentInnings.extras.wides}, nb {currentInnings.extras.noBalls})
        </div>
      </div>
    </div>
  );
};
