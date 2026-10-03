import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Radio,
  Tv,
  Eye,
  Sliders,
  Camera,
  Mic,
  Activity,
  Settings,
  ShieldAlert,
  Flame,
  KeyRound,
  ArrowLeft,
  Trophy,
  Gauge,
  Users,
  RotateCcw,
  Sparkles,
  Trash2,
  Check,
  X,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { ScoreControlPad } from './ScoreControlPad';
import { CameraControlHub } from './CameraControlHub';
import { VoiceControlPanel } from './VoiceControlPanel';
import { SystemHealthPanel } from './SystemHealthPanel';
import { MatchManagerPanel } from './MatchManagerPanel';
import { VoiceConfirmationModal } from './VoiceConfirmationModal';
import { UmpireReviewModal } from './UmpireReviewModal';
import { NewMatchModal } from '../match/NewMatchModal';
import { PlayerDetailsEditor } from './PlayerDetailsEditor';
import { AIBallAnalysisCard } from '../viewer/AIBallAnalysisCard';

export const AdminControlRoom: React.FC = () => {
  const {
    match,
    setViewMode,
    startUmpireReview,
    isNewMatchModalOpen,
    setIsNewMatchModalOpen,
    clearScoresForNextMatch,
  } = useCricket();

  // Security gate Credentials
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Clear Score for Next Match Modal
  const [isClearScoreModalOpen, setIsClearScoreModalOpen] = useState(false);
  const [nextMatchTitleInput, setNextMatchTitleInput] = useState('');

  // Active module tab
  const [activeTab, setActiveTab] = useState<
    'SCORING' | 'AI_ANALYSIS' | 'PLAYERS' | 'CAMERAS' | 'VOICE' | 'SYSTEM' | 'CONFIG'
  >('SCORING');

  const handleVerifyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (usernameInput.trim() === '123' && passwordInput.trim() === '123') ||
      (usernameInput.trim().toLowerCase() === 'admin' && passwordInput.trim() === '123')
    ) {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleQuickUnlock = () => {
    setUsernameInput('123');
    setPasswordInput('123');
    setIsAuthenticated(true);
  };

  const handleConfirmClearScoreNextMatch = () => {
    clearScoresForNextMatch(nextMatchTitleInput.trim() || undefined);
    setIsClearScoreModalOpen(false);
    setNextMatchTitleInput('');
    setActiveTab('SCORING');
  };

  const battingTeam = match.battingTeamId === match.teamA.id ? match.teamA : match.teamB;
  const currentInnings = match.currentInnings === 1 ? match.innings1 : (match.innings2 || match.innings1);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-center space-y-5">
          <div className="h-16 w-16 mx-auto rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-black font-display uppercase tracking-wide">
              CONTROL ROOM ACCESS
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Authorized broadcast engineers and official scorers only
            </p>
          </div>

          <form onSubmit={handleVerifyAuth} className="space-y-3.5 text-left text-xs">
            <div>
              <label className="text-zinc-300 font-semibold block mb-1">User name</label>
              <input
                type="text"
                placeholder="Enter User name (123)"
                value={usernameInput}
                onChange={(e) => {
                  setUsernameInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-zinc-300 font-semibold block mb-1">Password</label>
              <input
                type="password"
                placeholder="Enter Password (123)"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                className="w-full py-2.5 px-3.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-sm text-white focus:outline-none focus:border-orange-500"
              />
            </div>

            {authError && (
              <span className="text-xs text-red-400 font-semibold block text-center">
                Invalid credentials. User name: 123 · Password: 123
              </span>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-lg transition-colors mt-2"
            >
              Authenticate & Enter Control Room
            </button>
          </form>

          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
            <span>Credentials: 123 / 123</span>
            <button
              onClick={handleQuickUnlock}
              className="text-orange-400 hover:underline font-semibold"
            >
              Quick Auto-Fill & Unlock
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* Voice Confirmation Safeguard Modal */}
      <VoiceConfirmationModal />

      {/* Umpire DRS Review Overlay Modal */}
      <UmpireReviewModal />

      {/* Switch or Create Match Modal */}
      <NewMatchModal
        isOpen={isNewMatchModalOpen}
        onClose={() => setIsNewMatchModalOpen(false)}
      />

      {/* Clear Score & Start Next Match Modal */}
      {isClearScoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-950 text-red-400 border border-red-700/60">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-white uppercase font-display">
                    Clear Score & Start Next Match
                  </h4>
                  <span className="text-xs text-zinc-400">
                    Reset scoreboard to 0/0 and 0.0 overs for the next game
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsClearScoreModalOpen(false)}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300 space-y-2">
                <div className="flex items-center gap-2 text-orange-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>What happens when you clear:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400 pl-1">
                  <li>Innings score resets to <strong className="text-white">0 runs, 0 wickets (0.0 overs)</strong>.</li>
                  <li>Current ball-by-ball history & partnerships are cleared.</li>
                  <li>Player match batting & bowling figures reset to zero for the fresh match.</li>
                  <li>Team squads & registered player profiles remain completely intact!</li>
                  <li>Live viewers instantly see the clean 0/0 scoreboard for the new match.</li>
                </ul>
              </div>

              <div>
                <label className="text-zinc-300 font-semibold block mb-1">
                  Next Match Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. THAMIYANUR SUPER 6 — MATCH #2 / SEMI-FINAL"
                  value={nextMatchTitleInput}
                  onChange={(e) => setNextMatchTitleInput(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-medium focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClearScoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmClearScoreNextMatch}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 shadow-lg"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Confirm & Clear Score (Start Next Match)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Room Top Header */}
      <header className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('VIEWER')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 border border-zinc-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Viewer View</span>
          </button>

          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-black text-sm uppercase tracking-wider text-white font-display">
              AGNI BROADCAST CONTROL ROOM
            </span>
            <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-bold text-[10px] border border-orange-500/30">
              OPERATOR CONSOLE
            </span>
          </div>
        </div>

        {/* Live Ticker & Quick Nav */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono-numbers">
            <span className="text-zinc-400 font-semibold">{battingTeam.shortName}:</span>
            <span className="font-bold text-white">
              {currentInnings.totalRuns}/{currentInnings.wickets}
            </span>
            <span className="text-orange-400">({currentInnings.overs} ov)</span>
          </div>

          {/* CLEAR SCORE / NEXT MATCH BUTTON */}
          <button
            onClick={() => {
              setNextMatchTitleInput('');
              setIsClearScoreModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60 font-bold transition-colors shadow-sm"
            title="Clear all scores and begin the next match with 0/0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-red-400" />
            <span>Next Match (Clear Score)</span>
          </button>

          <button
            onClick={() => setIsNewMatchModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/40 font-bold transition-colors"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Switch Match</span>
          </button>

          <button
            onClick={() => setViewMode('TV')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold border border-zinc-700 transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-orange-400" />
            <span>Open TV Mode</span>
          </button>

          <button
            onClick={() => setIsAuthenticated(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Lock Control Room"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Module Navigation Tabs */}
      <div className="bg-zinc-900/60 border-b border-zinc-800 px-4 sm:px-6 py-2 flex items-center gap-2 overflow-x-auto">
        {/* Tab 1: Live Ball Scoring Pad */}
        <button
          onClick={() => setActiveTab('SCORING')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
            activeTab === 'SCORING'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Live Ball Scoring Pad</span>
        </button>

        {/* Tab 2: AI Ball Analysis & Speedometer Gauge (Added to Control Room) */}
        <button
          onClick={() => setActiveTab('AI_ANALYSIS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
            activeTab === 'AI_ANALYSIS'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Gauge className="w-4 h-4 text-orange-400" />
          <span>AI Ball Analysis & Speed</span>
        </button>

        {/* Tab 3: All Players Details & Stats Editor */}
        <button
          onClick={() => setActiveTab('PLAYERS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
            activeTab === 'PLAYERS'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Users className="w-4 h-4 text-blue-400" />
          <span>Edit All Players & Stats</span>
        </button>

        {/* Tab 4: 6-Camera Master Switcher */}
        <button
          onClick={() => setActiveTab('CAMERAS')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
            activeTab === 'CAMERAS'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>6-Camera Master Switcher</span>
        </button>

        {/* Tab 5: Voice Commands & Mic */}
        <button
          onClick={() => setActiveTab('VOICE')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
            activeTab === 'VOICE'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Voice Commands & Mic</span>
        </button>

        {/* Tab 6: System Health */}
        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
            activeTab === 'SYSTEM'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>System Health & Nodes</span>
        </button>

        {/* Tab 7: Match Config */}
        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors whitespace-nowrap ${
            activeTab === 'CONFIG'
              ? 'bg-orange-600 text-white shadow-md'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Match Configuration</span>
        </button>
      </div>

      {/* Module Content Body */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'SCORING' && (
          <div className="space-y-6">
            <ScoreControlPad />
            {/* Operator reference AI ball telemetry right on scoring pad */}
            <div className="pt-2 border-t border-zinc-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 block mb-2 flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-orange-400" />
                Live Ball Telemetry & Speedometer (Operator Reference)
              </span>
              <AIBallAnalysisCard />
            </div>
          </div>
        )}
        {activeTab === 'AI_ANALYSIS' && <AIBallAnalysisCard />}
        {activeTab === 'PLAYERS' && <PlayerDetailsEditor />}
        {activeTab === 'CAMERAS' && <CameraControlHub />}
        {activeTab === 'VOICE' && <VoiceControlPanel />}
        {activeTab === 'SYSTEM' && <SystemHealthPanel />}
        {activeTab === 'CONFIG' && <MatchManagerPanel />}
      </main>
    </div>
  );
};
