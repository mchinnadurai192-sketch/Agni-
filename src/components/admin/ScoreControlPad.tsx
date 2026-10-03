import React, { useState } from 'react';
import { RotateCcw, ArrowRightLeft, ShieldAlert, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { ExtraType, WicketType, LengthCategory } from '../../types/cricket';
import { AdminPhoneCameraTransmitter } from './AdminPhoneCameraTransmitter';

export const ScoreControlPad: React.FC = () => {
  const {
    match,
    recordBall,
    undoLastBall,
    switchStrike,
    setActiveBowler,
    startUmpireReview,
    clearScoresForNextMatch,
  } = useCricket();

  // Wicket modal state
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketType, setWicketType] = useState<WicketType>('BOWLED');
  const [customCommentary, setCustomCommentary] = useState('');

  // AI speed & length override state
  const [aiSpeed, setAiSpeed] = useState<number>(139.5);
  const [aiLength, setAiLength] = useState<LengthCategory>('GOOD_LENGTH');
  const [aiBounce, setAiBounce] = useState<number>(0.75);

  const battingTeam = match.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const bowlingTeam = match.bowlingTeamId === match.teamA.id ? match.teamA : match.teamB;

  const striker = battingTeam.players.find((p) => p.id === match.activeStrikerId);
  const nonStriker = battingTeam.players.find((p) => p.id === match.activeNonStrikerId);
  const bowler = bowlingTeam.players.find((p) => p.id === match.activeBowlerId);

  // Quick run execution
  const handleScoreRuns = (runs: number) => {
    recordBall({
      runs,
      extraType: 'NONE',
      isWicket: false,
      aiSpeed,
      aiLength,
      aiBounce,
      customCommentary: customCommentary.trim() || undefined,
    });
    setCustomCommentary('');
  };

  // Quick extras execution
  const handleExtra = (extraType: ExtraType, runs: number = 0) => {
    recordBall({
      runs,
      extraType,
      extraRuns: 0,
      isWicket: false,
      aiSpeed,
      aiLength,
      aiBounce,
      customCommentary: customCommentary.trim() || undefined,
    });
    setCustomCommentary('');
  };

  // Confirm wicket
  const handleConfirmWicket = () => {
    recordBall({
      runs: 0,
      extraType: 'NONE',
      isWicket: true,
      wicketType,
      dismissedPlayerId: match.activeStrikerId,
      aiSpeed,
      aiLength,
      aiBounce,
      customCommentary: customCommentary.trim() || undefined,
    });
    setShowWicketModal(false);
    setCustomCommentary('');
  };

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 p-4 sm:p-5 shadow-xl space-y-5">
      {/* Operator Match Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400">
            RAPID SCORING CONSOLE
          </span>
          <span className="text-xs text-zinc-500">·</span>
          <button
            onClick={() => {
              if (window.confirm('Clear all score data to 0/0 and start the next match?')) {
                clearScoresForNextMatch();
              }
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60 text-[10px] font-bold transition-colors ml-1"
            title="Reset scoreboard to 0/0 for next match"
          >
            <RotateCcw className="w-3 h-3 text-red-400" />
            <span>Next Match (Clear 0/0)</span>
          </button>
        </div>

        {/* Current Batters & Bowler summary */}
        <div className="flex items-center gap-4 text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Striker:</span>
            <span className="font-bold text-orange-400">{striker?.shortName || 'Striker'}*</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Bowler:</span>
            <span className="font-bold text-white">{bowler?.shortName || 'Bowler'}</span>
          </div>
        </div>
      </div>

      {/* Admin Only Camera Phone 1 Transmitter to Viewers */}
      <AdminPhoneCameraTransmitter />

      {/* Large RUN Entry Touchpad */}
      <div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Standard Deliveries (Runs)
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <button
            onClick={() => handleScoreRuns(0)}
            className="h-16 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-200 font-black text-xl border border-zinc-700 shadow flex flex-col items-center justify-center transition-all"
          >
            <span>DOT</span>
            <span className="text-[10px] text-zinc-400 font-normal">0 runs</span>
          </button>

          <button
            onClick={() => handleScoreRuns(1)}
            className="h-16 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-xl border border-zinc-700 shadow flex flex-col items-center justify-center transition-all"
          >
            <span>+1</span>
            <span className="text-[10px] text-zinc-400 font-normal">Single</span>
          </button>

          <button
            onClick={() => handleScoreRuns(2)}
            className="h-16 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-xl border border-zinc-700 shadow flex flex-col items-center justify-center transition-all"
          >
            <span>+2</span>
            <span className="text-[10px] text-zinc-400 font-normal">Two</span>
          </button>

          <button
            onClick={() => handleScoreRuns(3)}
            className="h-16 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-black text-xl border border-zinc-700 shadow flex flex-col items-center justify-center transition-all"
          >
            <span>+3</span>
            <span className="text-[10px] text-zinc-400 font-normal">Three</span>
          </button>

          <button
            onClick={() => handleScoreRuns(4)}
            className="h-16 rounded-lg bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-2xl border border-blue-400 shadow flex flex-col items-center justify-center transition-all"
          >
            <span>+4</span>
            <span className="text-[10px] text-blue-200 font-bold tracking-wider uppercase">FOUR</span>
          </button>

          <button
            onClick={() => handleScoreRuns(6)}
            className="h-16 rounded-lg bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-2xl border border-purple-400 shadow flex flex-col items-center justify-center transition-all"
          >
            <span>+6</span>
            <span className="text-[10px] text-purple-200 font-bold tracking-wider uppercase">SIX</span>
          </button>
        </div>
      </div>

      {/* Extras & Wicket Buttons */}
      <div>
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
          Extras & Dismissal Events
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          <button
            onClick={() => handleExtra('WIDE')}
            className="h-12 rounded-lg bg-amber-600/90 hover:bg-amber-500 active:scale-95 text-zinc-950 font-bold text-sm border border-amber-400 shadow transition-all"
          >
            WIDE (+1)
          </button>

          <button
            onClick={() => handleExtra('NO_BALL')}
            className="h-12 rounded-lg bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-sm border border-orange-400 shadow transition-all"
          >
            NO BALL (+1)
          </button>

          <button
            onClick={() => handleExtra('BYE', 1)}
            className="h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-semibold text-xs border border-zinc-700 shadow transition-all"
          >
            BYE (1)
          </button>

          <button
            onClick={() => handleExtra('LEG_BYE', 1)}
            className="h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-semibold text-xs border border-zinc-700 shadow transition-all"
          >
            LEG BYE (1)
          </button>

          <button
            onClick={() => handleExtra('PENALTY', 5)}
            className="h-12 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-zinc-300 font-semibold text-xs border border-zinc-700 shadow transition-all"
          >
            PENALTY (+5)
          </button>

          <button
            onClick={() => setShowWicketModal(true)}
            className="h-12 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-sm border border-red-400 shadow transition-all flex items-center justify-center gap-1"
          >
            <span>WICKET!</span>
          </button>
        </div>
      </div>

      {/* AI Telemetry Input / Overrides */}
      <div className="p-3.5 rounded-lg bg-zinc-950/70 border border-zinc-800 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-zinc-200 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            AI Sensor / Radar Calibration
          </span>
          <span className="text-[10px] text-zinc-500 font-mono-numbers">Automated optical inference</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Speed slider */}
          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>Speed:</span>
              <span className="font-bold font-mono-numbers text-orange-400">{aiSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="100"
              max="160"
              step="0.5"
              value={aiSpeed}
              onChange={(e) => setAiSpeed(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>

          {/* Length Category */}
          <div>
            <div className="text-zinc-400 mb-1">Pitch Length:</div>
            <select
              value={aiLength}
              onChange={(e) => setAiLength(e.target.value as LengthCategory)}
              className="w-full p-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium"
            >
              <option value="YORKER">YORKER</option>
              <option value="FULL">FULL</option>
              <option value="GOOD_LENGTH">GOOD LENGTH</option>
              <option value="BACK_OF_LENGTH">BACK OF LENGTH</option>
              <option value="SHORT">SHORT</option>
              <option value="BOUNCER">BOUNCER</option>
            </select>
          </div>

          {/* Bounce */}
          <div>
            <div className="flex justify-between text-zinc-400 mb-1">
              <span>Bounce Height:</span>
              <span className="font-bold font-mono-numbers text-zinc-200">{aiBounce}m</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="1.8"
              step="0.05"
              value={aiBounce}
              onChange={(e) => setAiBounce(parseFloat(e.target.value))}
              className="w-full accent-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Operator Utility Actions: Undo, Rotate Strike, Bowler, DRS Review */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={undoLastBall}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Undo Last Ball</span>
          </button>

          <button
            onClick={switchStrike}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-colors"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-blue-400" />
            <span>Switch Strike</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Change Bowler Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-zinc-400">Active Bowler:</span>
            <select
              value={match.activeBowlerId}
              onChange={(e) => setActiveBowler(e.target.value)}
              className="p-1.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold"
            >
              {bowlingTeam.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role})
                </option>
              ))}
            </select>
          </div>

          {/* Trigger Umpire Review DRS */}
          <button
            onClick={() => startUmpireReview({ reviewType: 'WIDE_CHECK', requestedBy: 'UMPIRE' })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-zinc-950 font-bold transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Trigger DRS Review</span>
          </button>
        </div>
      </div>

      {/* Wicket Dismissal Modal */}
      {showWicketModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-700 rounded-xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Record Wicket Dismissal
              </h3>
              <button
                onClick={() => setShowWicketModal(false)}
                className="text-zinc-400 hover:text-white font-bold text-lg"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-zinc-400 block mb-1">Dismissed Batter:</span>
                <div className="p-2.5 rounded bg-zinc-950 font-bold text-sm text-white">
                  {striker?.name} ({striker?.role})
                </div>
              </div>

              <div>
                <span className="text-zinc-400 block mb-1">Dismissal Method:</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['BOWLED', 'CAUGHT', 'LBW', 'RUN_OUT', 'STUMPED', 'HIT_WICKET'] as WicketType[]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setWicketType(type)}
                        className={`p-2.5 rounded text-left font-bold transition-colors border ${
                          wicketType === type
                            ? 'bg-red-600 text-white border-red-500'
                            : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                        }`}
                      >
                        {type.replace('_', ' ')}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                onClick={() => setShowWicketModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmWicket}
                className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow"
              >
                Confirm Wicket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
