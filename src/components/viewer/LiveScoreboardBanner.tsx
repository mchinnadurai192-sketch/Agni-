import React, { useState } from 'react';
import {
  Flame,
  Trophy,
  Activity,
  Target,
  User,
  Info,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { BallEvent, Player } from '../../types/cricket';
import { PlayerDetailCardModal } from '../common/PlayerDetailCardModal';

interface LiveScoreboardBannerProps {
  onSelectBall?: (ball: BallEvent) => void;
}

export const LiveScoreboardBanner: React.FC<LiveScoreboardBannerProps> = ({ onSelectBall }) => {
  const { match } = useCricket();
  const [selectedPlayerForModal, setSelectedPlayerForModal] = useState<Player | null>(null);

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
    <>
      {/* Player Detail Card Modal */}
      {selectedPlayerForModal && (
        <PlayerDetailCardModal
          player={selectedPlayerForModal}
          onClose={() => setSelectedPlayerForModal(null)}
        />
      )}

      <div className="flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl">
        {/* Top Banner: Match Status & Teams */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-orange-400" />
            <span className="font-extrabold text-white uppercase tracking-wider">{match.title}</span>
            <span className="text-zinc-600">·</span>
            <span className="text-orange-400 font-bold">{totalMatchOvers} OVERS FORMAT</span>
          </div>
          <div className="flex items-center gap-2 text-zinc-400 text-[11px] font-mono-numbers">
            <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-600/40 text-emerald-400 font-bold uppercase text-[10px]">
              {match.status}
            </span>
            <span className="hidden sm:inline">{match.teamA.shortName} vs {match.teamB.shortName}</span>
          </div>
        </div>

        {/* Main Score Area */}
        <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 bg-zinc-950/70">
          <div>
            <div className="flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display uppercase">
                {battingTeam.name}
              </h2>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
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
            <div className="flex flex-col bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Run Rate (CRR)</span>
              <span className="text-base font-bold text-white">{currentInnings.currentRunRate}</span>
            </div>

            {isSecondInnings ? (
              <div className="flex flex-col bg-orange-950/40 px-3.5 py-2 rounded-xl border border-orange-500/40">
                <span className="text-[10px] text-orange-400 uppercase tracking-wider font-bold">
                  Target: {targetRuns} runs
                </span>
                <span className="text-sm font-bold text-white">
                  Need {runsNeeded} in {ballsRemaining} balls <span className="text-xs text-orange-400">({currentInnings.requiredRunRate || '0.0'} RRR)</span>
                </span>
              </div>
            ) : (
              <div className="flex flex-col bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Projected Score</span>
                <span className="text-base font-bold text-orange-400">
                  {Math.round(currentInnings.currentRunRate * totalMatchOvers)} runs
                </span>
              </div>
            )}

            <div className="flex flex-col bg-zinc-900 px-3.5 py-2 rounded-xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Partnership</span>
              <span className="text-base font-bold text-emerald-400">
                {match.currentPartnership.runs} <span className="text-xs text-zinc-400 font-normal">({match.currentPartnership.balls}b)</span>
              </span>
            </div>
          </div>
        </div>

        {/* Batters and Bowler Live Statistics with Player Details Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-zinc-800 bg-zinc-900/40 text-xs">
          {/* Batters Section */}
          <div className="p-3.5 sm:p-4 space-y-2.5">
            <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-orange-400">
                <Zap className="w-3.5 h-3.5" />
                Current Batters at Crease
              </span>
              <div className="flex items-center gap-4 text-zinc-500 font-mono-numbers pr-2">
                <span className="w-8 text-right">R</span>
                <span className="w-8 text-right">B</span>
                <span className="w-8 text-right">4s</span>
                <span className="w-8 text-right">6s</span>
                <span className="w-10 text-right">SR</span>
              </div>
            </div>

            {/* Striker Row */}
            <div
              onClick={() => striker && setSelectedPlayerForModal(striker)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-orange-950/30 border border-orange-500/40 hover:border-orange-400 hover:bg-orange-950/50 transition-all cursor-pointer group shadow-sm"
              title="Click to view full player details & stats"
            >
              <div className="flex items-center gap-2.5">
                {/* Jersey Avatar */}
                <div className="h-9 w-9 rounded-xl bg-orange-600 text-white font-mono-numbers font-black flex items-center justify-center text-xs shadow-md border border-orange-400 shrink-0 group-hover:scale-105 transition-transform">
                  {striker?.jerseyNumber || '#'}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span className="text-orange-400 text-sm font-black">*</span>
                    <span className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors">
                      {striker?.name || 'Active Striker'}
                    </span>
                    {striker?.isCaptain && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                        C
                      </span>
                    )}
                    {striker?.isWicketKeeper && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px] border border-blue-500/30">
                        WK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span className="font-semibold text-orange-400 uppercase">ON STRIKE</span>
                    <span>·</span>
                    <span>{striker?.battingStyle || 'Right Hand Bat'}</span>
                    <span>·</span>
                    <span className="text-orange-400 font-medium group-hover:underline flex items-center gap-0.5">
                      <Info className="w-3 h-3" /> View Details
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono-numbers text-right pr-2">
                <span className="w-8 font-black text-base text-white">{strikerStats.runs}</span>
                <span className="w-8 text-zinc-300 font-medium">{strikerStats.balls}</span>
                <span className="w-8 text-blue-400 font-bold">{strikerStats.fours}</span>
                <span className="w-8 text-purple-400 font-bold">{strikerStats.sixes}</span>
                <span className="w-10 font-bold text-orange-400">{strikerStats.strikeRate}</span>
              </div>
            </div>

            {/* Non-Striker Row */}
            <div
              onClick={() => nonStriker && setSelectedPlayerForModal(nonStriker)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-800/40 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/70 transition-all cursor-pointer group shadow-sm"
              title="Click to view full player details & stats"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-zinc-800 text-zinc-200 font-mono-numbers font-black flex items-center justify-center text-xs shadow-inner border border-zinc-700 shrink-0 group-hover:scale-105 transition-transform">
                  {nonStriker?.jerseyNumber || '#'}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                    <span className="text-sm font-semibold text-zinc-100 group-hover:text-white transition-colors">
                      {nonStriker?.name || 'Non-Striker'}
                    </span>
                    {nonStriker?.isCaptain && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                        C
                      </span>
                    )}
                    {nonStriker?.isWicketKeeper && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px] border border-blue-500/30">
                        WK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span>{nonStriker?.battingStyle || 'Right Hand Bat'}</span>
                    <span>·</span>
                    <span className="text-zinc-400 font-medium group-hover:text-zinc-200 flex items-center gap-0.5">
                      <Info className="w-3 h-3" /> View Details
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono-numbers text-right pr-2">
                <span className="w-8 font-black text-base text-zinc-100">{nonStrikerStats.runs}</span>
                <span className="w-8 text-zinc-300 font-medium">{nonStrikerStats.balls}</span>
                <span className="w-8 text-blue-400 font-bold">{nonStrikerStats.fours}</span>
                <span className="w-8 text-purple-400 font-bold">{nonStrikerStats.sixes}</span>
                <span className="w-10 font-bold text-zinc-300">{nonStrikerStats.strikeRate}</span>
              </div>
            </div>
          </div>

          {/* Current Bowler Section */}
          <div className="p-3.5 sm:p-4 space-y-2.5">
            <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-blue-400">
                <Target className="w-3.5 h-3.5" />
                Current Bowler in Action
              </span>
              <div className="flex items-center gap-4 text-zinc-500 font-mono-numbers pr-2">
                <span className="w-8 text-right">O</span>
                <span className="w-8 text-right">M</span>
                <span className="w-8 text-right">R</span>
                <span className="w-8 text-right">W</span>
                <span className="w-10 text-right">ECON</span>
              </div>
            </div>

            {/* Bowler Row */}
            <div
              onClick={() => bowler && setSelectedPlayerForModal(bowler)}
              className="flex items-center justify-between p-2.5 rounded-xl bg-blue-950/20 border border-blue-600/30 hover:border-blue-400 hover:bg-blue-950/40 transition-all cursor-pointer group shadow-sm"
              title="Click to view full player details & stats"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-blue-600 text-white font-mono-numbers font-black flex items-center justify-center text-xs shadow-md border border-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                  {bowler?.jerseyNumber || '#'}
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-bold text-white">
                    <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {bowler?.name || 'Bowler'}
                    </span>
                    {bowler?.isCaptain && (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                        C
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                    <span className="font-semibold text-blue-400">{bowler?.bowlingStyle || 'Right Arm Fast'}</span>
                    <span>·</span>
                    <span className="text-blue-400 font-medium group-hover:underline flex items-center gap-0.5">
                      <Info className="w-3 h-3" /> View Details
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 font-mono-numbers text-right pr-2">
                <span className="w-8 font-bold text-sm text-zinc-200">{bowlerStats.overs}</span>
                <span className="w-8 text-zinc-400">{bowlerStats.maidens}</span>
                <span className="w-8 text-zinc-300 font-semibold">{bowlerStats.runsConceded}</span>
                <span className="w-8 font-black text-base text-red-400">{bowlerStats.wickets}</span>
                <span className="w-10 font-bold text-emerald-400">{bowlerStats.economy}</span>
              </div>
            </div>

            {/* Bowler delivery breakdown pill */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-zinc-950/80 border border-zinc-800 text-[11px] text-zinc-400 font-mono-numbers">
              <span>Dot balls: <strong className="text-emerald-400">{bowlerStats.dots || 0}</strong></span>
              <span>Wides: <strong className="text-amber-400">{bowlerStats.wides || 0}</strong></span>
              <span>No balls: <strong className="text-red-400">{bowlerStats.noBalls || 0}</strong></span>
              <span>Career Wkts: <strong className="text-white">{bowler?.tournamentWickets || 0}</strong></span>
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
    </>
  );
};
