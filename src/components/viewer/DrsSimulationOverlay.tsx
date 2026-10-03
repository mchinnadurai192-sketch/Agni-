import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  Activity,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Camera,
  Radio,
  ArrowRight,
  Sliders,
  Volume2,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCricket } from '../../context/CricketContext';
import { audioAnnouncer } from '../../utils/audioAnnouncer';

export type DrsStage =
  | 'INIT'
  | 'CHECKING_FRONT_FOOT'
  | 'FRONT_FOOT_FAIR'
  | 'CHECKING_ULTRA_EDGE'
  | 'ULTRA_EDGE_FLAT'
  | 'CHECKING_BALL_TRACKING'
  | 'BALL_TRACKING_RESULT'
  | 'CHECKING_DECISION'
  | 'FINAL_DECISION';

interface DrsSimulationOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrsSimulationOverlay: React.FC<DrsSimulationOverlayProps> = ({
  isOpen,
  onClose,
}) => {
  const { match, cameras, isAudioMuted } = useCricket();

  const [reviewScenario, setReviewScenario] = useState<'LBW' | 'CAUGHT_BEHIND' | 'WIDE_LINE'>('LBW');
  const [targetDecision, setTargetDecision] = useState<'OUT' | 'NOT_OUT'>('OUT');
  const [currentStage, setCurrentStage] = useState<DrsStage>('CHECKING_FRONT_FOOT');
  const [selectedCamAngle, setSelectedCamAngle] = useState<'CAM_5' | 'CAM_1' | 'CAM_2'>('CAM_5');
  const [autoPlay, setAutoPlay] = useState<boolean>(true);
  const [progressPct, setProgressPct] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Active cameras
  const cam1 = cameras.find((c) => c.number === 1) || cameras[0];
  const cam2 = cameras.find((c) => c.number === 2) || cameras[1];
  const cam5 = cameras.find((c) => c.number === 5) || cameras[0];

  const getReplayFeedUrl = () => {
    if (selectedCamAngle === 'CAM_1') return cam1.streamUrl;
    if (selectedCamAngle === 'CAM_2') return cam2.streamUrl;
    return cam5.streamUrl;
  };

  // Run the sequence
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    // Play review siren sound when opened
    audioAnnouncer.playReviewSiren();
    audioAnnouncer.announce('DRS review initiated. Checking front foot no-ball.');
    setCurrentStage('CHECKING_FRONT_FOOT');
    setProgressPct(10);

    const step1 = setTimeout(() => {
      setCurrentStage('FRONT_FOOT_FAIR');
      setProgressPct(25);
      audioAnnouncer.announce('Fair delivery. Behind the crease. Move on to UltraEdge.');

      const step2 = setTimeout(() => {
        setCurrentStage('CHECKING_ULTRA_EDGE');
        setProgressPct(45);

        const step3 = setTimeout(() => {
          if (reviewScenario === 'CAUGHT_BEHIND' && targetDecision === 'OUT') {
            setCurrentStage('ULTRA_EDGE_FLAT'); // has spike
            audioAnnouncer.announce('Spike on UltraEdge as ball passes the bat.');
          } else {
            setCurrentStage('ULTRA_EDGE_FLAT');
            audioAnnouncer.announce('No bat involved. Flat line on UltraEdge.');
          }
          setProgressPct(65);

          const step4 = setTimeout(() => {
            if (reviewScenario === 'CAUGHT_BEHIND') {
              setCurrentStage('CHECKING_DECISION');
              setProgressPct(85);
              audioAnnouncer.announce('Decision coming up on the big screen.');
              const stepFinal = setTimeout(() => {
                setCurrentStage('FINAL_DECISION');
                setProgressPct(100);
                if (targetDecision === 'OUT') {
                  audioAnnouncer.playWicketSound();
                  audioAnnouncer.announce('Decision on screen: OUT!');
                  confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
                } else {
                  audioAnnouncer.announce('Decision on screen: NOT OUT!');
                }
              }, 2200);
              return () => clearTimeout(stepFinal);
            }

            // For LBW: Go through Ball Tracking
            setCurrentStage('CHECKING_BALL_TRACKING');
            setProgressPct(75);
            audioAnnouncer.announce('Checking ball tracking. Loading predictive path.');

            const step5 = setTimeout(() => {
              setCurrentStage('BALL_TRACKING_RESULT');
              setProgressPct(88);
              audioAnnouncer.announce(
                targetDecision === 'OUT'
                  ? 'Pitching in line, impact in line, wickets hitting.'
                  : 'Impact outside the line of off stump. Not out.'
              );

              const step6 = setTimeout(() => {
                setCurrentStage('CHECKING_DECISION');
                setProgressPct(95);
                audioAnnouncer.announce('Decision coming up on the big screen.');

                const stepFinal = setTimeout(() => {
                  setCurrentStage('FINAL_DECISION');
                  setProgressPct(100);
                  if (targetDecision === 'OUT') {
                    audioAnnouncer.playWicketSound();
                    audioAnnouncer.announce('Decision on screen: OUT!');
                    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                  } else {
                    audioAnnouncer.announce('Decision on screen: NOT OUT!');
                  }
                }, 2200);
                return () => clearTimeout(stepFinal);
              }, 2400);
              return () => clearTimeout(step6);
            }, 2600);
            return () => clearTimeout(step5);
          }, 2400);
          return () => clearTimeout(step4);
        }, 2200);
        return () => clearTimeout(step3);
      }, 2000);
      return () => clearTimeout(step2);
    }, 2200);

    return () => {
      clearTimeout(step1);
    };
  }, [isOpen, reviewScenario, targetDecision]);

  if (!isOpen) return null;

  const handleRestart = (scenario = reviewScenario, outcome = targetDecision) => {
    setReviewScenario(scenario);
    setTargetDecision(outcome);
    setCurrentStage('CHECKING_FRONT_FOOT');
    setProgressPct(10);
    audioAnnouncer.playReviewSiren();
  };

  const isCheckingFrontFoot = currentStage === 'CHECKING_FRONT_FOOT';
  const isFrontFootDone = currentStage !== 'CHECKING_FRONT_FOOT';
  const isCheckingUltraEdge = currentStage === 'CHECKING_ULTRA_EDGE';
  const isUltraEdgeDone =
    currentStage === 'ULTRA_EDGE_FLAT' ||
    currentStage === 'CHECKING_BALL_TRACKING' ||
    currentStage === 'BALL_TRACKING_RESULT' ||
    currentStage === 'CHECKING_DECISION' ||
    currentStage === 'FINAL_DECISION';
  const isCheckingBallTracking = currentStage === 'CHECKING_BALL_TRACKING';
  const isBallTrackingDone =
    currentStage === 'BALL_TRACKING_RESULT' ||
    currentStage === 'CHECKING_DECISION' ||
    currentStage === 'FINAL_DECISION';
  const isCheckingDecision = currentStage === 'CHECKING_DECISION';
  const isFinalDecision = currentStage === 'FINAL_DECISION';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto select-none animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-950 border-2 border-amber-500/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-amber-950 via-zinc-950 to-amber-950 border-b border-amber-500/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-zinc-950 font-black text-[10px] uppercase tracking-wider animate-pulse">
                  OFFICIAL DRS DECISION SYSTEM
                </span>
                <span className="text-xs text-zinc-400 hidden sm:inline">
                  Third Umpire High-Speed Video Referral
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-0.5 font-display flex items-center gap-2">
                <span>SIMULATED {reviewScenario.replace('_', ' ')} REVIEW</span>
                <span className="text-zinc-600">·</span>
                <span className="text-xs font-mono text-amber-400 font-normal">
                  STADIUM BROADCAST MODE
                </span>
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
            title="Exit DRS Overlay"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar of Review Sequence */}
        <div className="w-full bg-zinc-900 h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 transition-all duration-700 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Main Review Stage Canvas */}
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column: Replay Camera Video with Scanlines & Trajectory (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800 shadow-2xl flex items-center justify-center">
              <img
                src={getReplayFeedUrl()}
                alt="Replay feed"
                className="h-full w-full object-cover"
              />

              {/* Atmospheric CRT scanline */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-zinc-950/60 pointer-events-none" />

              {/* Status Watermark */}
              <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700 text-xs">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                </span>
                <span className="font-bold text-white uppercase text-[11px]">
                  REPLAY SYNC 120 FPS
                </span>
                <span className="text-zinc-500">·</span>
                <span className="text-zinc-300 font-mono-numbers text-[11px]">
                  Frame {isFinalDecision ? '240/240' : `${Math.min(240, progressPct * 2.4 | 0)}/240`}
                </span>
              </div>

              {/* Laser Crease Scanline for Front Foot */}
              {(isCheckingFrontFoot || currentStage === 'FRONT_FOOT_FAIR') && (
                <div className="absolute inset-x-0 bottom-1/3 pointer-events-none">
                  <div className="h-0.5 w-full bg-cyan-400 shadow-[0_0_12px_#38bdf8] animate-pulse" />
                  <div className="text-[10px] font-mono font-bold text-cyan-300 bg-black/80 px-2 py-0.5 w-fit rounded mt-1 ml-4 border border-cyan-500/40">
                    CREASE POPPING LINE: {isCheckingFrontFoot ? 'CALIBRATING...' : 'FAIR 8.4cm'}
                  </div>
                </div>
              )}

              {/* Ball Tracking 3D trajectory path for Hawk-Eye */}
              {(isCheckingBallTracking || isBallTrackingDone) && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 400 225">
                    {/* Pitch turf guideline */}
                    <path
                      d="M 50 190 L 160 120 L 240 120 L 350 190 Z"
                      fill="none"
                      stroke="#15803d"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />

                    {/* Stumps batting end */}
                    <line x1="200" y1="90" x2="200" y2="120" stroke="#facc15" strokeWidth="3" />
                    <line x1="195" y1="92" x2="195" y2="120" stroke="#facc15" strokeWidth="2.5" />
                    <line x1="205" y1="92" x2="205" y2="120" stroke="#facc15" strokeWidth="2.5" />

                    {/* Ball delivery curve */}
                    <path
                      d="M 80 180 Q 150 145 190 135 T 200 100"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="3.5"
                      className="animate-pulse"
                      strokeDasharray={targetDecision === 'OUT' ? '0' : '4 4'}
                    />

                    {/* Pitch landing point */}
                    <circle cx="190" cy="135" r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
                    {/* Wicket impact point */}
                    <circle cx="200" cy="100" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  <div className="absolute top-12 right-4 bg-zinc-950/90 border border-red-500/60 p-2 rounded-lg text-left text-[10px] font-mono-numbers">
                    <span className="text-red-400 font-bold block">HAWK-EYE 3D</span>
                    <span className="text-zinc-300">Pitching: In Line</span>
                    <br />
                    <span className="text-zinc-300">Impact: In Line</span>
                    <br />
                    <span className="text-emerald-400 font-bold">Wickets: Hitting (Middle)</span>
                  </div>
                </div>
              )}

              {/* UltraEdge Audio Waveform Strip */}
              {(isCheckingUltraEdge || isUltraEdgeDone) && !isBallTrackingDone && (
                <div className="absolute bottom-3 inset-x-3 bg-zinc-950/95 backdrop-blur-md rounded-xl p-3 border border-zinc-700 shadow-2xl flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono-numbers">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5" /> ULTRA-EDGE AUDIO SNICKO
                    </span>
                    <span className="text-zinc-300">
                      {isCheckingUltraEdge
                        ? 'SCANNING AUDIO FREQUENCIES...'
                        : reviewScenario === 'CAUGHT_BEHIND' && targetDecision === 'OUT'
                        ? 'SPIKE DETECTED: 86.4 dB'
                        : 'FLAT LINE: NO CONTACT'}
                    </span>
                  </div>

                  {/* Dynamic SVG Waveform */}
                  <svg className="w-full h-9" viewBox="0 0 320 36">
                    <line x1="0" y1="18" x2="320" y2="18" stroke="#3f3f46" strokeWidth="1" />
                    {reviewScenario === 'CAUGHT_BEHIND' && targetDecision === 'OUT' ? (
                      /* Big distinct edge spike */
                      <path
                        d="M 0 18 Q 40 18 80 18 T 130 18 L 140 16 L 148 4 L 154 32 L 160 2 L 166 26 L 172 18 T 240 18 T 320 18"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2.5"
                      />
                    ) : (
                      /* Flat noise line with small micro-ripples */
                      <path
                        d="M 0 18 Q 30 17 60 19 T 120 18 T 180 18 T 240 17 T 320 18"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.8"
                      />
                    )}
                    {/* Bat contact timeline cursor */}
                    <line
                      x1="154"
                      y1="0"
                      x2="154"
                      y2="36"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                    />
                  </svg>
                  <div className="flex items-center justify-between text-[9px] text-zinc-400 font-mono">
                    <span>Frame -12</span>
                    <span className="text-amber-400 font-bold">Ball Next To Bat Crease</span>
                    <span>Frame +12</span>
                  </div>
                </div>
              )}

              {/* Big Stadium Decision Reveal Screen Overlay */}
              {isFinalDecision && (
                <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95 duration-300">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    THIRD UMPIRE OFFICIAL DECISION
                  </span>

                  {targetDecision === 'OUT' ? (
                    <div className="p-6 rounded-2xl bg-red-950/90 border-4 border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.7)] animate-pulse">
                      <div className="text-6xl sm:text-7xl font-black font-display tracking-widest text-white">
                        OUT
                      </div>
                      <span className="text-xs font-bold text-red-200 mt-2 block tracking-wider uppercase">
                        DECISION CONFIRMED · BATSMAN DISMISSED
                      </span>
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl bg-emerald-950/90 border-4 border-emerald-500 shadow-[0_0_60px_rgba(16,185,129,0.7)]">
                      <div className="text-6xl sm:text-7xl font-black font-display tracking-widest text-white">
                        NOT OUT
                      </div>
                      <span className="text-xs font-bold text-emerald-200 mt-2 block tracking-wider uppercase">
                        DECISION REVERSED · BATSMAN REMAINS NOT OUT
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-2 text-xs text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Review Completed · Communicated to On-Field Umpire</span>
                  </div>
                </div>
              )}
            </div>

            {/* Replay Angles Switcher Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedCamAngle('CAM_5')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedCamAngle === 'CAM_5'
                    ? 'bg-amber-600 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cam 5 (Slow-Mo Replay)</span>
              </button>

              <button
                onClick={() => setSelectedCamAngle('CAM_1')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedCamAngle === 'CAM_1'
                    ? 'bg-amber-600 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cam 1 (Main Pitch)</span>
              </button>

              <button
                onClick={() => setSelectedCamAngle('CAM_2')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                  selectedCamAngle === 'CAM_2'
                    ? 'bg-amber-600 text-zinc-950 border-amber-400'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Cam 2 (Batsman Close)</span>
              </button>
            </div>
          </div>

          {/* Right Column: Step-by-Step 'Checking...' Decision Pipeline (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            {/* DRS Inspection Steps List */}
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                DRS DECISION PROTOCOL
              </span>

              {/* Step 1: Front Foot No-Ball */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  isCheckingFrontFoot
                    ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-400 animate-pulse'
                    : isFrontFootDone
                    ? 'bg-zinc-950/80 border-emerald-600/60'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">1. Front-Foot Crease Check</span>
                  {isCheckingFrontFoot && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />
                      Checking...
                    </span>
                  )}
                  {isFrontFootDone && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Fair Delivery
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Verifying bowler's landing foot behind the popping crease line.
                </p>
              </div>

              {/* Step 2: Ultra-Edge Audio Snicko */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  isCheckingUltraEdge
                    ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-400 animate-pulse'
                    : isUltraEdgeDone
                    ? 'bg-zinc-950/80 border-emerald-600/60'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">2. Ultra-Edge Contact Check</span>
                  {isCheckingUltraEdge && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono">
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />
                      Checking...
                    </span>
                  )}
                  {isUltraEdgeDone && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {reviewScenario === 'CAUGHT_BEHIND' && targetDecision === 'OUT'
                        ? 'Edge Confirmed'
                        : 'No Bat Involved'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Synchronizing high-speed directional audio sensors with ball position.
                </p>
              </div>

              {/* Step 3: Ball Tracking / Hawk-Eye */}
              {reviewScenario !== 'CAUGHT_BEHIND' && (
                <div
                  className={`p-3 rounded-xl border transition-all ${
                    isCheckingBallTracking
                      ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-400 animate-pulse'
                      : isBallTrackingDone
                      ? 'bg-zinc-950/80 border-emerald-600/60'
                      : 'bg-zinc-950/40 border-zinc-800 text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">3. Hawk-Eye Ball Tracking</span>
                    {isCheckingBallTracking && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono">
                        <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping inline-block" />
                        Checking...
                      </span>
                    )}
                    {isBallTrackingDone && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 font-mono">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {targetDecision === 'OUT' ? 'Hitting Stumps' : 'Missing Stumps'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Simulating 3D ballistic trajectory, bounce angle, and impact corridor.
                  </p>
                </div>
              )}

              {/* Step 4: Decision Pending */}
              <div
                className={`p-3 rounded-xl border transition-all ${
                  isCheckingDecision
                    ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-400 animate-pulse'
                    : isFinalDecision
                    ? 'bg-zinc-950/80 border-emerald-600/60'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">4. Big Screen Transmission</span>
                  {isCheckingDecision && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 font-mono animate-bounce">
                      Decision Pending...
                    </span>
                  )}
                  {isFinalDecision && (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-orange-400 font-mono">
                      Signal Complete
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 mt-1">
                  Transmitting third umpire decision to stadium display and on-field official.
                </p>
              </div>
            </div>

            {/* Quick Scenario & Outcome Controls */}
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                Simulate Different DRS Scenarios:
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleRestart('LBW', 'OUT')}
                  className={`py-2 px-2.5 rounded-lg border font-bold transition-all text-left flex flex-col ${
                    reviewScenario === 'LBW' && targetDecision === 'OUT'
                      ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <span>🎯 LBW Review</span>
                  <span className="text-[10px] font-normal text-zinc-400">Result: OUT</span>
                </button>

                <button
                  onClick={() => handleRestart('CAUGHT_BEHIND', 'OUT')}
                  className={`py-2 px-2.5 rounded-lg border font-bold transition-all text-left flex flex-col ${
                    reviewScenario === 'CAUGHT_BEHIND' && targetDecision === 'OUT'
                      ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <span>🎙️ Caught Behind</span>
                  <span className="text-[10px] font-normal text-zinc-400">Result: OUT (Edge)</span>
                </button>

                <button
                  onClick={() => handleRestart('LBW', 'NOT_OUT')}
                  className={`py-2 px-2.5 rounded-lg border font-bold transition-all text-left flex flex-col ${
                    reviewScenario === 'LBW' && targetDecision === 'NOT_OUT'
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white'
                  }`}
                >
                  <span>🛡️ LBW Not Out</span>
                  <span className="text-[10px] font-normal text-zinc-400">Result: NOT OUT</span>
                </button>

                <button
                  onClick={() => handleRestart(reviewScenario, targetDecision)}
                  className="py-2 px-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-orange-400" />
                  <span>Replay Animation</span>
                </button>
              </div>
            </div>

            {/* Exit Overlay */}
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white font-bold text-xs transition-colors"
            >
              Close DRS Simulation Overlay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
