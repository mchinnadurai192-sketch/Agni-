import React, { useState } from 'react';
import { Sparkles, Gauge, ArrowUpRight, CheckCircle2, AlertTriangle, ShieldCheck, History, Activity, CircleDot } from 'lucide-react';
import { useCricket } from '../../context/CricketContext';
import { BallEvent, LengthCategory } from '../../types/cricket';

interface SpeedometerGaugeProps {
  speed?: number | null;
}

const SpeedometerGauge: React.FC<SpeedometerGaugeProps> = ({ speed }) => {
  const minSpeed = 80;
  const maxSpeed = 160;
  const speedVal = typeof speed === 'number' && !isNaN(speed) ? Math.round(speed * 10) / 10 : 138;
  const clampedSpeed = Math.min(Math.max(speedVal, minSpeed), maxSpeed);
  const percentage = (clampedSpeed - minSpeed) / (maxSpeed - minSpeed);

  // 240 degree sweep from 150 deg (bottom-left) to 390 deg (bottom-right)
  const angle = 150 + percentage * 240;
  const rad = (angle * Math.PI) / 180;

  const cx = 60;
  const cy = 56;
  const r = 42;
  const needleLength = 32;

  // Needle tip
  const nx = cx + needleLength * Math.cos(rad);
  const ny = cy + needleLength * Math.sin(rad);

  // Tapered needle base
  const baseRad1 = ((angle + 90) * Math.PI) / 180;
  const baseRad2 = ((angle - 90) * Math.PI) / 180;
  const bx1 = cx + 3.5 * Math.cos(baseRad1);
  const by1 = cy + 3.5 * Math.sin(baseRad1);
  const bx2 = cx + 3.5 * Math.cos(baseRad2);
  const by2 = cy + 3.5 * Math.sin(baseRad2);

  const circumference = 2 * Math.PI * r;
  const arcLength = circumference * (240 / 360);
  const filledLength = arcLength * percentage;

  const isExpress = speedVal >= 145;
  const isFast = speedVal >= 135 && speedVal < 145;
  const isMedium = speedVal >= 120 && speedVal < 135;

  const speedCategory = isExpress
    ? 'EXPRESS FAST'
    : isFast
    ? 'FAST PACE'
    : isMedium
    ? 'MEDIUM PACE'
    : 'SLOW / SPIN';

  const categoryColor = isExpress
    ? 'text-red-400 bg-red-950/60 border-red-600/60'
    : isFast
    ? 'text-orange-400 bg-orange-950/60 border-orange-500/60'
    : isMedium
    ? 'text-amber-400 bg-amber-950/60 border-amber-600/60'
    : 'text-blue-400 bg-blue-950/60 border-blue-600/60';

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-[124px] h-[92px] flex items-center justify-center">
        <svg viewBox="0 0 120 95" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="speedGaugeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="75%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
            <filter id="needleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#f97316" floodOpacity="0.7" />
            </filter>
          </defs>

          {/* Background Track Arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="#27272a"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset="0"
            transform={`rotate(150 ${cx} ${cy})`}
          />

          {/* Active Speed Arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="url(#speedGaugeGradient)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference}`}
            strokeDashoffset="0"
            transform={`rotate(150 ${cx} ${cy})`}
            className="transition-all duration-500 ease-out"
          />

          {/* Speed Ticks at 80, 100, 120, 140, 160 */}
          {[80, 100, 120, 140, 160].map((tick) => {
            const tickP = (tick - minSpeed) / (maxSpeed - minSpeed);
            const tickA = 150 + tickP * 240;
            const tickR = (tickA * Math.PI) / 180;
            const tInner = 33;
            const tOuter = 38;
            const x1 = cx + tInner * Math.cos(tickR);
            const y1 = cy + tInner * Math.sin(tickR);
            const x2 = cx + tOuter * Math.cos(tickR);
            const y2 = cy + tOuter * Math.sin(tickR);
            const textR = 25.5;
            const tx = cx + textR * Math.cos(tickR);
            const ty = cy + textR * Math.sin(tickR) + 2.5;

            return (
              <g key={tick}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a1a1aa" strokeWidth="1.5" />
                <text
                  x={tx}
                  y={ty}
                  fill="#a1a1aa"
                  fontSize="6.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="monospace"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Intermediate Sub-Ticks at 90, 110, 130, 150 */}
          {[90, 110, 130, 150].map((subTick) => {
            const subP = (subTick - minSpeed) / (maxSpeed - minSpeed);
            const subA = 150 + subP * 240;
            const subR = (subA * Math.PI) / 180;
            const stInner = 35;
            const stOuter = 38;
            const sx1 = cx + stInner * Math.cos(subR);
            const sy1 = cy + stInner * Math.sin(subR);
            const sx2 = cx + stOuter * Math.cos(subR);
            const sy2 = cy + stOuter * Math.sin(subR);

            return (
              <line
                key={`sub-${subTick}`}
                x1={sx1}
                y1={sy1}
                x2={sx2}
                y2={sy2}
                stroke="#52525b"
                strokeWidth="1"
              />
            );
          })}

          {/* Tapered Speedometer Needle */}
          <polygon
            points={`${bx1},${by1} ${nx},${ny} ${bx2},${by2}`}
            fill={isExpress ? '#ef4444' : '#f97316'}
            filter="url(#needleGlow)"
            className="transition-all duration-500 ease-out"
          />

          {/* Center Pivot Bezel */}
          <circle cx={cx} cy={cy} r="5.5" fill="#18181b" stroke="#71717a" strokeWidth="1.5" />
          <circle cx={cx} cy={cy} r="2" fill={isExpress ? '#ef4444' : '#f97316'} />
        </svg>

        {/* Center Digital Speed Readout */}
        <div className="absolute bottom-0 text-center">
          <span className="text-lg font-black font-mono-numbers tracking-tight text-white leading-none">
            {speedVal}
          </span>
          <span className="text-[8px] font-bold text-zinc-400 block tracking-wider font-mono">
            KM/H
          </span>
        </div>
      </div>

      {/* Speed Category Pill */}
      <span className={`mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${categoryColor}`}>
        {speedCategory}
      </span>
    </div>
  );
};

export const AIBallAnalysisCard: React.FC = () => {
  const { match } = useCricket();

  const balls = match.currentOverBalls;
  const latestBall = balls[balls.length - 1];

  // State to inspect a specific historical ball or default to latest
  const [inspectedBallId, setInspectedBallId] = useState<string | null>(null);

  const displayBall: BallEvent | undefined =
    balls.find((b) => b.id === inspectedBallId) || latestBall;

  const ai = displayBall?.aiAnalysis;

  const getLengthDisplay = (length?: LengthCategory) => {
    switch (length) {
      case 'YORKER':
        return { label: 'YORKER', desc: 'At the batsman toes / crease line', style: 'bg-purple-950/80 text-purple-300 border-purple-600' };
      case 'FULL':
        return { label: 'FULL', desc: 'Driving length on the front foot', style: 'bg-blue-950/80 text-blue-300 border-blue-600' };
      case 'GOOD_LENGTH':
        return { label: 'GOOD', desc: 'Top of off-stump channel', style: 'bg-emerald-950/80 text-emerald-300 border-emerald-600' };
      case 'BACK_OF_LENGTH':
        return { label: 'GOOD', desc: 'Back of length corridor', style: 'bg-emerald-950/80 text-emerald-300 border-emerald-600' };
      case 'SHORT':
        return { label: 'SHORT', desc: 'Waist-height rising ball', style: 'bg-amber-950/80 text-amber-300 border-amber-600' };
      case 'BOUNCER':
        return { label: 'BOUNCER', desc: 'Above shoulder-height delivery', style: 'bg-rose-950/80 text-rose-300 border-rose-600' };
      default:
        return { label: 'GOOD', desc: 'Standard length', style: 'bg-zinc-800 text-zinc-300 border-zinc-700' };
    }
  };

  const lengthInfo = getLengthDisplay(ai?.length);

  return (
    <div className="flex flex-col rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-xl space-y-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="font-bold uppercase tracking-wider text-zinc-100 font-display">
            AI BALL ANALYSIS
          </span>
          {displayBall && (
            <span className="font-mono-numbers text-orange-400 font-bold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              Ball {displayBall.displayOver}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>AI Vision: {ai?.trackingConfidence || 96}% Confidence</span>
        </div>
      </div>

      {ai ? (
        <>
          {/* Main 5 Core Telemetry Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80 p-4 bg-zinc-950/40">
            {/* 1. Ball Length */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                Ball Length
              </span>
              <div className="mt-1.5">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider border shadow-sm ${lengthInfo.style}`}
                >
                  {lengthInfo.label}
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 line-clamp-1">
                {lengthInfo.desc}
              </span>
            </div>

            {/* 2. Dot-Ball Detection */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <CircleDot className="w-3.5 h-3.5 text-emerald-400" />
                Dot-Ball Detection
              </span>
              <div className="mt-1.5">
                {displayBall.runs === 0 && displayBall.isLegalDelivery && !displayBall.isWicket ? (
                  <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    DOT BALL
                  </span>
                ) : displayBall.isWicket ? (
                  <span className="px-2.5 py-1 rounded bg-red-950/80 text-red-300 border border-red-600 font-bold text-xs">
                    WICKET!
                  </span>
                ) : displayBall.extraType === 'WIDE' ? (
                  <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-600 font-bold text-xs">
                    WIDE (+1)
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-blue-950/80 text-blue-300 border border-blue-600 font-bold text-xs">
                    {displayBall.runs} RUN{displayBall.runs > 1 ? 'S' : ''}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1">
                {displayBall.runs === 0 && displayBall.isLegalDelivery ? '0 runs conceded' : 'Scoring event'}
              </span>
            </div>

            {/* 3. Wide Prediction */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Wide Prediction
              </span>
              <div className="mt-1.5">
                {ai.wideProbability > 60 ? (
                  <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-600 text-xs font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    WIDE PREDICTED
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-600 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    LEGAL BALL
                  </span>
                )}
              </div>
              <span className="text-[10px] text-zinc-400 mt-1 font-mono-numbers">
                Confidence: {ai.wideProbability > 50 ? ai.wideProbability : 100 - ai.wideProbability}%
              </span>
            </div>

            {/* 4. Ball Speed (Speedometer-style Circular Gauge) */}
            <div className="flex flex-col items-center justify-center p-2 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                <Gauge className="w-3.5 h-3.5 text-orange-400" />
                Speedometer Gauge
              </span>
              <SpeedometerGauge speed={ai.speedKmh} />
            </div>

            {/* 5. Bounce */}
            <div className="flex flex-col items-center justify-center p-2 text-center">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                Bounce Height
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black font-mono-numbers text-zinc-100">
                  {ai.bounceMeters}
                </span>
                <span className="text-xs font-semibold text-zinc-400">m</span>
              </div>
              <span className="text-[10px] text-zinc-400 mt-0.5 uppercase tracking-wide">
                {ai.bounceCategory} Bounce
              </span>
            </div>
          </div>

          {/* Bounce / Pitch Location Map */}
          <div className="p-4 bg-zinc-900 border-t border-zinc-800">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2">
              <span className="font-semibold uppercase text-zinc-200">
                Bounce & Pitch Location Map
              </span>
              <span className="font-mono-numbers">
                Landing Spot: X {ai.pitchX}% · Y {ai.pitchY}% · Release {ai.releasePoint.height}m
              </span>
            </div>

            <div className="relative h-24 w-full rounded-lg bg-emerald-950/70 border border-emerald-800/60 overflow-hidden flex items-center justify-center">
              {/* Pitch turf corridor */}
              <div className="absolute inset-y-0 left-1/4 right-1/4 bg-amber-900/30 border-x border-amber-700/40" />

              {/* Creases */}
              <div className="absolute top-2 inset-x-8 h-0.5 bg-white/70" />
              <div className="absolute bottom-2 inset-x-8 h-0.5 bg-white/70" />

              {/* Stumps Top (Batting End) */}
              <div className="absolute top-1 left-1/2 -translate-x-1/2 flex gap-1">
                <span className="h-1.5 w-1 bg-amber-200 rounded-sm" />
                <span className="h-1.5 w-1 bg-amber-200 rounded-sm" />
                <span className="h-1.5 w-1 bg-amber-200 rounded-sm" />
              </div>

              {/* Stumps Bottom (Bowling End) */}
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                <span className="h-1.5 w-1 bg-amber-200 rounded-sm" />
                <span className="h-1.5 w-1 bg-amber-200 rounded-sm" />
                <span className="h-1.5 w-1 bg-amber-200 rounded-sm" />
              </div>

              {/* Trajectory line */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none">
                <path
                  d={`M 50% 90% Q ${ai.pitchX}% 50% ${ai.pitchX}% ${100 - ai.pitchY}% T 50% 10%`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2.5"
                  strokeDasharray="4 4"
                />
              </svg>

              {/* Landing spot marker */}
              <div
                style={{
                  left: `${ai.pitchX}%`,
                  top: `${Math.max(15, Math.min(85, 100 - ai.pitchY))}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center"
              >
                <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border-2 border-white shadow-lg" />
              </div>

              <div className="absolute bottom-1 right-2 text-[9px] text-zinc-400 font-mono-numbers bg-zinc-950/80 px-1.5 py-0.5 rounded">
                Bounce: {ai.bounceMeters}m
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="p-6 text-center text-xs text-zinc-500">
          Awaiting ball delivery tracking telemetry...
        </div>
      )}

      {/* Ball-by-ball AI Event History Section */}
      <div className="p-4 bg-zinc-950 border-t border-zinc-800">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Ball-by-Ball AI Event History
          </span>
          <span className="text-[10px] text-zinc-400">
            Click any ball to inspect pitch trajectory
          </span>
        </div>

        <div className="overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max pb-1">
            {balls.map((b) => {
              const isSelected = b.id === (inspectedBallId || latestBall?.id);
              const bAi = b.aiAnalysis;
              const len = getLengthDisplay(bAi?.length);

              const isDot = b.runs === 0 && b.isLegalDelivery && !b.isWicket;

              return (
                <button
                  key={b.id}
                  onClick={() => setInspectedBallId(b.id)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-orange-950/30 border-orange-500 ring-1 ring-orange-400'
                      : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs mb-1">
                    <span className="font-mono-numbers font-bold text-white">
                      Over {b.displayOver}
                    </span>
                    <span
                      className={`h-5 w-5 rounded-full flex items-center justify-center font-bold text-[10px] font-mono-numbers ${
                        b.isWicket
                          ? 'bg-red-600 text-white'
                          : b.runs === 6
                          ? 'bg-purple-600 text-white'
                          : b.runs === 4
                          ? 'bg-blue-600 text-white'
                          : b.extraType === 'WIDE'
                          ? 'bg-amber-600 text-zinc-950'
                          : isDot
                          ? 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                          : 'bg-zinc-700 text-white'
                      }`}
                    >
                      {b.isWicket ? 'W' : b.extraType === 'WIDE' ? 'Wd' : b.runs}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="font-bold text-orange-400 uppercase">
                      {len.label}
                    </span>
                    <span className="text-zinc-500">·</span>
                    <span className="text-zinc-300 font-mono-numbers">
                      {bAi?.speedKmh} km/h
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-1 text-[9px] text-zinc-400">
                    <span>{isDot ? '🟢 Dot' : b.extraType === 'WIDE' ? '🟡 Wide' : '⚡ Run'}</span>
                    <span>·</span>
                    <span>{bAi?.bounceMeters}m</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
