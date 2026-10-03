import React, { useState } from 'react';
import {
  Flame,
  Tv,
  Radio,
  Sliders,
  Volume2,
  VolumeX,
  Trophy,
  Users,
  ShieldAlert,
} from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { LiveVideoPlayer } from './LiveVideoPlayer';
import { LiveScoreboardBanner } from './LiveScoreboardBanner';
import { UmpireReviewModal } from '../admin/UmpireReviewModal';
import { PlayerScoreboardModal } from './PlayerScoreboardModal';
import { DrsSimulationOverlay } from './DrsSimulationOverlay';

export const ViewerDashboard: React.FC = () => {
  const {
    setViewMode,
    isAudioMuted,
    setIsAudioMuted,
    isVoiceEnabled,
    setIsVoiceEnabled,
  } = useCricket();

  const [isScoreboardModalOpen, setIsScoreboardModalOpen] = useState(false);
  const [isDrsOverlayOpen, setIsDrsOverlayOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col select-none">
      {/* DRS Review Modal (displays review decisions when confirmed by umpire) */}
      <UmpireReviewModal />

      {/* Simulated DRS Decision Review Visual Overlay with Checking... Animation */}
      <DrsSimulationOverlay
        isOpen={isDrsOverlayOpen}
        onClose={() => setIsDrsOverlayOpen(false)}
      />

      {/* Complete Player Scoreboard & Squad Details Modal */}
      <PlayerScoreboardModal
        isOpen={isScoreboardModalOpen}
        onClose={() => setIsScoreboardModalOpen(false)}
      />

      {/* Minimal Header Bar: Brand, Live, Voice Toggle, TV Mode, Control Room */}
      <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500 shrink-0" />
          <h1 className="text-base sm:text-lg font-black font-display tracking-tight text-white uppercase whitespace-nowrap">
            THAMIYANUR AGNI SPORTS OTT
          </h1>
          <span className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-950/80 border border-red-700/60 text-red-400 text-[10px] font-bold uppercase ml-2">
            <Radio className="w-2.5 h-2.5 animate-pulse text-red-500" />
            <span>LIVE</span>
          </span>
        </div>

        {/* Minimal Viewer Actions: DRS Trigger, Player Scoreboard, AI Voice, TV Mode, Control Room */}
        <div className="flex items-center gap-2">
          {/* Visual Overlay Trigger for DRS Simulation with Checking... animation */}
          <button
            onClick={() => setIsDrsOverlayOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900/90 text-red-400 border border-red-600/50 text-xs font-bold transition-all shadow-sm group animate-pulse"
            title="Simulate Third Umpire DRS Review with 'Checking...' animation"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-red-500 group-hover:scale-110 transition-transform" />
            <span>DRS Review</span>
          </button>

          {/* Player Scoreboard Button */}
          <button
            onClick={() => setIsScoreboardModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/80 hover:bg-orange-900/90 text-orange-400 border border-orange-500/50 text-xs font-bold transition-all shadow-sm"
            title="View Complete Batting, Bowling & Squad Scoreboard"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Player Scoreboard</span>
          </button>

          {/* AI Voice Announcement Toggle */}
          <button
            onClick={() => {
              if (isAudioMuted) {
                setIsAudioMuted(false);
                setIsVoiceEnabled(true);
              } else {
                setIsVoiceEnabled(!isVoiceEnabled);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              !isAudioMuted && isVoiceEnabled
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
            title="Automatic AI Voice Announcements for Every Ball"
          >
            {!isAudioMuted && isVoiceEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">AI Voice ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-zinc-500" />
                <span className="hidden sm:inline">Voice Muted</span>
              </>
            )}
          </button>

          {/* TV Display Mode Button */}
          <button
            onClick={() => setViewMode('TV')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-colors"
            title="Switch to Full TV Display Mode"
          >
            <Tv className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">TV Mode</span>
          </button>

          {/* Secret Admin Control Room Access Button (Requires 123 / 123) */}
          <button
            onClick={() => setViewMode('ADMIN')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition-colors"
            title="Authorized Control Room (User: 123, Pass: 123)"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Control Room</span>
          </button>
        </div>
      </header>

      {/* Main Clean Screen: ONLY Live Video and Live Scoreboard */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-5 space-y-4">
        {/* 1. 🎥 Live Camera Video (Watch Only) with DRS Quick Trigger Bar */}
        <section aria-label="Live Match Video (Watch Only)">
          <div className="flex items-center justify-between mb-1.5 px-1">
            <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping inline-block" />
              Live Broadcast Feed
            </span>

            {/* Quick DRS Trigger directly above video */}
            <button
              onClick={() => setIsDrsOverlayOpen(true)}
              className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-500/40 hover:bg-amber-950/70 transition-colors"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>⚡ Trigger DRS Review Simulation (Checking...)</span>
            </button>
          </div>
          <LiveVideoPlayer />
        </section>

        {/* 2. 🏏 Live Scoreboard */}
        <section aria-label="Live Cricket Scoreboard" className="relative">
          <LiveScoreboardBanner />
          {/* Quick trigger button for Player Scoreboard */}
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => setIsScoreboardModalOpen(true)}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1.5 py-1 px-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-orange-500/40 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Open Detailed Player Scoreboard & Squad Profiles →</span>
            </button>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-zinc-900 bg-zinc-950 px-6 py-3 text-center text-xs text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>THAMIYANUR AGNI SPORTS OTT</span>
          <span>·</span>
          <span>Official 6-Overs Broadcast</span>
        </div>
        <div className="text-[11px] text-zinc-500">
          Watch-Only Stream · AI Optical Vision & Admin Control
        </div>
      </footer>
    </div>
  );
};


