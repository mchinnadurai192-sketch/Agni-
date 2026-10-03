import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Edit3,
  Save,
  Plus,
  Shield,
  Award,
  Zap,
  Check,
  Search,
  RotateCcw,
  Trash2,
  Tv,
  ArrowRight,
  Target,
  Sparkles,
  Flame,
  Info,
  X,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { Player, Team } from '../../types/cricket';
import { PlayerDetailCardModal } from '../common/PlayerDetailCardModal';

export const PlayerDetailsEditor: React.FC = () => {
  const {
    match,
    updatePlayerDetails,
    updatePlayerMatchStats,
    addNewPlayerToTeam,
    removePlayerFromTeam,
    setActiveStriker,
    setActiveNonStriker,
    setActiveBowler,
    operateLowerThird,
  } = useCricket();

  const [selectedTeamId, setSelectedTeamId] = useState<string>(match.teamA.id);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [previewPlayerForModal, setPreviewPlayerForModal] = useState<Player | null>(null);

  // Form state for editing player
  const [editFormData, setEditFormData] = useState<Partial<Player>>({});
  const [editBattingRuns, setEditBattingRuns] = useState<number>(0);
  const [editBattingBalls, setEditBattingBalls] = useState<number>(0);
  const [editBattingFours, setEditBattingFours] = useState<number>(0);
  const [editBattingSixes, setEditBattingSixes] = useState<number>(0);
  const [editDismissal, setEditDismissal] = useState<string>('');

  const [editBowlingOvers, setEditBowlingOvers] = useState<number>(0);
  const [editBowlingRuns, setEditBowlingRuns] = useState<number>(0);
  const [editBowlingWickets, setEditBowlingWickets] = useState<number>(0);
  const [editBowlingMaidens, setEditBowlingMaidens] = useState<number>(0);

  // New player modal state
  const [isAddingPlayer, setIsAddingPlayer] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('');
  const [newPlayerShortName, setNewPlayerShortName] = useState<string>('');
  const [newPlayerJersey, setNewPlayerJersey] = useState<number>(10);
  const [newPlayerTeamId, setNewPlayerTeamId] = useState<string>(match.teamA.id);
  const [newPlayerRole, setNewPlayerRole] = useState<Player['role']>('BATTER');
  const [newPlayerBattingStyle, setNewPlayerBattingStyle] = useState<Player['battingStyle']>('Right Hand Bat');
  const [newPlayerBowlingStyle, setNewPlayerBowlingStyle] = useState<Player['bowlingStyle']>('Right Arm Medium');
  const [newPlayerIsCaptain, setNewPlayerIsCaptain] = useState<boolean>(false);
  const [newPlayerIsWK, setNewPlayerIsWK] = useState<boolean>(false);
  const [newPlayerTournamentRuns, setNewPlayerTournamentRuns] = useState<number>(0);
  const [newPlayerTournamentWickets, setNewPlayerTournamentWickets] = useState<number>(0);
  const [newPlayerHighestScore, setNewPlayerHighestScore] = useState<string>('45*');
  const [newPlayerBestBowling, setNewPlayerBestBowling] = useState<string>('3/18');
  const [newPlayerBio, setNewPlayerBio] = useState<string>('');
  const [newPlayerAssignment, setNewPlayerAssignment] = useState<'BENCH' | 'STRIKER' | 'NON_STRIKER' | 'BOWLER'>('BENCH');

  const selectedTeam: Team = selectedTeamId === match.teamA.id ? match.teamA : match.teamB;

  const filteredPlayers = selectedTeam.players.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.jerseyNumber.toString().includes(searchTerm)
  );

  const handleStartEdit = (player: Player) => {
    setEditingPlayerId(player.id);
    setEditFormData({ ...player });

    const bStats = match.battingStats[player.id];
    setEditBattingRuns(bStats?.runs || 0);
    setEditBattingBalls(bStats?.balls || 0);
    setEditBattingFours(bStats?.fours || 0);
    setEditBattingSixes(bStats?.sixes || 0);
    setEditDismissal(bStats?.dismissal || '');

    const boStats = match.bowlingStats[player.id];
    setEditBowlingOvers(boStats?.overs || 0);
    setEditBowlingRuns(boStats?.runsConceded || 0);
    setEditBowlingWickets(boStats?.wickets || 0);
    setEditBowlingMaidens(boStats?.maidens || 0);
  };

  const handleSaveEdit = (playerId: string) => {
    // 1. Update player metadata
    updatePlayerDetails(selectedTeamId, playerId, {
      name: editFormData.name,
      shortName: editFormData.shortName || editFormData.name?.slice(0, 10),
      jerseyNumber: Number(editFormData.jerseyNumber),
      role: editFormData.role,
      battingStyle: editFormData.battingStyle,
      bowlingStyle: editFormData.bowlingStyle,
      isCaptain: editFormData.isCaptain,
      isWicketKeeper: editFormData.isWicketKeeper,
      tournamentRuns: Number(editFormData.tournamentRuns || 0),
      tournamentWickets: Number(editFormData.tournamentWickets || 0),
      highestScore: editFormData.highestScore,
      bestBowling: editFormData.bestBowling,
      bio: editFormData.bio,
    });

    // 2. Update current match batting & bowling figures
    const calculatedSR = editBattingBalls > 0 ? (editBattingRuns / editBattingBalls) * 100 : 0;
    const calculatedEcon = editBowlingOvers > 0 ? editBowlingRuns / editBowlingOvers : 0;

    updatePlayerMatchStats(
      playerId,
      {
        runs: editBattingRuns,
        balls: editBattingBalls,
        fours: editBattingFours,
        sixes: editBattingSixes,
        strikeRate: parseFloat(calculatedSR.toFixed(1)),
        isOut: !!editDismissal.trim(),
        dismissal: editDismissal.trim() || undefined,
      },
      {
        overs: editBowlingOvers,
        maidens: editBowlingMaidens,
        runsConceded: editBowlingRuns,
        wickets: editBowlingWickets,
        economy: parseFloat(calculatedEcon.toFixed(1)),
      }
    );

    setEditingPlayerId(null);
  };

  const handleDeletePlayer = (playerId: string, playerName: string) => {
    if (window.confirm(`Are you sure you want to remove ${playerName} from the squad?`)) {
      removePlayerFromTeam(selectedTeamId, playerId);
    }
  };

  const handleCreateNewPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim()) return;

    const targetTeam = newPlayerTeamId === match.teamA.id ? match.teamA : match.teamB;

    const newPlayer: Player = {
      id: `p-${targetTeam.shortName.toLowerCase()}-${Date.now()}`,
      name: newPlayerName.trim(),
      shortName: newPlayerShortName.trim() || newPlayerName.trim().slice(0, 10),
      teamId: newPlayerTeamId,
      jerseyNumber: Number(newPlayerJersey),
      role: newPlayerRole,
      battingStyle: newPlayerBattingStyle,
      bowlingStyle: newPlayerBowlingStyle,
      isCaptain: newPlayerIsCaptain,
      isWicketKeeper: newPlayerIsWK,
      tournamentRuns: Number(newPlayerTournamentRuns),
      tournamentWickets: Number(newPlayerTournamentWickets),
      highestScore: newPlayerHighestScore || '0',
      bestBowling: newPlayerBestBowling || '-',
      bio: newPlayerBio || 'Registered tournament squad player.',
    };

    addNewPlayerToTeam(newPlayerTeamId, newPlayer, newPlayerAssignment);
    setIsAddingPlayer(false);

    // Reset Form
    setNewPlayerName('');
    setNewPlayerShortName('');
    setNewPlayerJersey(Math.floor(Math.random() * 90 + 10));
    setNewPlayerBio('');
    setNewPlayerAssignment('BENCH');
  };

  const handlePushPlayerToVideo = (player: Player) => {
    const batting = match.battingStats[player.id];
    const bowling = match.bowlingStats[player.id];

    if (player.role === 'BOWLER' || (bowling && bowling.overs > 0)) {
      operateLowerThird({
        type: 'BOWLER_SPOTLIGHT',
        playerId: player.id,
        title: `${player.name.toUpperCase()} (JRSY #${player.jerseyNumber})`,
        subtitle: `${player.bowlingStyle} · ${bowling ? `${bowling.wickets}/${bowling.runsConceded} (${bowling.overs} ov)` : 'Bowler'}`,
        extraInfo: `Economy: ${bowling ? bowling.economy : '0.0'} · Tournament Wickets: ${player.tournamentWickets || 0}`,
      });
    } else {
      operateLowerThird({
        type: 'BATTER_SPOTLIGHT',
        playerId: player.id,
        title: `${player.name.toUpperCase()} (JRSY #${player.jerseyNumber})`,
        subtitle: `${player.battingStyle} · ${batting ? `${batting.runs} runs (${batting.balls}b, SR: ${batting.strikeRate})` : 'Batter'}`,
        extraInfo: `4s: ${batting?.fours || 0} · 6s: ${batting?.sixes || 0} · Best: ${player.highestScore || '0'}`,
      });
    }
  };

  return (
    <>
      {/* Player Detail Card Modal */}
      {previewPlayerForModal && (
        <PlayerDetailCardModal
          player={previewPlayerForModal}
          onClose={() => setPreviewPlayerForModal(null)}
          onEditInAdmin={(p) => handleStartEdit(p)}
        />
      )}

      <div className="flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 p-4 sm:p-6 shadow-2xl space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/80 px-2.5 py-0.5 rounded border border-orange-500/40">
                OFFICIAL TEAM ROSTER ENGINE
              </span>
              <h3 className="text-base sm:text-xl font-black font-display tracking-tight text-white uppercase">
                ADD & EDIT ALL PLAYER DETAILS
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Add new players to teams, edit biographies, jersey numbers, styles, and live batting/bowling statistics visible on the scoreboard
            </p>
          </div>

          <button
            onClick={() => {
              setNewPlayerTeamId(selectedTeamId);
              setIsAddingPlayer(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition-all transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Player</span>
          </button>
        </div>

        {/* Team Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setSelectedTeamId(match.teamA.id);
                setEditingPlayerId(null);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                selectedTeamId === match.teamA.id
                  ? 'bg-orange-600 text-white shadow-xl'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Shield className="w-4 h-4 text-orange-400" />
              <span>{match.teamA.name} ({match.teamA.players.length} Players)</span>
            </button>

            <button
              onClick={() => {
                setSelectedTeamId(match.teamB.id);
                setEditingPlayerId(null);
              }}
              className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                selectedTeamId === match.teamB.id
                  ? 'bg-blue-600 text-white shadow-xl'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Shield className="w-4 h-4 text-blue-400" />
              <span>{match.teamB.name} ({match.teamB.players.length} Players)</span>
            </button>
          </div>

          {/* Search Filter */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search player name, jersey, role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-9 pr-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 font-sans"
            />
          </div>
        </div>

        {/* Players List Table / Cards */}
        <div className="space-y-3">
          {filteredPlayers.map((player) => {
            const isEditing = editingPlayerId === player.id;
            const batting = match.battingStats[player.id];
            const bowling = match.bowlingStats[player.id];

            const isStriker = match.activeStrikerId === player.id;
            const isNonStriker = match.activeNonStrikerId === player.id;
            const isBowler = match.activeBowlerId === player.id;

            return (
              <div
                key={player.id}
                className={`rounded-xl border transition-all ${
                  isEditing
                    ? 'bg-zinc-950 border-orange-500 shadow-2xl ring-2 ring-orange-500/40 p-5'
                    : 'bg-zinc-950/70 border-zinc-800/80 hover:border-zinc-700 p-4'
                }`}
              >
                {isEditing ? (
                  /* INLINE EDIT FORM */
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <span className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4" />
                        Editing Player Details: {player.name} (Jersey #{player.jerseyNumber})
                      </span>
                      <button
                        onClick={() => setEditingPlayerId(null)}
                        className="text-xs text-zinc-400 hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>

                    {/* Metadata Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Full Name</label>
                        <input
                          type="text"
                          value={editFormData.name || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Display / Short Name</label>
                        <input
                          type="text"
                          value={editFormData.shortName || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, shortName: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Jersey #</label>
                        <input
                          type="number"
                          value={editFormData.jerseyNumber || 0}
                          onChange={(e) => setEditFormData({ ...editFormData, jerseyNumber: Number(e.target.value) })}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-mono focus:outline-none focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Role</label>
                        <select
                          value={editFormData.role || 'BATTER'}
                          onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value as Player['role'] })}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium focus:outline-none focus:border-orange-500"
                        >
                          <option value="BATTER">Batter</option>
                          <option value="BOWLER">Bowler</option>
                          <option value="ALL_ROUNDER">All-Rounder</option>
                          <option value="WICKET_KEEPER">Wicket-Keeper</option>
                        </select>
                      </div>
                    </div>

                    {/* Styles & Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Batting Style</label>
                        <select
                          value={editFormData.battingStyle || 'Right Hand Bat'}
                          onChange={(e) => setEditFormData({ ...editFormData, battingStyle: e.target.value as Player['battingStyle'] })}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium focus:outline-none"
                        >
                          <option value="Right Hand Bat">Right Hand Bat</option>
                          <option value="Left Hand Bat">Left Hand Bat</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Bowling Style</label>
                        <select
                          value={editFormData.bowlingStyle || 'Right Arm Medium'}
                          onChange={(e) => setEditFormData({ ...editFormData, bowlingStyle: e.target.value as Player['bowlingStyle'] })}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium focus:outline-none"
                        >
                          <option value="Right Arm Fast">Right Arm Fast (Pacer)</option>
                          <option value="Right Arm Medium">Right Arm Medium</option>
                          <option value="Right Arm Off-Spin">Right Arm Off-Spin</option>
                          <option value="Right Arm Leg-Spin">Right Arm Leg-Spin</option>
                          <option value="Left Arm Fast">Left Arm Fast</option>
                          <option value="Left Arm Orthodox">Left Arm Orthodox</option>
                          <option value="Left Arm Leg-Spin">Left Arm Leg-Spin</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Captain / WK</label>
                        <div className="flex items-center gap-3 pt-2">
                          <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!editFormData.isCaptain}
                              onChange={(e) => setEditFormData({ ...editFormData, isCaptain: e.target.checked })}
                              className="rounded accent-orange-500"
                            />
                            <span>Captain</span>
                          </label>

                          <label className="flex items-center gap-1.5 text-zinc-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!editFormData.isWicketKeeper}
                              onChange={(e) => setEditFormData({ ...editFormData, isWicketKeeper: e.target.checked })}
                              className="rounded accent-blue-500"
                            />
                            <span>Keeper</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="text-zinc-400 block mb-1 font-semibold">Short Bio / Highlights</label>
                        <input
                          type="text"
                          value={editFormData.bio || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                          className="w-full py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-700 text-white font-medium focus:outline-none"
                          placeholder="Player bio description..."
                        />
                      </div>
                    </div>

                    {/* Tournament Career Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono-numbers">
                      <div>
                        <label className="text-zinc-400 block mb-1 font-sans">Tournament Runs</label>
                        <input
                          type="number"
                          value={editFormData.tournamentRuns || 0}
                          onChange={(e) => setEditFormData({ ...editFormData, tournamentRuns: Number(e.target.value) })}
                          className="w-full py-1.5 px-3 rounded bg-zinc-900 border border-zinc-700 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1 font-sans">Tournament Wkts</label>
                        <input
                          type="number"
                          value={editFormData.tournamentWickets || 0}
                          onChange={(e) => setEditFormData({ ...editFormData, tournamentWickets: Number(e.target.value) })}
                          className="w-full py-1.5 px-3 rounded bg-zinc-900 border border-zinc-700 text-white font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1 font-sans">Highest Score</label>
                        <input
                          type="text"
                          value={editFormData.highestScore || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, highestScore: e.target.value })}
                          className="w-full py-1.5 px-3 rounded bg-zinc-900 border border-zinc-700 text-orange-400 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-zinc-400 block mb-1 font-sans">Best Bowling</label>
                        <input
                          type="text"
                          value={editFormData.bestBowling || ''}
                          onChange={(e) => setEditFormData({ ...editFormData, bestBowling: e.target.value })}
                          className="w-full py-1.5 px-3 rounded bg-zinc-900 border border-zinc-700 text-blue-400 font-bold"
                        />
                      </div>
                    </div>

                    {/* Current Match Batting Figures */}
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                      <span className="text-[11px] font-bold uppercase text-orange-400 block">
                        Live Match Batting Figures (Displays on Scoreboard)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono-numbers">
                        <div>
                          <label className="text-zinc-400 block text-[10px]">Runs</label>
                          <input
                            type="number"
                            value={editBattingRuns}
                            onChange={(e) => setEditBattingRuns(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block text-[10px]">Balls</label>
                          <input
                            type="number"
                            value={editBattingBalls}
                            onChange={(e) => setEditBattingBalls(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block text-[10px]">4s</label>
                          <input
                            type="number"
                            value={editBattingFours}
                            onChange={(e) => setEditBattingFours(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block text-[10px]">6s</label>
                          <input
                            type="number"
                            value={editBattingSixes}
                            onChange={(e) => setEditBattingSixes(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block text-[10px] font-sans">Dismissal</label>
                          <input
                            type="text"
                            placeholder="Empty for not out"
                            value={editDismissal}
                            onChange={(e) => setEditDismissal(e.target.value)}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white font-sans text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Current Match Bowling Figures */}
                    <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-2">
                      <span className="text-[11px] font-bold uppercase text-blue-400 block">
                        Live Match Bowling Figures (Displays on Scoreboard)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-numbers">
                        <div>
                          <label className="text-zinc-400 block text-[10px]">Overs</label>
                          <input
                            type="number"
                            step="0.1"
                            value={editBowlingOvers}
                            onChange={(e) => setEditBowlingOvers(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block text-[10px]">Maidens</label>
                          <input
                            type="number"
                            value={editBowlingMaidens}
                            onChange={(e) => setEditBowlingMaidens(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block text-[10px]">Runs Conceded</label>
                          <input
                            type="number"
                            value={editBowlingRuns}
                            onChange={(e) => setEditBowlingRuns(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-zinc-400 block text-[10px]">Wickets</label>
                          <input
                            type="number"
                            value={editBowlingWickets}
                            onChange={(e) => setEditBowlingWickets(Number(e.target.value))}
                            className="w-full py-1.5 px-2 rounded bg-zinc-950 border border-zinc-700 text-red-400 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingPlayerId(null)}
                        className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(player.id)}
                        className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save All Details & Stats</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* READ-ONLY ROW */
                  <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-11 w-11 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black font-mono-numbers text-orange-400 text-base shadow-inner shrink-0">
                        {player.jerseyNumber}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-white">{player.name}</span>
                          {player.isCaptain && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[9px] border border-amber-500/30">
                              CAPTAIN
                            </span>
                          )}
                          {player.isWicketKeeper && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-bold text-[9px] border border-blue-500/30">
                              WK
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 font-semibold">
                            {player.role.replace('_', ' ')}
                          </span>

                          {isStriker && (
                            <span className="px-1.5 py-0.2 rounded bg-orange-600 text-white font-bold text-[9px] uppercase">
                              Active Striker
                            </span>
                          )}
                          {isNonStriker && (
                            <span className="px-1.5 py-0.2 rounded bg-zinc-700 text-zinc-200 font-bold text-[9px] uppercase">
                              Non-Striker
                            </span>
                          )}
                          {isBowler && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-600 text-white font-bold text-[9px] uppercase">
                              Active Bowler
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400 mt-0.5 flex flex-wrap gap-2">
                          <span>{player.battingStyle}</span>
                          <span>·</span>
                          <span>{player.bowlingStyle}</span>
                          <span>·</span>
                          <span className="text-zinc-500">
                            Tournament: {player.tournamentRuns || 0} runs, {player.tournamentWickets || 0} wkts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex flex-wrap items-center gap-2 font-mono-numbers text-xs w-full lg:w-auto justify-between lg:justify-end">
                      {batting && (
                        <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-right">
                          <span className="text-[9px] text-zinc-500 block uppercase font-sans">Batting</span>
                          <span className="text-white font-bold">{batting.runs}</span>
                          <span className="text-zinc-400 text-[11px]"> ({batting.balls}b, SR {batting.strikeRate})</span>
                        </div>
                      )}

                      {bowling && bowling.overs > 0 && (
                        <div className="bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-right">
                          <span className="text-[9px] text-zinc-500 block uppercase font-sans">Bowling</span>
                          <span className="text-red-400 font-bold">{bowling.wickets}</span>/
                          <span className="text-white font-bold">{bowling.runsConceded}</span>
                          <span className="text-zinc-400 text-[11px]"> ({bowling.overs} ov)</span>
                        </div>
                      )}

                      {/* View Card Modal Trigger */}
                      <button
                        onClick={() => setPreviewPlayerForModal(player)}
                        className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                        title="View Full Player Profile Modal"
                      >
                        <Info className="w-4 h-4 text-orange-400" />
                      </button>

                      {/* Push to Live Video Stream */}
                      <button
                        onClick={() => handlePushPlayerToVideo(player)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-orange-600 hover:text-white text-zinc-300 font-bold text-xs flex items-center gap-1 transition-colors"
                        title="Display player spotlight graphic on viewers' live video"
                      >
                        <Tv className="w-3.5 h-3.5 text-orange-400" />
                        <span className="hidden sm:inline">Spotlight</span>
                      </button>

                      {/* Set As Active In Match Actions */}
                      <button
                        onClick={() => setActiveStriker(player.id)}
                        className="px-2 py-1 rounded bg-zinc-900 hover:bg-orange-600 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-bold"
                        title="Set as Striker"
                      >
                        Set Striker
                      </button>

                      <button
                        onClick={() => setActiveBowler(player.id)}
                        className="px-2 py-1 rounded bg-zinc-900 hover:bg-blue-600 text-zinc-400 hover:text-white border border-zinc-800 text-[10px] font-bold"
                        title="Set as Bowler"
                      >
                        Set Bowler
                      </button>

                      {/* Edit Details */}
                      <button
                        onClick={() => handleStartEdit(player)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/40 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Player */}
                      <button
                        onClick={() => handleDeletePlayer(player.id, player.name)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Delete Player from Roster"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add New Player Modal */}
        {isAddingPlayer && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4 my-auto">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-600 text-white font-bold">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-white uppercase font-display">
                      Add New Player to Official Roster
                    </h4>
                    <p className="text-xs text-zinc-400">
                      Registered players will display in the scoreboard and live broadcast feed
                    </p>
                  </div>
                </div>

                <button onClick={() => setIsAddingPlayer(false)} className="text-zinc-400 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateNewPlayer} className="space-y-3.5 text-xs">
                {/* Team Selection */}
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Select Team</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPlayerTeamId(match.teamA.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                        newPlayerTeamId === match.teamA.id
                          ? 'bg-orange-600 text-white border-orange-400 shadow-md'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>{match.teamA.name}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewPlayerTeamId(match.teamB.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 ${
                        newPlayerTeamId === match.teamB.id
                          ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      <Shield className="w-4 h-4" />
                      <span>{match.teamB.name}</span>
                    </button>
                  </div>
                </div>

                {/* Name & Jersey */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="text-zinc-300 font-semibold block mb-1">Player Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vignesh Kumar"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      className="w-full py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Jersey Number</label>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      required
                      value={newPlayerJersey}
                      onChange={(e) => setNewPlayerJersey(Number(e.target.value))}
                      className="w-full py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-mono font-bold text-center"
                    />
                  </div>
                </div>

                {/* Role & Playing Style */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Playing Role</label>
                    <select
                      value={newPlayerRole}
                      onChange={(e) => setNewPlayerRole(e.target.value as Player['role'])}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium"
                    >
                      <option value="BATTER">Batter</option>
                      <option value="BOWLER">Bowler</option>
                      <option value="ALL_ROUNDER">All-Rounder</option>
                      <option value="WICKET_KEEPER">Wicket-Keeper</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Batting Style</label>
                    <select
                      value={newPlayerBattingStyle}
                      onChange={(e) => setNewPlayerBattingStyle(e.target.value as Player['battingStyle'])}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium"
                    >
                      <option value="Right Hand Bat">Right Hand Bat (RHB)</option>
                      <option value="Left Hand Bat">Left Hand Bat (LHB)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-zinc-300 font-semibold block mb-1">Bowling Style</label>
                    <select
                      value={newPlayerBowlingStyle}
                      onChange={(e) => setNewPlayerBowlingStyle(e.target.value as Player['bowlingStyle'])}
                      className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium"
                    >
                      <option value="Right Arm Fast">Right Arm Fast</option>
                      <option value="Right Arm Medium">Right Arm Medium</option>
                      <option value="Right Arm Off-Spin">Right Arm Off-Spin</option>
                      <option value="Right Arm Leg-Spin">Right Arm Leg-Spin</option>
                      <option value="Left Arm Fast">Left Arm Fast</option>
                      <option value="Left Arm Orthodox">Left Arm Orthodox</option>
                    </select>
                  </div>
                </div>

                {/* Captain / Wicket Keeper Badges */}
                <div className="flex items-center gap-5 p-2.5 rounded-xl bg-zinc-950 border border-zinc-800">
                  <span className="font-semibold text-zinc-400">Team Badges:</span>
                  <label className="flex items-center gap-1.5 text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPlayerIsCaptain}
                      onChange={(e) => setNewPlayerIsCaptain(e.target.checked)}
                      className="rounded accent-orange-500 h-4 w-4"
                    />
                    <span className="font-bold text-amber-400">Team Captain (C)</span>
                  </label>

                  <label className="flex items-center gap-1.5 text-zinc-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPlayerIsWK}
                      onChange={(e) => setNewPlayerIsWK(e.target.checked)}
                      className="rounded accent-blue-500 h-4 w-4"
                    />
                    <span className="font-bold text-blue-400">Wicket Keeper (WK)</span>
                  </label>
                </div>

                {/* Tournament Records */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-numbers">
                  <div>
                    <label className="text-zinc-400 block mb-1 font-sans text-[10px]">Tournament Runs</label>
                    <input
                      type="number"
                      value={newPlayerTournamentRuns}
                      onChange={(e) => setNewPlayerTournamentRuns(Number(e.target.value))}
                      className="w-full py-1.5 px-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-sans text-[10px]">Tournament Wkts</label>
                    <input
                      type="number"
                      value={newPlayerTournamentWickets}
                      onChange={(e) => setNewPlayerTournamentWickets(Number(e.target.value))}
                      className="w-full py-1.5 px-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-sans text-[10px]">Highest Score</label>
                    <input
                      type="text"
                      value={newPlayerHighestScore}
                      onChange={(e) => setNewPlayerHighestScore(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-lg bg-zinc-950 border border-zinc-700 text-orange-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1 font-sans text-[10px]">Best Bowling</label>
                    <input
                      type="text"
                      value={newPlayerBestBowling}
                      onChange={(e) => setNewPlayerBestBowling(e.target.value)}
                      className="w-full py-1.5 px-2 rounded-lg bg-zinc-950 border border-zinc-700 text-blue-400 font-bold"
                    />
                  </div>
                </div>

                {/* Immediate Match Role Assignment */}
                <div className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/30">
                  <label className="text-orange-400 font-bold block mb-1.5">
                    Match In-Game Assignment (Immediately Active on Scoreboard):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewPlayerAssignment('BENCH')}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                        newPlayerAssignment === 'BENCH'
                          ? 'bg-zinc-800 text-white border-zinc-600'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      In Squad (Bench)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPlayerAssignment('STRIKER')}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                        newPlayerAssignment === 'STRIKER'
                          ? 'bg-orange-600 text-white border-orange-400'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      ⚡ Active Striker
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPlayerAssignment('NON_STRIKER')}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                        newPlayerAssignment === 'NON_STRIKER'
                          ? 'bg-amber-600 text-white border-amber-400'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      Non-Striker
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewPlayerAssignment('BOWLER')}
                      className={`py-1.5 px-2 rounded-lg border text-xs font-bold transition-all ${
                        newPlayerAssignment === 'BOWLER'
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-zinc-950 text-zinc-400 border-zinc-800'
                      }`}
                    >
                      🎯 Active Bowler
                    </button>
                  </div>
                </div>

                {/* Bio Description */}
                <div>
                  <label className="text-zinc-300 font-semibold block mb-1">Player Bio / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Short player description or tournament notes..."
                    value={newPlayerBio}
                    onChange={(e) => setNewPlayerBio(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-orange-500"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingPlayer(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Register Player to {newPlayerTeamId === match.teamA.id ? match.teamA.name : match.teamB.name}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
