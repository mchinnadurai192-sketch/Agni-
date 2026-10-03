import React, { useState } from 'react';
import {
  Trophy,
  X,
  Users,
  Shield,
  Activity,
  Flame,
  Award,
  Zap,
  Target,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { Player, Team } from '../../types/cricket';
import { PlayerDetailCardModal } from '../common/PlayerDetailCardModal';

interface PlayerScoreboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlayerScoreboardModal: React.FC<PlayerScoreboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { match } = useCricket();
  const [activeTab, setActiveTab] = useState<'SCORECARD' | 'SQUADS'>('SCORECARD');
  const [selectedInnings, setSelectedInnings] = useState<1 | 2>(match.currentInnings as 1 | 2);
  const [selectedSquadTeamId, setSelectedSquadTeamId] = useState<string>(match.teamA.id);
  const [selectedPlayerForDetail, setSelectedPlayerForDetail] = useState<Player | null>(null);

  if (!isOpen) return null;

  const battingTeam = selectedInnings === 1 ? (match?.teamA || { id: 'team-a', name: 'Team A', shortName: 'TMA', color: '#f97316', secondaryColor: '#dc2626', players: [] }) : (match?.teamB || { id: 'team-b', name: 'Team B', shortName: 'TMB', color: '#2563eb', secondaryColor: '#1d4ed8', players: [] });
  const bowlingTeam = selectedInnings === 1 ? (match?.teamB || { id: 'team-b', name: 'Team B', shortName: 'TMB', color: '#2563eb', secondaryColor: '#1d4ed8', players: [] }) : (match?.teamA || { id: 'team-a', name: 'Team A', shortName: 'TMA', color: '#f97316', secondaryColor: '#dc2626', players: [] });
  const currentInnings = selectedInnings === 1 ? match?.innings1 : (match?.innings2 || match?.innings1);

  const squadTeam: Team = selectedSquadTeamId === match?.teamA?.id ? (match?.teamA || battingTeam) : (match?.teamB || bowlingTeam);

  // Fall of wickets demo list
  const fallOfWickets = [
    { wkt: 1, score: '12/1', over: '1.1', batter: 'Dinesh Karthik' },
    { wkt: 2, score: '23/2', over: '1.5', batter: 'Kavin Selvam' },
  ];

  return (
    <>
      {selectedPlayerForDetail && (
        <PlayerDetailCardModal
          player={selectedPlayerForDetail}
          onClose={() => setSelectedPlayerForDetail(null)}
        />
      )}

      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto select-none animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-display tracking-tight text-white uppercase">
                  THAMIYANUR AGNI — PLAYER SCOREBOARD & SQUADS
                </h2>
                <span className="px-2 py-0.5 rounded bg-orange-600 text-white font-mono text-[10px] font-bold uppercase">
                  6-OVERS MATCH
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {match.title} · {match.venue}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Close Scoreboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-2.5 bg-zinc-950/80 border-b border-zinc-800/80 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('SCORECARD')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'SCORECARD'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Full Player Scoreboard</span>
            </button>
            <button
              onClick={() => setActiveTab('SQUADS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'SQUADS'
                  ? 'bg-orange-600 text-white shadow-lg'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Player Profiles & Squads</span>
            </button>
          </div>

          {activeTab === 'SCORECARD' && (
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setSelectedInnings(1)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedInnings === 1
                    ? 'bg-orange-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {match.teamA.shortName} Innings (1st)
              </button>
              <button
                onClick={() => setSelectedInnings(2)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedInnings === 2
                    ? 'bg-orange-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {match.teamB.shortName} Innings (2nd)
              </button>
            </div>
          )}

          {activeTab === 'SQUADS' && (
            <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setSelectedSquadTeamId(match.teamA.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedSquadTeamId === match.teamA.id
                    ? 'bg-orange-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {match.teamA.name}
              </button>
              <button
                onClick={() => setSelectedSquadTeamId(match.teamB.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedSquadTeamId === match.teamB.id
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {match.teamB.name}
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'SCORECARD' ? (
            <>
              {/* Innings Score Summary Card */}
              <div className="rounded-xl bg-gradient-to-r from-orange-950/40 via-zinc-950 to-zinc-900 p-4 border border-orange-500/30 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">
                    INNINGS {selectedInnings} OF {match.totalOvers} OVERS
                  </span>
                  <h3 className="text-2xl font-black font-display text-white mt-0.5">
                    {battingTeam.name}
                  </h3>
                  <div className="flex items-baseline gap-3 mt-1 font-mono-numbers">
                    <span className="text-4xl font-black text-white">
                      {currentInnings.totalRuns}/{currentInnings.wickets}
                    </span>
                    <span className="text-lg font-bold text-orange-400">
                      ({currentInnings.overs} / {match.totalOvers} ov)
                    </span>
                    <span className="text-xs text-zinc-400">
                      Run Rate: <strong className="text-zinc-200">{currentInnings.currentRunRate}</strong>
                    </span>
                  </div>
                </div>

                {/* Extras & Partnership */}
                <div className="flex flex-col gap-1 text-xs font-mono-numbers bg-zinc-950/70 p-3 rounded-lg border border-zinc-800">
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>Current Partnership:</span>
                    <span className="text-white font-bold">
                      {match.currentPartnership.runs} runs ({match.currentPartnership.balls}b)
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-zinc-400">
                    <span>Total Extras:</span>
                    <span className="text-amber-400 font-bold">
                      {currentInnings.extras.total} (wd {currentInnings.extras.wides}, nb {currentInnings.extras.noBalls}, b {currentInnings.extras.byes}, lb {currentInnings.extras.legByes})
                    </span>
                  </div>
                </div>
              </div>

              {/* 1. Complete Batting Scoreboard Table */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-xs text-zinc-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    Batting Scoreboard — {battingTeam.name}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    R: Runs · B: Balls · SR: Strike Rate
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800">
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
                    <tbody className="divide-y divide-zinc-800/60 font-mono-numbers">
                      {battingTeam.players.map((player) => {
                        const stats = match?.battingStats?.[player.id];
                        const isStriker = player.id === match?.activeStrikerId;
                        const isNonStriker = player.id === match?.activeNonStrikerId;
                        const isCurrentlyBatting = isStriker || isNonStriker;
                        const hasBatted = !!stats;

                        return (
                          <tr
                            key={player.id}
                            onClick={() => setSelectedPlayerForDetail(player)}
                            className={`hover:bg-zinc-800/60 transition-colors cursor-pointer group ${
                              isCurrentlyBatting ? 'bg-orange-950/20' : ''
                            }`}
                            title="Click to view complete player details"
                          >
                            <td className="py-3 px-4 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-orange-400 shrink-0 font-mono-numbers">
                                  {player.jerseyNumber}
                                </span>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5 font-semibold text-white">
                                    <span>{player.name}</span>
                                    {player.isCaptain && (
                                      <span className="text-[10px] text-amber-400 font-bold bg-amber-950/60 px-1 rounded border border-amber-600/40">
                                        C
                                      </span>
                                    )}
                                    {player.isWicketKeeper && (
                                      <span className="text-[10px] text-blue-400 font-bold bg-blue-950/60 px-1 rounded border border-blue-600/40">
                                        WK
                                      </span>
                                    )}
                                    {isStriker && (
                                      <span className="text-orange-400 font-black text-xs">* (Strike)</span>
                                    )}
                                    {isNonStriker && (
                                      <span className="text-zinc-400 font-semibold text-xs">(Non-Strike)</span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-sans">
                                    {player.role.replace('_', ' ')} · {player.battingStyle}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-zinc-300 font-sans">
                              {stats?.dismissal ? (
                                <span className="text-zinc-300 font-medium">{stats.dismissal}</span>
                              ) : isCurrentlyBatting ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-600/60 font-bold text-[11px]">
                                  not out
                                </span>
                              ) : (
                                <span className="text-zinc-500 italic">yet to bat</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right font-black text-sm text-white">
                              {hasBatted ? stats.runs : '-'}
                            </td>
                            <td className="py-3 px-3 text-right text-zinc-300">
                              {hasBatted ? stats.balls : '-'}
                            </td>
                            <td className="py-3 px-3 text-right text-blue-400 font-bold">
                              {hasBatted ? stats.fours : '-'}
                            </td>
                            <td className="py-3 px-3 text-right text-purple-400 font-bold">
                              {hasBatted ? stats.sixes : '-'}
                            </td>
                            <td className="py-3 px-4 text-right font-bold text-orange-400">
                              {hasBatted ? stats.strikeRate.toFixed(1) : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2. Complete Bowling Scoreboard Table */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider text-xs text-zinc-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-blue-400" />
                    Bowling Scoreboard — {bowlingTeam.name}
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    O: Overs · M: Maidens · R: Runs · W: Wickets · Econ: Economy
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-950 text-zinc-400 font-bold uppercase tracking-wider text-[11px] border-b border-zinc-800">
                      <tr>
                        <th className="py-2.5 px-4">Bowler</th>
                        <th className="py-2.5 px-3 text-right font-mono-numbers">O</th>
                        <th className="py-2.5 px-3 text-right font-mono-numbers">M</th>
                        <th className="py-2.5 px-3 text-right font-mono-numbers">R</th>
                        <th className="py-2.5 px-3 text-right font-mono-numbers">W</th>
                        <th className="py-2.5 px-3 text-right font-mono-numbers">Econ</th>
                        <th className="py-2.5 px-3 text-right font-mono-numbers">Dots</th>
                        <th className="py-2.5 px-3 text-right font-mono-numbers">Wd</th>
                        <th className="py-2.5 px-4 text-right font-mono-numbers">Nb</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono-numbers">
                      {bowlingTeam.players.map((player) => {
                        const stats = match?.bowlingStats?.[player.id];
                        const isCurrentBowler = player.id === match?.activeBowlerId;
                        const hasBowled = !!stats && stats.overs > 0;

                        if (!hasBowled && !isCurrentBowler) return null;

                        return (
                          <tr
                            key={player.id}
                            onClick={() => setSelectedPlayerForDetail(player)}
                            className={`hover:bg-zinc-800/60 transition-colors cursor-pointer group ${
                              isCurrentBowler ? 'bg-blue-950/20' : ''
                            }`}
                            title="Click to view complete player details"
                          >
                            <td className="py-3 px-4 font-sans">
                              <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-bold text-blue-400 shrink-0 font-mono-numbers">
                                  {player.jerseyNumber}
                                </span>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1.5 font-semibold text-white">
                                    <span>{player.name}</span>
                                    {isCurrentBowler && (
                                      <span className="text-blue-400 font-black text-xs">
                                        * (Bowling Now)
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-sans">
                                    {player.bowlingStyle}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right text-white font-bold">
                              {stats?.overs || 0}
                            </td>
                            <td className="py-3 px-3 text-right text-zinc-400">
                              {stats?.maidens || 0}
                            </td>
                            <td className="py-3 px-3 text-right text-white font-bold">
                              {stats?.runsConceded || 0}
                            </td>
                            <td className="py-3 px-3 text-right text-red-400 font-black text-sm">
                              {stats?.wickets || 0}
                            </td>
                            <td className="py-3 px-3 text-right text-orange-400 font-semibold">
                              {stats?.economy ? stats.economy.toFixed(1) : '-'}
                            </td>
                            <td className="py-3 px-3 text-right text-emerald-400">
                              {stats?.dots || 0}
                            </td>
                            <td className="py-3 px-3 text-right text-zinc-400">
                              {stats?.wides || 0}
                            </td>
                            <td className="py-3 px-4 text-right text-zinc-400">
                              {stats?.noBalls || 0}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Fall of Wickets Breakdown */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-800 p-4">
                <span className="font-bold uppercase tracking-wider text-xs text-zinc-300 block mb-2.5">
                  Fall of Wickets
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 text-xs font-mono-numbers">
                  {fallOfWickets.map((fow) => (
                    <div
                      key={fow.wkt}
                      className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-white">{fow.batter}</span>
                        <span className="text-[10px] text-zinc-400">Over {fow.over}</span>
                      </div>
                      <span className="font-black text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded border border-orange-600/40">
                        {fow.score}
                      </span>
                    </div>
                  ))}
                  {match.lastWicket && (
                    <div className="p-2.5 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center justify-between col-span-2">
                      <div className="flex flex-col">
                        <span className="font-bold text-red-200">Latest Wicket: {match.lastWicket.playerName}</span>
                        <span className="text-[10px] text-red-300">
                          {match.lastWicket.runs} runs ({match.lastWicket.balls}b) · {match.lastWicket.scoreAtFall}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                        DISMISSED
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Squads & Player Profiles View */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black font-display text-white">
                    {squadTeam.name} SQUAD ({squadTeam.players.length} Players)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Official verified player registrations and tournament metrics
                  </p>
                </div>
              </div>

              {/* Players Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {squadTeam.players.map((player) => (
                  <div
                    key={player.id}
                    onClick={() => setSelectedPlayerForDetail(player)}
                    className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-orange-500/60 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Bar: Jersey & Roles */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="h-9 w-9 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black font-mono-numbers text-orange-400 text-sm shadow-inner group-hover:bg-orange-600 group-hover:text-white transition-colors">
                          {player.jerseyNumber}
                        </div>

                        <div className="flex items-center gap-1">
                          {player.isCaptain && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                              CAPTAIN
                            </span>
                          )}
                          {player.isWicketKeeper && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[10px] border border-blue-500/30">
                              WICKET-KEEPER
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-semibold">
                            {player.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Player Name */}
                      <h4 className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors">
                        {player.name}
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        {player.battingStyle} · {player.bowlingStyle}
                      </p>

                      {/* Bio */}
                      {player.bio && (
                        <p className="text-[11px] text-zinc-400 mt-2 line-clamp-2 italic">
                          "{player.bio}"
                        </p>
                      )}
                    </div>

                    {/* Quick Stats Pill */}
                    <div className="mt-3 pt-2.5 border-t border-zinc-850 flex items-center justify-between text-xs font-mono-numbers text-zinc-400">
                      <div>
                        <span>Runs: </span>
                        <strong className="text-white">{player.tournamentRuns || 0}</strong>
                        {player.highestScore && (
                          <span className="text-[10px] text-zinc-500 ml-1">({player.highestScore})</span>
                        )}
                      </div>
                      <div>
                        <span>Wkts: </span>
                        <strong className="text-white">{player.tournamentWickets || 0}</strong>
                        {player.bestBowling && (
                          <span className="text-[10px] text-zinc-500 ml-1">({player.bestBowling})</span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between shrink-0 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Live Official Tournament Record · View-Only Mode</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-semibold transition-colors"
          >
            Close Scoreboard
          </button>
        </div>
      </div>
    </div>
    </>
  );
};
