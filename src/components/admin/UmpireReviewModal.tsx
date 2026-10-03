import React, { useState } from 'react';
import { ShieldAlert, Check, X, Camera, Sparkles, Activity, Eye } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';

export const UmpireReviewModal: React.FC = () => {
  const { reviewState, resolveUmpireReview, cancelUmpireReview, cameras } = useCricket();
  const [selectedAngle, setSelectedAngle] = useState<'CAM_1' | 'CAM_2' | 'CAM_5'>('CAM_5');

  if (!reviewState.isActive) return null;

  const cam1 = cameras.find((c) => c.number === 1);
  const cam2 = cameras.find((c) => c.number === 2);
  const cam5 = cameras.find((c) => c.number === 5);

  const getPreviewImage = () => {
    if (selectedAngle === 'CAM_1') return cam1?.streamUrl;
    if (selectedAngle === 'CAM_2') return cam2?.streamUrl;
    return cam5?.streamUrl;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-4xl bg-zinc-950 border border-amber-500/50 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-950/80 via-zinc-900 to-amber-950/80 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-wider">
                  OFFICIAL DRS REVIEW
                </span>
                <span className="text-xs text-zinc-400">Initiated by {reviewState.requestedBy}</span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">
                {reviewState.reviewType.replace('_', ' ')}
              </h2>
            </div>
          </div>

          <button
            onClick={cancelUmpireReview}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content: Multi-Angle Replay & AI Telemetry */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualizer (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-inner">
              <img
                src={getPreviewImage()}
                alt="Replay feed"
                className="h-full w-full object-cover"
              />

              {/* Optical Slow Motion Overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-zinc-700 text-xs">
                <Eye className="w-3.5 h-3.5 text-amber-400" />
                <span className="font-bold text-white">SLOW-MO 120 FPS</span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-300 font-mono-numbers">Frame 184/360</span>
              </div>

              {/* Synthetic UltraEdge soundwave strip at bottom of video */}
              <div className="absolute bottom-3 inset-x-3 bg-zinc-950/90 backdrop-blur-md rounded-lg p-2.5 border border-zinc-700 flex flex-col gap-1">
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono-numbers">
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Activity className="w-3 h-3" /> ULTRA-EDGE AUDIO WAVEFORM
                  </span>
                  <span>SPIKE: 84.2 dB</span>
                </div>
                {/* SVG soundwave */}
                <svg className="w-full h-8" viewBox="0 0 300 30">
                  <path
                    d="M 0 15 Q 40 15 70 15 T 120 15 Q 140 15 150 2 T 160 28 T 170 15 T 220 15 T 300 15"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                  />
                  <line x1="155" y1="0" x2="155" y2="30" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 2" />
                </svg>
              </div>
            </div>

            {/* Angle Switcher Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedAngle('CAM_1')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedAngle === 'CAM_1'
                    ? 'bg-amber-600 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cam 1 (Main Pitch)</span>
              </button>

              <button
                onClick={() => setSelectedAngle('CAM_2')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedAngle === 'CAM_2'
                    ? 'bg-amber-600 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cam 2 (Batsman Front)</span>
              </button>

              <button
                onClick={() => setSelectedAngle('CAM_5')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedAngle === 'CAM_5'
                    ? 'bg-amber-600 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cam 5 (Side Replay)</span>
              </button>
            </div>
          </div>

          {/* AI Assistance & Decision Console (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* AI Recommendation Box */}
            <div className="p-4 rounded-xl bg-zinc-900/90 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI ASSISTED PREDICTION
                </span>
                <span className="text-xs font-bold font-mono-numbers px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {reviewState.aiPrediction.confidence}% CONFIDENCE
                </span>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <span className="text-sm font-bold text-white block">
                  {reviewState.aiPrediction.result}
                </span>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  {reviewState.aiPrediction.notes}
                </p>
              </div>

              <div className="text-[11px] text-zinc-400 italic">
                * Note: AI outputs are provided for assistance. Third umpire has final authority.
              </div>
            </div>

            {/* Official Umpire Decision Buttons */}
            <div className="space-y-2 pt-2 border-t border-zinc-800">
              <div className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                Official Umpire Decision
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => resolveUmpireReview('WIDE')}
                  className="py-3 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-zinc-950 font-black text-sm transition-all shadow active:scale-95"
                >
                  WIDE BALL
                </button>

                <button
                  onClick={() => resolveUmpireReview('LEGAL')}
                  className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm transition-all shadow active:scale-95"
                >
                  LEGAL BALL
                </button>

                <button
                  onClick={() => resolveUmpireReview('OUT')}
                  className="py-3 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm transition-all shadow active:scale-95"
                >
                  OUT (DECISION CONFIRMED)
                </button>

                <button
                  onClick={() => resolveUmpireReview('NOT_OUT')}
                  className="py-3 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-sm transition-all shadow active:scale-95"
                >
                  NOT OUT
                </button>
              </div>

              <button
                onClick={cancelUmpireReview}
                className="w-full py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white font-semibold text-xs transition-colors mt-2"
              >
                Dismiss Review without change
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
