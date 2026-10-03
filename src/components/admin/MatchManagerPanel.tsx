import React, { useState } from 'react';
import { Settings, Trophy, MapPin, Calendar, Check, RotateCcw } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { MatchStatus } from '../../types/cricket';

export const MatchManagerPanel: React.FC = () => {
  const { match, updateMatchMeta, resetMatchToDefault } = useCricket();

  const [title, setTitle] = useState(match.title);
  const [tournament, setTournament] = useState(match.tournament);
  const [venue, setVenue] = useState(match.venue);
  const [totalOvers, setTotalOvers] = useState(match.totalOvers);
  const [status, setStatus] = useState<MatchStatus>(match.status);

  const statuses: MatchStatus[] = [
    'SCHEDULED',
    'LIVE',
    'INNINGS_BREAK',
    'REVIEW',
    'COMPLETED',
    'ABANDONED',
  ];

  const handleSave = () => {
    updateMatchMeta({
      title,
      tournament,
      venue,
      totalOvers,
      status,
    });
  };

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-4 text-xs">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-orange-400 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            MATCH & TOURNAMENT CONFIGURATION
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Configure match format, status, teams, venue, and officials
          </p>
        </div>

        <button
          onClick={resetMatchToDefault}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold border border-zinc-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span>Reset to Default</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Match Title */}
        <div>
          <label className="text-zinc-300 font-semibold block mb-1">Match Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-medium"
          />
        </div>

        {/* Tournament Name */}
        <div>
          <label className="text-zinc-300 font-semibold block mb-1">Tournament</label>
          <input
            type="text"
            value={tournament}
            onChange={(e) => setTournament(e.target.value)}
            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-medium"
          />
        </div>

        {/* Venue */}
        <div>
          <label className="text-zinc-300 font-semibold block mb-1">Venue & Ground</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-medium"
          />
        </div>

        {/* Total Overs */}
        <div>
          <label className="text-zinc-300 font-semibold block mb-1">Total Overs per Innings</label>
          <input
            type="number"
            value={totalOvers}
            onChange={(e) => setTotalOvers(parseInt(e.target.value) || 20)}
            className="w-full p-2 rounded bg-zinc-950 border border-zinc-700 text-zinc-100 font-medium font-mono-numbers"
          />
        </div>
      </div>

      {/* Match Status Selector */}
      <div>
        <label className="text-zinc-300 font-semibold block mb-2">Current Match Status</label>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setStatus(st)}
              className={`p-2 rounded-lg font-bold uppercase tracking-wider text-[11px] border transition-colors ${
                status === st
                  ? 'bg-orange-600 text-white border-orange-500 shadow'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg transition-colors"
        >
          <Check className="w-4 h-4" />
          <span>Save Match Configuration</span>
        </button>
      </div>
    </div>
  );
};
