import React, { useState } from 'react';
import { useCricket } from '../../context/CricketContext';

export const ScorecardTab: React.FC = () => {
  const { match } = useCricket();
  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(1);

  const battingTeam = selectedInnings === 1 ? match.teamA : match.teamB;
  const bowlingTeam = selectedInnings === 1 ? match.teamB : match.teamA;
  const currentInnings = selectedInnings === 1 ? match.innings1 : (match.innings2 || match.innings1);

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl text-xs">
      {/* Innings Selector Tabs */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedInnings(1)}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              selectedInnings === 1
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {match.teamA.shortName} Innings (1st)
          </button>
          <button
            onClick={() => setSelectedInnings(2)}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              selectedInnings === 2
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {match.teamB.shortName} Innings (2nd)
          </button>
        </div>

        <div className="font-mono-numbers font-bold text-sm text-white">
          {currentInnings.totalRuns}/{currentInnings.wickets} ({currentInnings.overs} ov)
        </div>
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
                  className={`hover:bg-zinc-800/40 transition-colors ${
                    isCurrentlyBatting ? 'bg-orange-950/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-4 font-medium text-zinc-100 flex items-center gap-1.5">
                    <span>{player.name}</span>
                    {player.isCaptain && <span className="text-[10px] text-amber-400 font-bold">(c)</span>}
                    {player.isWicketKeeper && <span className="text-[10px] text-blue-400 font-bold">(wk)</span>}
                    {isCurrentlyBatting && (
                      <span className="text-[10px] text-orange-400 font-bold">*</span>
                    )}
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
                  <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-400">
                    {hasBatted ? stats.fours : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-400">
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
              .filter((p) => match.bowlingStats[p.id])
              .map((bowler) => {
                const stats = match.bowlingStats[bowler.id];
                const isCurrent = bowler.id === match.activeBowlerId;
                return (
                  <tr
                    key={bowler.id}
                    className={`hover:bg-zinc-800/40 transition-colors ${
                      isCurrent ? 'bg-orange-950/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-medium text-zinc-100 flex items-center gap-1.5">
                      <span>{bowler.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] text-orange-400 font-bold uppercase">(BOWLING)</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-300">{stats.overs}</td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-400">{stats.maidens}</td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-300">{stats.runsConceded}</td>
                    <td className="py-2.5 px-3 text-right font-bold font-mono-numbers text-red-400">{stats.wickets}</td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-emerald-400 font-medium">{stats.economy}</td>
                    <td className="py-2.5 px-3 text-right font-mono-numbers text-zinc-400">{stats.wides}</td>
                    <td className="py-2.5 px-4 text-right font-mono-numbers text-zinc-400">{stats.noBalls}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
