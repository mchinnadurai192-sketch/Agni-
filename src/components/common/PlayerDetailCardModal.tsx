import React from 'react';
import {
  X,
  Shield,
  Award,
  Zap,
  Activity,
  Flame,
  Target,
  Trophy,
  Tv,
  Radio,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import { Player, Team, Match } from '../../types/cricket';
import { useCricket } from '../../context/CricketContext';

interface PlayerDetailCardModalProps {
  player: Player | null;
  team?: Team;
  onClose: () => void;
  onEditInAdmin?: (player: Player) => void;
}

export const PlayerDetailCardModal: React.FC<PlayerDetailCardModalProps> = ({
  player,
  team,
  onClose,
  onEditInAdmin,
}) => {
  const { match, operateLowerThird, viewMode, setViewMode } = useCricket();

  if (!player) return null;

  // Resolve team if not passed
  const playerTeam =
    team ||
    (match.teamA.players.some((p) => p.id === player.id)
      ? match.teamA
      : match.teamB);

  const battingStats = match.battingStats[player.id];
  const bowlingStats = match.bowlingStats[player.id];

  const isStriker = match.activeStrikerId === player.id;
  const isNonStriker = match.activeNonStrikerId === player.id;
  const isBowler = match.activeBowlerId === player.id;

  const handlePushToBroadcast = () => {
    if (player.role === 'BOWLER' || (bowlingStats && bowlingStats.overs > 0)) {
      operateLowerThird({
        type: 'BOWLER_SPOTLIGHT',
        playerId: player.id,
        title: `${player.name.toUpperCase()} (JRSY #${player.jerseyNumber})`,
        subtitle: `${player.bowlingStyle} · ${bowlingStats ? `${bowlingStats.wickets}/${bowlingStats.runsConceded} (${bowlingStats.overs} ov)` : 'Current Bowler'}`,
        extraInfo: `Econ: ${bowlingStats ? bowlingStats.economy : '0.0'} · Tournament Wickets: ${player.tournamentWickets || 0}`,
      });
    } else {
      operateLowerThird({
        type: 'BATTER_SPOTLIGHT',
        playerId: player.id,
        title: `${player.name.toUpperCase()} (JRSY #${player.jerseyNumber})`,
        subtitle: `${player.battingStyle} · ${battingStats ? `${battingStats.runs} runs (${battingStats.balls}b, SR: ${battingStats.strikeRate})` : 'Batter'}`,
        extraInfo: `4s: ${battingStats?.fours || 0} · 6s: ${battingStats?.sixes || 0} · Highest: ${player.highestScore || '0'}`,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 select-none animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Header Card Banner with Team Color Accent */}
        <div className="relative p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-b border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              {/* Jersey Avatar Circle */}
              <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-600 to-amber-700 border-2 border-orange-400/80 shadow-xl flex items-center justify-center text-white shrink-0">
                <span className="font-black font-mono-numbers text-2xl tracking-tighter">
                  {player.jerseyNumber}
                </span>
                <span className="absolute -bottom-1 -right-1 h-4 px-1 rounded bg-zinc-950 border border-zinc-700 text-[9px] font-bold text-orange-400 uppercase">
                  #{player.jerseyNumber}
                </span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h3 className="text-lg font-black font-display text-white tracking-tight">
                    {player.name}
                  </h3>
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
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                  <span className="font-bold text-orange-400">{playerTeam?.name}</span>
                  <span>·</span>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold text-[10px] uppercase">
                    {player.role.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
              title="Close Player Details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Live Match State Badge if on field */}
          {(isStriker || isNonStriker || isBowler) && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-950/80 border border-orange-500/50 text-orange-300 text-xs font-bold animate-pulse">
              <span className="h-2 w-2 rounded-full bg-orange-500" />
              <span>
                {isStriker
                  ? 'ON STRIKE (Active Batter)'
                  : isNonStriker
                  ? 'NON-STRIKER AT CREASE'
                  : 'CURRENT BOWLER IN ACTION'}
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Body Details */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Playing Styles Pill Matrix */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                Batting Style
              </span>
              <span className="text-white font-semibold text-sm mt-0.5">
                {player.battingStyle}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/70 border border-zinc-800 flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">
                Bowling Style
              </span>
              <span className="text-white font-semibold text-sm mt-0.5">
                {player.bowlingStyle}
              </span>
            </div>
          </div>

          {/* Current Match Live Figures */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/90 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-orange-400 flex items-center gap-1.5 tracking-wider">
                <Flame className="w-3.5 h-3.5" />
                Current Match Performance
              </span>
              <span className="text-[10px] text-zinc-500 font-mono-numbers">
                {match.title}
              </span>
            </div>

            {/* Batting Match Figures */}
            <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono-numbers">
              <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-1 font-sans">
                <span className="font-semibold text-zinc-300">Batting</span>
                <span>
                  {battingStats?.dismissal ? (
                    <span className="text-zinc-400 italic">{battingStats.dismissal}</span>
                  ) : isStriker || isNonStriker ? (
                    <span className="text-emerald-400 font-bold">Batting *</span>
                  ) : (
                    <span className="text-zinc-500">Yet to bat</span>
                  )}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 text-center text-xs">
                <div className="bg-zinc-950 py-1 rounded">
                  <span className="text-[10px] text-zinc-500 block">Runs</span>
                  <span className="font-black text-white text-sm">{battingStats?.runs || 0}</span>
                </div>
                <div className="bg-zinc-950 py-1 rounded">
                  <span className="text-[10px] text-zinc-500 block">Balls</span>
                  <span className="text-zinc-300 font-bold">{battingStats?.balls || 0}</span>
                </div>
                <div className="bg-zinc-950 py-1 rounded">
                  <span className="text-[10px] text-zinc-500 block">4s</span>
                  <span className="text-blue-400 font-bold">{battingStats?.fours || 0}</span>
                </div>
                <div className="bg-zinc-950 py-1 rounded">
                  <span className="text-[10px] text-zinc-500 block">6s</span>
                  <span className="text-purple-400 font-bold">{battingStats?.sixes || 0}</span>
                </div>
                <div className="bg-zinc-950 py-1 rounded">
                  <span className="text-[10px] text-zinc-500 block">SR</span>
                  <span className="text-orange-400 font-bold">{battingStats?.strikeRate || '0.0'}</span>
                </div>
              </div>
            </div>

            {/* Bowling Match Figures (if bowled) */}
            {bowlingStats && bowlingStats.overs > 0 && (
              <div className="p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 font-mono-numbers">
                <div className="flex items-center justify-between text-zinc-400 text-[11px] mb-1 font-sans">
                  <span className="font-semibold text-zinc-300">Bowling</span>
                  <span className="text-zinc-400">{player.bowlingStyle}</span>
                </div>
                <div className="grid grid-cols-5 gap-2 text-center text-xs">
                  <div className="bg-zinc-950 py-1 rounded">
                    <span className="text-[10px] text-zinc-500 block">Overs</span>
                    <span className="font-bold text-white">{bowlingStats.overs}</span>
                  </div>
                  <div className="bg-zinc-950 py-1 rounded">
                    <span className="text-[10px] text-zinc-500 block">Maidens</span>
                    <span className="text-zinc-300 font-bold">{bowlingStats.maidens}</span>
                  </div>
                  <div className="bg-zinc-950 py-1 rounded">
                    <span className="text-[10px] text-zinc-500 block">Runs</span>
                    <span className="text-zinc-300 font-bold">{bowlingStats.runsConceded}</span>
                  </div>
                  <div className="bg-zinc-950 py-1 rounded">
                    <span className="text-[10px] text-zinc-500 block">Wkts</span>
                    <span className="text-red-400 font-black text-sm">{bowlingStats.wickets}</span>
                  </div>
                  <div className="bg-zinc-950 py-1 rounded">
                    <span className="text-[10px] text-zinc-500 block">Econ</span>
                    <span className="text-emerald-400 font-bold">{bowlingStats.economy}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tournament & Career Statistics */}
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <span className="text-xs font-bold uppercase text-zinc-300 flex items-center gap-1.5 tracking-wider">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              Tournament & Career Metrics
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono-numbers">
              <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-sans">Total Runs</span>
                <span className="text-white font-black text-sm">{player.tournamentRuns || 0}</span>
              </div>
              <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-sans">Total Wickets</span>
                <span className="text-white font-black text-sm">{player.tournamentWickets || 0}</span>
              </div>
              <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-sans">Highest Score</span>
                <span className="text-orange-400 font-bold">{player.highestScore || '0'}</span>
              </div>
              <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-500 block uppercase font-sans">Best Bowling</span>
                <span className="text-blue-400 font-bold">{player.bestBowling || '-'}</span>
              </div>
            </div>
          </div>

          {/* Bio / Profile notes */}
          {player.bio && (
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">
                Player Profile & Scouting Notes
              </span>
              <p className="text-xs text-zinc-300 italic leading-relaxed">
                "{player.bio}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-3 text-xs">
          {/* Push to Broadcast Video Button (Admin / Director action) */}
          <button
            onClick={handlePushToBroadcast}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/40 font-bold transition-all shadow-sm"
            title="Display this player's lower-third card on the live viewer video feed"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Push Spotlight to Live Video</span>
          </button>

          <div className="flex items-center gap-2">
            {viewMode === 'ADMIN' && onEditInAdmin && (
              <button
                onClick={() => {
                  onEditInAdmin(player);
                  onClose();
                }}
                className="flex items-center gap-1 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-400" />
                <span>Edit Details</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
