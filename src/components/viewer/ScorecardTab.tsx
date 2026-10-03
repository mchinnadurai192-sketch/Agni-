import React, { useState } from 'react';
import { useCricket } from '../../context/CricketContext';
import { Player } from '../../types/cricket';
import { PlayerDetailCardModal } from '../common/PlayerDetailCardModal';
import { Info, Target, Flame } from 'lucide-react';

export const ScorecardTab: React.FC = () => {
  const { match } = useCricket();
  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  const battingTeam = selectedInnings === 1 ? match.teamA : match.teamB;
  const bowlingTeam = selectedInnings === 1 ? match.teamB : match.teamA;
  const currentInnings = selectedInnings === 1 ? match.innings1 : (match.innings2 || match.innings1);

  return (
    <>
      {selectedPlayer && (
        <PlayerDetailCardModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
        />
      )}

      <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl text-xs">
        {/* Innings Selector Tabs */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedInnings(1)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedInnings === 1
                  ? 'bg-orange-600 text-white shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {match.teamA.name} (1st Innings)
            </button>
            <button
              onClick={() => setSelectedInnings(2)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedInnings === 2
                  ? 'bg-orange-600 text-white shadow'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {match.teamB.name} (2nd Innings)
            </button>
          </div>

          <div className="font-mono-numbers font-bold text-sm text-white">
            {currentInnings.totalRuns}/{currentInnings.wickets} ({currentInnings.overs} ov)
          </div>
        </div>

        {/* Batting Table Header */}
        <div className="px-4 py-2 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-[11px] text-orange-400 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5" />
            Batting — {battingTeam.name}
          </span>
          <span className="text-[10px] text-zinc-500">Click any player to inspect complete details</span>
        </div>

        {/* Batting Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/70 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-4">Batter</th>
                <th className="py-2.5 px-3">Dismissal</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">R</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">B</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">4s</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">6s</th>
                <th className="py-2.5 px-4 text-right font-mono-numbers">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {battingTeam.players.map((player) => {
                const stats = match.battingStats[player.id];
                const isCurrentlyBatting = player.id === match.activeStrikerId || player.id === match.activeNonStrikerId;
                const hasBatted = !!stats;

                return (
                  <tr
                    key={player.id}
                    onClick={() => setSelectedPlayer(player)}
                    className={`hover:bg-zinc-800/50 transition-colors cursor-pointer group ${
                      isCurrentlyBatting ? 'bg-orange-950/10' : ''
                    }`}
                    title="Click to view player details"
                  >
                    <td className="py-2.5 px-4 font-medium text-zinc-100">
                      <div className="flex items-center gap-2">
                        <span className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono-numbers font-bold text-orange-400 text-[10px] shrink-0">
                          {player.jerseyNumber}
                        </span>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="group-hover:text-orange-400 font-bold transition-colors">
                              {player.name}
                            </span>
                            {player.isCaptain && <span className="text-[10px] text-amber-400 font-bold">(c)</span>}
                            {player.isWicketKeeper && <span className="text-[10px] text-blue-400 font-bold">(wk)</span>}
                            {isCurrentlyBatting && (
                              <span className="text-[10px] text-orange-400 font-bold">*</span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-500">
                            {player.battingStyle} · {player.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {stats?.dismissal ? (
                        <span className="text-zinc-400">{stats.dismissal}</span>
                      ) : isCurrentlyBatting ? (
                        <span className="text-emerald-400 font-semibold">not out</span>
                      ) : (
                        <span className="text-zinc-500 italic">yet to bat</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono-numbers text-white">
                      {hasBatted ? stats.runs : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-400">
                      {hasBatted ? stats.balls : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-blue-400 font-semibold">
                      {hasBatted ? stats.fours : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-purple-400 font-semibold">
                      {hasBatted ? stats.sixes : '-'}
                    </td>
                    <td className="py-2.5 px-4 text-right font-mono-numbers font-medium text-orange-400">
                      {hasBatted ? stats.strikeRate : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Extras & Totals Strip */}
        <div className="p-4 bg-zinc-950/80 border-t border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-semibold text-zinc-300">Extras: </span>
            <span className="text-zinc-400 font-mono-numbers">
              {currentInnings.extras.total} (b {currentInnings.extras.byes}, lb {currentInnings.extras.legByes}, w {currentInnings.extras.wides}, nb {currentInnings.extras.noBalls})
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-zinc-300">Total: </span>
            <span className="text-base font-bold text-white font-mono-numbers">
              {currentInnings.totalRuns}/{currentInnings.wickets}
            </span>
            <span className="text-zinc-400 font-mono-numbers">
              ({currentInnings.overs} Ov, CRR: {currentInnings.currentRunRate})
            </span>
          </div>
        </div>

        {/* Bowling Table Header */}
        <div className="px-4 py-2 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between">
          <span className="font-bold uppercase tracking-wider text-[11px] text-blue-400 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Bowling — {bowlingTeam.name}
          </span>
          <span className="text-[10px] text-zinc-500">Click any bowler to inspect complete details</span>
        </div>

        {/* Bowling Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-950/70 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="py-2.5 px-4">Bowler</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">O</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">M</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">R</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">W</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">ECON</th>
                <th className="py-2.5 px-3 text-right font-mono-numbers">WD</th>
                <th className="py-2.5 px-4 text-right font-mono-numbers">NB</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {bowlingTeam.players
                .filter((p) => match.bowlingStats[p.id] || p.id === match.activeBowlerId)
                .map((bowler) => {
                  const stats = match.bowlingStats[bowler.id];
                  const isCurrent = bowler.id === match.activeBowlerId;
                  return (
                    <tr
                      key={bowler.id}
                      onClick={() => setSelectedPlayer(bowler)}
                      className={`hover:bg-zinc-800/50 transition-colors cursor-pointer group ${
                        isCurrent ? 'bg-blue-950/10' : ''
                      }`}
                      title="Click to view bowler details"
                    >
                      <td className="py-2.5 px-4 font-medium text-zinc-100">
                        <div className="flex items-center gap-2">
                          <span className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono-numbers font-bold text-blue-400 text-[10px] shrink-0">
                            {bowler.jerseyNumber}
                          </span>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="group-hover:text-blue-400 font-bold transition-colors">
                                {bowler.name}
                              </span>
                              {isCurrent && (
                                <span className="text-[10px] text-blue-400 font-bold uppercase">(BOWLING)</span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {bowler.bowlingStyle}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-300 font-bold">{stats?.overs || 0}</td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-400">{stats?.maidens || 0}</td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-300 font-bold">{stats?.runsConceded || 0}</td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono-numbers text-red-400 text-sm">{stats?.wickets || 0}</td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers text-emerald-400 font-medium">{stats?.economy || '0.0'}</td>
                      <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-400">{stats?.wides || 0}</td>
                      <td className="py-2.5 px-4 text-right font-mono-numbers text-zinc-400">{stats?.noBalls || 0}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
