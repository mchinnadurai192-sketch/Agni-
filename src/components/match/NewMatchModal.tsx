import React, { useState } from 'react';
import { Trophy, Plus, RefreshCw, Check, X, Flame, Shield, ArrowRight } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { Match, Team } from '../../types/cricket';
import { TEAM_AGNI_BOYS, TEAM_THAMIYANUR_TITANS } from '../../data/initialData';

interface NewMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PRESET_MATCHES: { id: string; title: string; tournament: string; teamA: string; teamB: string; summary: string; totalOvers: number }[] = [
  {
    id: 'match-agni-final-2026',
    title: 'THAMIYANUR AGNI SUPER 6 — GRAND FINAL',
    tournament: 'Agni Super 6 Cup Season 4',
    teamA: 'AGNI BOYS',
    teamB: 'THAMIYANUR TITANS',
    summary: 'AGNI BOYS 64/2 (4.3 ov) · High intensity death over action in 6-over match',
    totalOvers: 6,
  },
  {
    id: 'match-derby-t10',
    title: 'THAMIYANUR NIGHT DERBY — T10 CUP',
    tournament: 'Agni Floodlight Super Series',
    teamA: 'SALEM STRIKERS',
    teamB: 'AGNI FIREBIRDS',
    summary: 'Chasing 108 runs · Exciting powerplay in progress',
    totalOvers: 10,
  },
  {
    id: 'match-championship-semi',
    title: 'TAMIL NADU RURAL TROPHY — 6 OVERS',
    tournament: 'State Rural Invitational 2026',
    teamA: 'THAMIYANUR TITANS',
    teamB: 'CAUVERY LIONS',
    summary: 'Match starts fresh: 0/0 (0.0 ov) · 6 overs per innings',
    totalOvers: 6,
  },
];

export const NewMatchModal: React.FC<NewMatchModalProps> = ({ isOpen, onClose }) => {
  const { match, startNewMatchCustom, switchPresetMatch } = useCricket();

  const [activeTab, setActiveTab] = useState<'PRESETS' | 'CUSTOM'>('PRESETS');

  // Custom Match Form State
  const [matchTitle, setMatchTitle] = useState('THAMIYANUR SUPER 6 CUP — MATCH 12');
  const [tournamentName, setTournamentName] = useState('Agni Champions League 2026');
  const [venue, setVenue] = useState('Thamiyanur Agni Sports Arena');
  const [totalOvers, setTotalOvers] = useState(6);
  const [teamAName, setTeamAName] = useState('AGNI BOYS');
  const [teamBName, setTeamBName] = useState('THAMIYANUR WARRIORS');
  const [tossWinner, setTossWinner] = useState<'TEAM_A' | 'TEAM_B'>('TEAM_A');
  const [tossDecision, setTossDecision] = useState<'BAT' | 'BOWL'>('BAT');

  if (!isOpen) return null;

  const handleStartCustomMatch = (e: React.FormEvent) => {
    e.preventDefault();
    startNewMatchCustom({
      title: matchTitle,
      tournament: tournamentName,
      venue,
      totalOvers,
      teamAName,
      teamBName,
      tossWinner,
      tossDecision,
    });
    onClose();
  };

  const handleSelectPreset = (presetId: string) => {
    switchPresetMatch(presetId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-orange-500" />
            <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-wide text-white">
              Switch or Create Match
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 p-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('PRESETS')}
            className={`flex-1 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'PRESETS'
                ? 'bg-orange-600 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            Available Live Matches
          </button>
          <button
            onClick={() => setActiveTab('CUSTOM')}
            className={`flex-1 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors ${
              activeTab === 'CUSTOM'
                ? 'bg-orange-600 text-white shadow'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            + Start Brand New Match (0/0)
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {activeTab === 'PRESETS' ? (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-zinc-400 block mb-2">
                Select an active tournament match to broadcast:
              </span>

              {PRESET_MATCHES.map((preset) => {
                const isCurrent = match.id === preset.id;
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectPreset(preset.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isCurrent
                        ? 'bg-orange-950/20 border-orange-500/80 ring-1 ring-orange-500/50 shadow'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {preset.totalOvers} OVERS
                        </span>
                        <span className="text-xs text-orange-400 font-semibold">
                          {preset.tournament}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                            <Check className="w-3 h-3" /> ACTIVE ON AIR
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-black text-white">{preset.title}</h3>
                      <p className="text-xs text-zinc-400">{preset.summary}</p>
                    </div>

                    <button
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : 'bg-orange-600 hover:bg-orange-500 text-white'
                      }`}
                    >
                      <span>{isCurrent ? 'Current' : 'Switch'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <form onSubmit={handleStartCustomMatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Match Title</label>
                  <input
                    type="text"
                    value={matchTitle}
                    onChange={(e) => setMatchTitle(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Tournament / League</label>
                  <input
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Batting First (Team A)</label>
                  <input
                    type="text"
                    value={teamAName}
                    onChange={(e) => setTeamAName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Bowling First (Team B)</label>
                  <input
                    type="text"
                    value={teamBName}
                    onChange={(e) => setTeamBName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Overs Per Innings</label>
                  <select
                    value={totalOvers}
                    onChange={(e) => setTotalOvers(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium"
                  >
                    <option value={6}>6 Overs (Super 6 Power Match)</option>
                    <option value={5}>5 Overs (Super 5)</option>
                    <option value={10}>10 Overs (T10)</option>
                    <option value={15}>15 Overs</option>
                    <option value={20}>20 Overs (T20)</option>
                    <option value={50}>50 Overs (ODI)</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Venue / Ground</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium"
                  />
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="font-bold text-zinc-200 uppercase tracking-wide block">Toss Decision</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Toss Won By:</span>
                    <select
                      value={tossWinner}
                      onChange={(e) => setTossWinner(e.target.value as 'TEAM_A' | 'TEAM_B')}
                      className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white font-medium"
                    >
                      <option value="TEAM_A">{teamAName}</option>
                      <option value="TEAM_B">{teamBName}</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[11px] text-zinc-400 block mb-1">Elected To:</span>
                    <select
                      value={tossDecision}
                      onChange={(e) => setTossDecision(e.target.value as 'BAT' | 'BOWL')}
                      className="w-full p-2 rounded bg-zinc-800 border border-zinc-700 text-white font-medium"
                    >
                      <option value="BAT">Bat First</option>
                      <option value="BOWL">Bowl First</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Start Match (0/0, Over 0.0)</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
