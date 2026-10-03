import React, { useState } from 'react';
import { Users, Shield, Award } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { Team, Player } from '../../types/cricket';

export const TeamsSquadTab: React.FC = () => {
  const { match } = useCricket();
  const [selectedTeamId, setSelectedTeamId] = useState<string>(match.teamA.id);

  const activeTeam: Team = selectedTeamId === match.teamA.id ? match.teamA : match.teamB;

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl text-xs">
      {/* Team Selection Header */}
      <div className="flex items-center gap-3 p-4 bg-zinc-950 border-b border-zinc-800">
        <Users className="w-4 h-4 text-orange-400" />
        <span className="font-bold uppercase tracking-wider text-zinc-100 font-display">
          TEAM SQUADS & PLAYERS
        </span>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setSelectedTeamId(match.teamA.id)}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              selectedTeamId === match.teamA.id
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {match.teamA.name}
          </button>
          <button
            onClick={() => setSelectedTeamId(match.teamB.id)}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              selectedTeamId === match.teamB.id
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            {match.teamB.name}
          </button>
        </div>
      </div>

      {/* Players Grid */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {activeTeam.players.map((player: Player) => (
          <div
            key={player.id}
            className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
          >
            {/* Jersey Number Circle */}
            <div className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-black font-mono-numbers text-orange-400 text-sm shadow-inner">
              {player.jerseyNumber}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-zinc-100 truncate">{player.name}</span>
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
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                <span className="text-orange-400/90 font-medium">{player.role.replace('_', ' ')}</span>
                <span>·</span>
                <span className="truncate">{player.battingStyle}</span>
              </div>
              <div className="text-[10px] text-zinc-500 truncate mt-0.5">
                {player.bowlingStyle}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
