import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Match,
  CameraFeed,
  BallEvent,
  AIAnalysis,
  ReviewState,
  SystemHealth,
  CommentaryItem,
  ExtraType,
  WicketType,
  LengthCategory,
  Player,
  Team,
  BatterMatchStats,
  BowlerMatchStats,
} from '../types/cricket';
import {
  INITIAL_CAMERAS,
  INITIAL_MATCH,
  INITIAL_SYSTEM_HEALTH,
} from '../data/initialData';
import { audioAnnouncer } from '../utils/audioAnnouncer';

interface VoiceCommandProposal {
  command: string;
  type: 'SCORE' | 'WICKET' | 'EXTRA' | 'CAMERA' | 'REVIEW' | 'UNDO';
  description: string;
  action: () => void;
}

interface CricketContextType {
  match: Match;
  cameras: CameraFeed[];
  activeCameraId: string;
  setActiveCameraId: (id: string) => void;
  programCameraId: string;
  setProgramCameraId: (id: string) => void;
  reviewState: ReviewState;
  systemHealth: SystemHealth;
  commentary: CommentaryItem[];
  viewMode: 'VIEWER' | 'ADMIN' | 'TV' | 'CAMERA';
  setViewMode: (mode: 'VIEWER' | 'ADMIN' | 'TV' | 'CAMERA') => void;
  broadcasterCameraId: string;
  setBroadcasterCameraId: (id: string) => void;
  isNewMatchModalOpen: boolean;
  setIsNewMatchModalOpen: (open: boolean) => void;
  switchPresetMatch: (presetId: string) => void;
  startNewMatchCustom: (params: {
    title: string;
    tournament: string;
    venue: string;
    totalOvers: number;
    teamAName: string;
    teamBName: string;
    tossWinner: 'TEAM_A' | 'TEAM_B';
    tossDecision: 'BAT' | 'BOWL';
  }) => void;
  isAudioMuted: boolean;
  setIsAudioMuted: (muted: boolean) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  pendingVoiceCommand: VoiceCommandProposal | null;
  confirmVoiceCommand: () => void;
  cancelVoiceCommand: () => void;
  handleVoiceInput: (transcript: string) => void;

  // Scoring Operations
  recordBall: (params: {
    runs: number;
    extraType: ExtraType;
    extraRuns?: number;
    isWicket: boolean;
    wicketType?: WicketType;
    dismissedPlayerId?: string;
    fielderId?: string;
    customCommentary?: string;
    aiSpeed?: number;
    aiLength?: LengthCategory;
    aiBounce?: number;
  }) => void;
  undoLastBall: () => void;

  // Review Operations
  startUmpireReview: (params: {
    reviewType: ReviewState['reviewType'];
    requestedBy: ReviewState['requestedBy'];
    notes?: string;
  }) => void;
  resolveUmpireReview: (decision: 'WIDE' | 'LEGAL' | 'OUT' | 'NOT_OUT' | 'NO_BALL') => void;
  cancelUmpireReview: () => void;

  // Camera Management
  updateCameraStatus: (cameraId: string, updates: Partial<CameraFeed>) => void;
  reconnectCamera: (cameraId: string) => void;

  // Match Management
  updateMatchMeta: (updates: Partial<Match>) => void;
  resetMatchToDefault: () => void;
  clearScoresForNextMatch: (nextMatchTitle?: string) => void;
  updatePlayerDetails: (teamId: string, playerId: string, updates: Partial<Player>) => void;
  updatePlayerMatchStats: (playerId: string, battingUpdates?: Partial<BatterMatchStats>, bowlingUpdates?: Partial<BowlerMatchStats>) => void;
  addNewPlayerToTeam: (teamId: string, player: Player) => void;
  switchStrike: () => void;
  setActiveBowler: (bowlerId: string) => void;
}

const CricketContext = createContext<CricketContextType | null>(null);

const STORAGE_KEY_MATCH = 'agni_sports_match_state_v1';
const STORAGE_KEY_CAMERAS = 'agni_sports_cameras_v1';

export const CricketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Initialize State
  const [match, setMatch] = useState<Match>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MATCH);
      if (!saved) return INITIAL_MATCH;
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.teamA || !parsed.teamB || !parsed.battingStats) {
        return INITIAL_MATCH;
      }
      return {
        ...INITIAL_MATCH,
        ...parsed,
        teamA: parsed.teamA || INITIAL_MATCH.teamA,
        teamB: parsed.teamB || INITIAL_MATCH.teamB,
        battingStats: parsed.battingStats || INITIAL_MATCH.battingStats,
        bowlingStats: parsed.bowlingStats || INITIAL_MATCH.bowlingStats,
      };
    } catch {
      return INITIAL_MATCH;
    }
  });

  const [cameras, setCameras] = useState<CameraFeed[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CAMERAS);
      if (!saved) return INITIAL_CAMERAS;
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CAMERAS;
      return parsed;
    } catch {
      return INITIAL_CAMERAS;
    }
  });

  const [activeCameraId, setActiveCameraId] = useState<string>('cam-1');
  const [programCameraId, setProgramCameraId] = useState<string>('cam-1');
  const [systemHealth, setSystemHealth] = useState<SystemHealth>(INITIAL_SYSTEM_HEALTH);
  const [viewMode, setViewMode] = useState<'VIEWER' | 'ADMIN' | 'TV' | 'CAMERA'>('VIEWER');
  const [broadcasterCameraId, setBroadcasterCameraId] = useState<string>('cam-1');
  const [isNewMatchModalOpen, setIsNewMatchModalOpen] = useState<boolean>(false);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(true);
  const [pendingVoiceCommand, setPendingVoiceCommand] = useState<VoiceCommandProposal | null>(null);

  const [reviewState, setReviewState] = useState<ReviewState>({
    isActive: false,
    reviewType: 'WIDE_CHECK',
    requestedBy: 'UMPIRE',
    aiPrediction: {
      result: 'Legal delivery projected',
      confidence: 89,
      notes: 'Ball passed inside wide line guideline by 4.2cm',
    },
    cameraAngle: 'Camera 2 (Batsman)',
    status: 'COMPLETED',
    initiatedAt: 0,
  });

  const [commentary, setCommentary] = useState<CommentaryItem[]>([
    {
      id: 'comm-init-3',
      overStr: '16.3',
      ballEventId: 'b-16-3',
      runs: 0,
      eventSummary: 'DOT BALL',
      text: 'Yorker targeted at the base of off-stump, dug out straight to mid-on. 141.8 km/h.',
      timestamp: Date.now() - 30000,
    },
    {
      id: 'comm-init-2',
      overStr: '16.2',
      ballEventId: 'b-16-2',
      runs: 4,
      eventSummary: 'FOUR RUNS',
      text: 'FOUR! Dispatched! Overpitched outside off, Vignesh drives through cover with authority!',
      timestamp: Date.now() - 80000,
      isHighlighted: true,
    },
    {
      id: 'comm-init-1',
      overStr: '16.1',
      ballEventId: 'b-16-1',
      runs: 1,
      eventSummary: '1 RUN',
      text: 'Good length on off stump, tapped gently to deep cover for a rotation single.',
      timestamp: Date.now() - 120000,
    },
  ]);

  // 2. BroadcastChannel for cross-tab synchronization
  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('agni_sports_sync_channel');
      channel.onmessage = (event) => {
        if (event.data?.type === 'MATCH_UPDATE') {
          setMatch(event.data.payload);
        } else if (event.data?.type === 'CAMERA_UPDATE') {
          setCameras(event.data.payload);
        } else if (event.data?.type === 'PROGRAM_CAMERA') {
          setProgramCameraId(event.data.payload);
        } else if (event.data?.type === 'REVIEW_UPDATE') {
          setReviewState(event.data.payload);
        }
      };
    } catch {
      // BroadcastChannel unsupported fallback
    }

    return () => {
      channel?.close();
    };
  }, []);

  // Save to localStorage and broadcast on changes
  const broadcastChange = useCallback((type: string, payload: unknown) => {
    try {
      const channel = new BroadcastChannel('agni_sports_sync_channel');
      channel.postMessage({ type, payload });
      channel.close();
    } catch {
      // Ignore fallback
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MATCH, JSON.stringify(match));
    } catch {
      // Storage quota or disabled
    }
    broadcastChange('MATCH_UPDATE', match);
  }, [match, broadcastChange]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CAMERAS, JSON.stringify(cameras));
    } catch {
      // Storage quota or disabled
    }
    broadcastChange('CAMERA_UPDATE', cameras);
  }, [cameras, broadcastChange]);

  // 3. Audio & Voice Settings Sync
  useEffect(() => {
    audioAnnouncer.setMuted(isAudioMuted);
    audioAnnouncer.setVoiceEnabled(isVoiceEnabled);
  }, [isAudioMuted, isVoiceEnabled]);

  // 4. Trigger celebration on big moments
  const triggerCelebration = useCallback((type: 'FOUR' | 'SIX' | 'WICKET') => {
    if (type === 'SIX') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ea580c', '#f97316', '#fbbf24', '#ffffff'],
      });
      audioAnnouncer.playBoundaryCelebration('SIX');
      audioAnnouncer.announce('Maximum! That is six runs!');
    } else if (type === 'FOUR') {
      confetti({
        particleCount: 45,
        spread: 50,
        origin: { y: 0.65 },
        colors: ['#ea580c', '#38bdf8', '#fbbf24'],
      });
      audioAnnouncer.playBoundaryCelebration('FOUR');
      audioAnnouncer.announce('Four runs! To the boundary!');
    } else if (type === 'WICKET') {
      audioAnnouncer.playWicketSound();
      audioAnnouncer.announce('Wicket! That is out! Big moment in the match.');
    }
  }, []);

  // 5. Strike Rotation helper
  const switchStrike = useCallback(() => {
    setMatch((prev) => {
      const oldStriker = prev.activeStrikerId;
      const oldNonStriker = prev.activeNonStrikerId;
      return {
        ...prev,
        activeStrikerId: oldNonStriker,
        activeNonStrikerId: oldStriker,
        battingStats: {
          ...prev.battingStats,
          [oldStriker]: {
            ...prev.battingStats[oldStriker],
            isOnStrike: false,
          },
          [oldNonStriker]: {
            ...prev.battingStats[oldNonStriker],
            isOnStrike: true,
          },
        },
      };
    });
  }, []);

  const setActiveBowler = useCallback((bowlerId: string) => {
    setMatch((prev) => ({
      ...prev,
      activeBowlerId: bowlerId,
    }));
  }, []);

  // 6. Record Ball Engine (The Single Source of Truth!)
  const recordBall = useCallback(
    ({
      runs,
      extraType,
      extraRuns = 0,
      isWicket,
      wicketType = 'BOWLED',
      dismissedPlayerId,
      fielderId,
      customCommentary,
      aiSpeed,
      aiLength,
      aiBounce,
    }: {
      runs: number;
      extraType: ExtraType;
      extraRuns?: number;
      isWicket: boolean;
      wicketType?: WicketType;
      dismissedPlayerId?: string;
      fielderId?: string;
      customCommentary?: string;
      aiSpeed?: number;
      aiLength?: LengthCategory;
      aiBounce?: number;
    }) => {
      setMatch((prev) => {
        const isLegal = extraType !== 'WIDE' && extraType !== 'NO_BALL';
        const currentInningsKey = prev.currentInnings === 1 ? 'innings1' : 'innings2';
        const currentInnings = prev[currentInningsKey] || prev.innings1;

        const currentOversDecimal = currentInnings.overs;
        const currentFullOvers = Math.floor(currentOversDecimal);
        const currentBallsInOver = Math.round((currentOversDecimal - currentFullOvers) * 10);

        let nextBallsInOver = currentBallsInOver;
        let nextFullOvers = currentFullOvers;
        let isOverComplete = false;

        if (isLegal) {
          nextBallsInOver += 1;
          if (nextBallsInOver >= 6) {
            nextFullOvers += 1;
            nextBallsInOver = 0;
            isOverComplete = true;
          }
        }

        const newOversFloat = parseFloat(`${nextFullOvers}.${nextBallsInOver}`);
        const totalBallsBowled = currentInnings.ballsTotal + (isLegal ? 1 : 0);

        // Run calculations
        const totalBallRuns = runs + extraRuns + (extraType === 'WIDE' || extraType === 'NO_BALL' ? 1 : 0);
        const newTotalRuns = currentInnings.totalRuns + totalBallRuns;
        const newWickets = currentInnings.wickets + (isWicket ? 1 : 0);

        // Current Run Rate
        const oversElapsedNumber = nextFullOvers + nextBallsInOver / 6;
        const newCRR = oversElapsedNumber > 0 ? parseFloat((newTotalRuns / oversElapsedNumber).toFixed(2)) : 0;

        // Batter Stats
        const strikerId = prev.activeStrikerId;
        const nonStrikerId = prev.activeNonStrikerId;
        const strikerStats = prev.battingStats[strikerId] || {
          playerId: strikerId,
          runs: 0,
          balls: 0,
          fours: 0,
          sixes: 0,
          strikeRate: 0,
          isOut: false,
          isOnStrike: true,
        };

        const updatedStrikerRuns = strikerStats.runs + (extraType === 'BYE' || extraType === 'LEG_BYE' || extraType === 'WIDE' ? 0 : runs);
        const updatedStrikerBalls = strikerStats.balls + (extraType === 'WIDE' ? 0 : 1);
        const updatedFours = strikerStats.fours + (runs === 4 && (extraType === 'NONE' || extraType === 'NO_BALL') ? 1 : 0);
        const updatedSixes = strikerStats.sixes + (runs === 6 && (extraType === 'NONE' || extraType === 'NO_BALL') ? 1 : 0);
        const updatedSR = updatedStrikerBalls > 0 ? parseFloat(((updatedStrikerRuns / updatedStrikerBalls) * 100).toFixed(1)) : 0;

        const effectiveDismissedId = dismissedPlayerId || strikerId;
        const isStrikerOut = isWicket && effectiveDismissedId === strikerId;

        // Bowler Stats
        const bowlerId = prev.activeBowlerId;
        const bowlerStats = prev.bowlingStats[bowlerId] || {
          playerId: bowlerId,
          overs: 0,
          maidens: 0,
          runsConceded: 0,
          wickets: 0,
          economy: 0,
          dots: 0,
          wides: 0,
          noBalls: 0,
        };

        const bowlerFullOvers = Math.floor(bowlerStats.overs);
        const bowlerBalls = Math.round((bowlerStats.overs - bowlerFullOvers) * 10);
        let nextBowlerBalls = bowlerBalls;
        let nextBowlerFull = bowlerFullOvers;
        if (isLegal) {
          nextBowlerBalls += 1;
          if (nextBowlerBalls >= 6) {
            nextBowlerFull += 1;
            nextBowlerBalls = 0;
          }
        }
        const updatedBowlerOvers = parseFloat(`${nextBowlerFull}.${nextBowlerBalls}`);
        const bowlerRunsConceded = bowlerStats.runsConceded + runs + (extraType === 'WIDE' || extraType === 'NO_BALL' ? 1 + extraRuns : 0);
        const updatedBowlerWickets = bowlerStats.wickets + (isWicket && wicketType !== 'RUN_OUT' ? 1 : 0);
        const bowlerOversElapsed = nextBowlerFull + nextBowlerBalls / 6;
        const updatedEconomy = bowlerOversElapsed > 0 ? parseFloat((bowlerRunsConceded / bowlerOversElapsed).toFixed(2)) : 0;
        const updatedDots = bowlerStats.dots + (totalBallRuns === 0 ? 1 : 0);

        // AI Ball Analysis Simulator & Physics Model
        const simulatedSpeed = aiSpeed || parseFloat((132 + Math.random() * 14).toFixed(1));
        const lengths: LengthCategory[] = ['YORKER', 'FULL', 'GOOD_LENGTH', 'BACK_OF_LENGTH', 'SHORT'];
        const simulatedLength: LengthCategory = aiLength || lengths[Math.floor(Math.random() * lengths.length)];
        const simulatedBounce = aiBounce || parseFloat((0.4 + Math.random() * 0.7).toFixed(2));
        const wideProb = extraType === 'WIDE' ? Math.floor(88 + Math.random() * 10) : Math.floor(Math.random() * 12);
        const noBallProb = extraType === 'NO_BALL' ? Math.floor(92 + Math.random() * 6) : Math.floor(Math.random() * 5);

        const ballEventId = `ball-${Date.now()}`;
        const displayOverStr = `${currentFullOvers}.${nextBallsInOver}`;

        const aiAnalysis: AIAnalysis = {
          id: `ai-${Date.now()}`,
          ballEventId,
          speedKmh: simulatedSpeed,
          length: simulatedLength,
          bounceMeters: simulatedBounce,
          bounceCategory: simulatedBounce > 0.85 ? 'HIGH' : simulatedBounce < 0.5 ? 'LOW' : 'NORMAL',
          wideProbability: wideProb,
          noBallProbability: noBallProb,
          isDotBall: runs === 0 && isLegal,
          pitchX: extraType === 'WIDE' ? (Math.random() > 0.5 ? 92 : 8) : Math.floor(40 + Math.random() * 20),
          pitchY: simulatedLength === 'YORKER' ? 92 : simulatedLength === 'FULL' ? 82 : simulatedLength === 'GOOD_LENGTH' ? 68 : 50,
          batContactConfidence: isWicket && wicketType === 'BOWLED' ? 15 : runs > 0 ? 98 : 75,
          trackingConfidence: 94 + Math.floor(Math.random() * 5),
          releasePoint: { x: 50, y: 10, height: 2.1 },
          status: 'VERIFIED',
        };

        // Construct Commentary Text
        let autoCommentary = customCommentary;
        if (!autoCommentary) {
          const strikerPlayer = prev.teamA.players.concat(prev.teamB.players).find((p) => p.id === strikerId);
          const strikerName = strikerPlayer?.shortName || 'Batter';

          if (isWicket) {
            autoCommentary = `OUT! ${wicketType}!! ${strikerName} departs for ${updatedStrikerRuns} (${updatedStrikerBalls}b). Massive blow for the batting side!`;
          } else if (extraType === 'WIDE') {
            autoCommentary = `WIDE BALL! Slipped down the leg side, umpire signals wide. 1 extra run added.`;
          } else if (extraType === 'NO_BALL') {
            autoCommentary = `NO BALL! Overstepping the crease! Free hit coming up next delivery.`;
          } else if (runs === 6) {
            autoCommentary = `SIX! MASSIVE HIT! ${strikerName} launches this delivery deep into the grandstand! Extraordinary power!`;
          } else if (runs === 4) {
            autoCommentary = `FOUR! Beautiful timing! Pierces the infield and races away across the lightning-fast outfield!`;
          } else if (runs === 0) {
            autoCommentary = `Dot ball. Bowled at ${simulatedSpeed} km/h, well defended into the pitch. No run.`;
          } else {
            autoCommentary = `${runs} run${runs > 1 ? 's' : ''}. Pushed into the gap, active running between the wickets.`;
          }
        }

        const newBallEvent: BallEvent = {
          id: ballEventId,
          matchId: prev.id,
          innings: prev.currentInnings,
          over: currentFullOvers,
          ball: nextBallsInOver,
          displayOver: displayOverStr,
          batterId: strikerId,
          bowlerId,
          nonStrikerId,
          runs,
          extraRuns,
          extraType,
          isLegalDelivery: isLegal,
          isWicket,
          wicketType: isWicket ? wicketType : undefined,
          dismissedPlayerId: isWicket ? effectiveDismissedId : undefined,
          fielderId,
          timestamp: Date.now(),
          commentary: autoCommentary,
          aiAnalysis,
        };

        // Add to commentary stream
        const summaryTag = isWicket ? 'WICKET' : runs === 6 ? 'SIX' : runs === 4 ? 'FOUR' : extraType === 'WIDE' ? 'WIDE' : extraType === 'NO_BALL' ? 'NO BALL' : runs === 0 ? 'DOT' : `${runs} RUNS`;
        setCommentary((prevComm) => [
          {
            id: `comm-${Date.now()}`,
            overStr: displayOverStr,
            ballEventId,
            runs: totalBallRuns,
            eventSummary: summaryTag,
            text: autoCommentary,
            timestamp: Date.now(),
            isHighlighted: runs >= 4 || isWicket,
          },
          ...prevComm.slice(0, 49),
        ]);

        // Celebration & Voice triggers
        if (runs === 6) triggerCelebration('SIX');
        else if (runs === 4) triggerCelebration('FOUR');
        else if (isWicket) triggerCelebration('WICKET');
        else if (extraType === 'WIDE') audioAnnouncer.announce('Wide ball. 1 extra run.');
        else if (extraType === 'NO_BALL') audioAnnouncer.announce('No ball! Free hit next.');
        else if (runs === 0 && extraType === 'NONE') audioAnnouncer.announce('Dot ball.');
        else if (runs === 1) audioAnnouncer.announce('Single. 1 run.');
        else if (runs > 1) audioAnnouncer.announce(`${runs} runs.`);

        // Over / Strike rotation logic
        let nextStriker = strikerId;
        let nextNonStriker = nonStrikerId;

        // If odd runs scored on a legal ball or bye, swap strike
        if ((runs % 2 === 1 || extraRuns % 2 === 1) && !isOverComplete) {
          nextStriker = nonStrikerId;
          nextNonStriker = strikerId;
        }

        // If over completes, strike swaps to other end
        if (isOverComplete) {
          if (runs % 2 === 0 && extraRuns % 2 === 0) {
            nextStriker = nonStrikerId;
            nextNonStriker = strikerId;
          }
          audioAnnouncer.announce(`End of over ${nextFullOvers}. Score ${newTotalRuns} for ${newWickets}.`);
        }

        // If batter is out, pick next batter
        let newLastWicket = prev.lastWicket;
        if (isWicket) {
          const dismissedBatter = prev.teamA.players.concat(prev.teamB.players).find((p) => p.id === effectiveDismissedId);
          newLastWicket = {
            playerName: dismissedBatter?.name || 'Batter',
            runs: updatedStrikerRuns,
            balls: updatedStrikerBalls,
            scoreAtFall: `${newTotalRuns}/${newWickets} (${displayOverStr} ov)`,
          };

          // Find available player from batting team who hasn't batted
          const battingTeam = prev.battingTeamId === prev.teamA.id ? prev.teamA : prev.teamB;
          const nextBatter = battingTeam.players.find((p) => !prev.battingStats[p.id] || (!prev.battingStats[p.id].isOut && p.id !== nextNonStriker && p.id !== effectiveDismissedId));

          if (nextBatter) {
            nextStriker = nextBatter.id;
          }
        }

        // Current over balls list (reset if new over starts)
        const updatedOverBalls = isOverComplete ? [newBallEvent] : [...prev.currentOverBalls, newBallEvent];

        return {
          ...prev,
          activeStrikerId: nextStriker,
          activeNonStrikerId: nextNonStriker,
          currentOverBalls: updatedOverBalls,
          lastWicket: newLastWicket,
          currentPartnership: {
            runs: isWicket ? 0 : prev.currentPartnership.runs + totalBallRuns,
            balls: isWicket ? 0 : prev.currentPartnership.balls + (isLegal ? 1 : 0),
            player1Id: nextStriker,
            player2Id: nextNonStriker,
          },
          [currentInningsKey]: {
            ...currentInnings,
            totalRuns: newTotalRuns,
            wickets: newWickets,
            overs: newOversFloat,
            ballsTotal: totalBallsBowled,
            currentRunRate: newCRR,
            extras: {
              ...currentInnings.extras,
              wides: currentInnings.extras.wides + (extraType === 'WIDE' ? 1 + extraRuns : 0),
              noBalls: currentInnings.extras.noBalls + (extraType === 'NO_BALL' ? 1 + extraRuns : 0),
              byes: currentInnings.extras.byes + (extraType === 'BYE' ? runs : 0),
              legByes: currentInnings.extras.legByes + (extraType === 'LEG_BYE' ? runs : 0),
              penalties: currentInnings.extras.penalties + (extraType === 'PENALTY' ? 5 : 0),
              total: currentInnings.extras.total + totalBallRuns - (extraType === 'NONE' ? runs : 0),
            },
          },
          battingStats: {
            ...prev.battingStats,
            [strikerId]: {
              ...strikerStats,
              runs: updatedStrikerRuns,
              balls: updatedStrikerBalls,
              fours: updatedFours,
              sixes: updatedSixes,
              strikeRate: updatedSR,
              isOut: isStrikerOut,
              dismissal: isStrikerOut ? `${wicketType} b ${bowlerStats.playerId}` : undefined,
              isOnStrike: nextStriker === strikerId,
            },
          },
          bowlingStats: {
            ...prev.bowlingStats,
            [bowlerId]: {
              ...bowlerStats,
              overs: updatedBowlerOvers,
              runsConceded: bowlerRunsConceded,
              wickets: updatedBowlerWickets,
              economy: updatedEconomy,
              dots: updatedDots,
              wides: bowlerStats.wides + (extraType === 'WIDE' ? 1 : 0),
              noBalls: bowlerStats.noBalls + (extraType === 'NO_BALL' ? 1 : 0),
            },
          },
        };
      });
    },
    [triggerCelebration]
  );

  // 7. Undo Last Ball
  const undoLastBall = useCallback(() => {
    setMatch((prev) => {
      if (prev.currentOverBalls.length === 0) return prev;
      const lastBall = prev.currentOverBalls[prev.currentOverBalls.length - 1];
      const newOverBalls = prev.currentOverBalls.slice(0, -1);

      const currentInningsKey = prev.currentInnings === 1 ? 'innings1' : 'innings2';
      const currentInnings = prev[currentInningsKey] || prev.innings1;

      // Rollback score
      const totalBallRuns = lastBall.runs + lastBall.extraRuns + (lastBall.extraType === 'WIDE' || lastBall.extraType === 'NO_BALL' ? 1 : 0);
      const rolledBackRuns = Math.max(0, currentInnings.totalRuns - totalBallRuns);
      const rolledBackWickets = Math.max(0, currentInnings.wickets - (lastBall.isWicket ? 1 : 0));

      audioAnnouncer.announce('Last ball undone.');

      return {
        ...prev,
        currentOverBalls: newOverBalls,
        [currentInningsKey]: {
          ...currentInnings,
          totalRuns: rolledBackRuns,
          wickets: rolledBackWickets,
        },
      };
    });
  }, []);

  // 8. Umpire Review DRS System
  const startUmpireReview = useCallback(
    ({
      reviewType,
      requestedBy,
      notes,
    }: {
      reviewType: ReviewState['reviewType'];
      requestedBy: ReviewState['requestedBy'];
      notes?: string;
    }) => {
      audioAnnouncer.playReviewSiren();
      audioAnnouncer.announce(`Umpire review initiated for ${reviewType.replace('_', ' ')}.`);

      const confidence = Math.floor(82 + Math.random() * 16);
      let predResult = 'Fair delivery within tramlines';
      if (reviewType === 'WIDE_CHECK') {
        predResult = confidence > 88 ? 'WIDE - Exceeds wide return crease guideline' : 'LEGAL - Inside permissible line';
      } else if (reviewType === 'LBW_HAWKEYE') {
        predResult = 'Pitching In-Line · Impact In-Line · Wickets: Hitting Middle Stump';
      } else if (reviewType === 'CATCH_ULTRAEDGE') {
        predResult = 'Ultra-Edge sound spike detected (84.2dB) at bat frame';
      }

      setReviewState({
        isActive: true,
        reviewType,
        requestedBy,
        aiPrediction: {
          result: predResult,
          confidence,
          notes: notes || 'High frame-rate 120 FPS camera optical flow analysis confirmed.',
        },
        cameraAngle: 'Camera 5 (Side / Replay)',
        status: 'IN_PROGRESS',
        initiatedAt: Date.now(),
      });
    },
    []
  );

  const resolveUmpireReview = useCallback(
    (decision: 'WIDE' | 'LEGAL' | 'OUT' | 'NOT_OUT' | 'NO_BALL') => {
      audioAnnouncer.announce(`Official decision: ${decision}. Decision upheld.`);
      setReviewState((prev) => ({
        ...prev,
        umpireDecision: decision,
        status: 'COMPLETED',
        isActive: false,
      }));
    },
    []
  );

  const cancelUmpireReview = useCallback(() => {
    setReviewState((prev) => ({
      ...prev,
      isActive: false,
      status: 'CANCELLED',
    }));
  }, []);

  // 9. Camera Controls
  const updateCameraStatus = useCallback((cameraId: string, updates: Partial<CameraFeed>) => {
    setCameras((prev) =>
      prev.map((c) => (c.id === cameraId ? { ...c, ...updates, lastPing: Date.now() } : c))
    );
  }, []);

  const reconnectCamera = useCallback((cameraId: string) => {
    updateCameraStatus(cameraId, { status: 'RECONNECTING' });
    setTimeout(() => {
      updateCameraStatus(cameraId, { status: 'CONNECTED', signalQuality: 'EXCELLENT', latencyMs: 175 });
    }, 1200);
  }, [updateCameraStatus]);

  // 10. Voice Command System
  const handleVoiceInput = useCallback(
    (rawTranscript: string) => {
      const text = rawTranscript.toLowerCase().trim();

      if (text.includes('four') || text.includes('boundary') || text.includes('4')) {
        setPendingVoiceCommand({
          command: 'Add Four Runs',
          type: 'SCORE',
          description: 'Record 4 runs for on-strike batter',
          action: () => recordBall({ runs: 4, extraType: 'NONE', isWicket: false }),
        });
      } else if (text.includes('six') || text.includes('maximum') || text.includes('6')) {
        setPendingVoiceCommand({
          command: 'Add Six Runs',
          type: 'SCORE',
          description: 'Record 6 runs for on-strike batter',
          action: () => recordBall({ runs: 6, extraType: 'NONE', isWicket: false }),
        });
      } else if (text.includes('single') || text.includes('one run') || text.includes('1 run')) {
        setPendingVoiceCommand({
          command: 'Add 1 Run',
          type: 'SCORE',
          description: 'Record 1 run and rotate strike',
          action: () => recordBall({ runs: 1, extraType: 'NONE', isWicket: false }),
        });
      } else if (text.includes('two') || text.includes('double') || text.includes('2 runs')) {
        setPendingVoiceCommand({
          command: 'Add 2 Runs',
          type: 'SCORE',
          description: 'Record 2 runs for on-strike batter',
          action: () => recordBall({ runs: 2, extraType: 'NONE', isWicket: false }),
        });
      } else if (text.includes('dot') || text.includes('zero') || text.includes('no run')) {
        setPendingVoiceCommand({
          command: 'Record Dot Ball',
          type: 'SCORE',
          description: 'Record 0 runs legal delivery',
          action: () => recordBall({ runs: 0, extraType: 'NONE', isWicket: false }),
        });
      } else if (text.includes('wide')) {
        setPendingVoiceCommand({
          command: 'Record Wide Delivery',
          type: 'EXTRA',
          description: 'Record 1 wide extra run',
          action: () => recordBall({ runs: 0, extraType: 'WIDE', isWicket: false }),
        });
      } else if (text.includes('no ball')) {
        setPendingVoiceCommand({
          command: 'Record No Ball',
          type: 'EXTRA',
          description: 'Record 1 no-ball extra and free hit',
          action: () => recordBall({ runs: 0, extraType: 'NO_BALL', isWicket: false }),
        });
      } else if (text.includes('wicket') || text.includes('out') || text.includes('bowled')) {
        setPendingVoiceCommand({
          command: 'Record Wicket (Bowled)',
          type: 'WICKET',
          description: 'Dismiss current striker and record wicket',
          action: () => recordBall({ runs: 0, extraType: 'NONE', isWicket: true, wicketType: 'BOWLED' }),
        });
      } else if (text.includes('undo')) {
        setPendingVoiceCommand({
          command: 'Undo Last Ball',
          type: 'UNDO',
          description: 'Revert the most recent ball event',
          action: () => undoLastBall(),
        });
      } else if (text.includes('camera one') || text.includes('pitch camera')) {
        setPendingVoiceCommand({
          command: 'Switch to Camera 1 (Pitch)',
          type: 'CAMERA',
          description: 'Switch active program feed to Camera 1',
          action: () => {
            setActiveCameraId('cam-1');
            setProgramCameraId('cam-1');
          },
        });
      } else if (text.includes('camera two') || text.includes('batsman camera')) {
        setPendingVoiceCommand({
          command: 'Switch to Camera 2 (Batsman)',
          type: 'CAMERA',
          description: 'Switch active program feed to Camera 2',
          action: () => {
            setActiveCameraId('cam-2');
            setProgramCameraId('cam-2');
          },
        });
      } else if (text.includes('review') || text.includes('open review') || text.includes('drs')) {
        setPendingVoiceCommand({
          command: 'Open Umpire Review',
          type: 'REVIEW',
          description: 'Trigger Hawk-Eye / UltraEdge review screen',
          action: () => startUmpireReview({ reviewType: 'WIDE_CHECK', requestedBy: 'UMPIRE' }),
        });
      }
    },
    [recordBall, undoLastBall, startUmpireReview]
  );

  const confirmVoiceCommand = useCallback(() => {
    if (pendingVoiceCommand) {
      pendingVoiceCommand.action();
      audioAnnouncer.announce(`Confirmed: ${pendingVoiceCommand.command}`);
      setPendingVoiceCommand(null);
    }
  }, [pendingVoiceCommand]);

  const cancelVoiceCommand = useCallback(() => {
    setPendingVoiceCommand(null);
  }, []);

  const switchPresetMatch = useCallback((presetId: string) => {
    if (presetId === 'match-derby-t10') {
      setMatch({
        ...INITIAL_MATCH,
        id: 'match-derby-t10',
        title: 'THAMIYANUR NIGHT DERBY — T10 CUP',
        tournament: 'Agni Floodlight Super Series',
        totalOvers: 10,
        status: 'LIVE',
        innings1: {
          teamId: 'team-titans',
          totalRuns: 107,
          wickets: 6,
          overs: 10.0,
          ballsTotal: 60,
          target: 108,
          currentRunRate: 10.7,
          extras: { wides: 3, noBalls: 1, byes: 0, legByes: 2, penalties: 0, total: 6 },
        },
        currentInnings: 2,
        innings2: {
          teamId: 'team-agni',
          totalRuns: 78,
          wickets: 2,
          overs: 6.4,
          ballsTotal: 40,
          target: 108,
          currentRunRate: 11.7,
          requiredRunRate: 9.0,
          extras: { wides: 2, noBalls: 0, byes: 1, legByes: 1, penalties: 0, total: 4 },
        },
      });
      audioAnnouncer.announce('Switched to Thamiyanur Night Derby T10 Match.');
    } else if (presetId === 'match-championship-semi') {
      setMatch({
        ...INITIAL_MATCH,
        id: 'match-championship-semi',
        title: 'TAMIL NADU RURAL TROPHY — SEMI-FINAL',
        tournament: 'State Rural Invitational 2026',
        totalOvers: 20,
        status: 'LIVE',
        currentInnings: 1,
        innings1: {
          teamId: 'team-titans',
          totalRuns: 0,
          wickets: 0,
          overs: 0.0,
          ballsTotal: 0,
          currentRunRate: 0.0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
        },
        currentOverBalls: [],
        currentPartnership: { runs: 0, balls: 0, player1Id: 'p-titans-1', player2Id: 'p-titans-4' },
        lastWicket: undefined,
      });
      setCommentary([
        {
          id: `comm-new-${Date.now()}`,
          overStr: '0.0',
          ballEventId: 'ball-0',
          runs: 0,
          eventSummary: 'MATCH START',
          text: 'Play underway in the Semi-Final! Both openers taking their crease.',
          timestamp: Date.now(),
        },
      ]);
      audioAnnouncer.announce('New match starting! Fresh innings underway.');
    } else {
      setMatch(INITIAL_MATCH);
      audioAnnouncer.announce('Switched to Grand Final live match.');
    }
  }, []);

  const startNewMatchCustom = useCallback(
    ({
      title,
      tournament,
      venue,
      totalOvers,
      teamAName,
      teamBName,
      tossWinner,
      tossDecision,
    }: {
      title: string;
      tournament: string;
      venue: string;
      totalOvers: number;
      teamAName: string;
      teamBName: string;
      tossWinner: 'TEAM_A' | 'TEAM_B';
      tossDecision: 'BAT' | 'BOWL';
    }) => {
      const isTeamABatting =
        (tossWinner === 'TEAM_A' && tossDecision === 'BAT') ||
        (tossWinner === 'TEAM_B' && tossDecision === 'BOWL');

      const customTeamA = {
        ...INITIAL_MATCH.teamA,
        name: teamAName,
        shortName: teamAName.slice(0, 5).toUpperCase(),
      };
      const customTeamB = {
        ...INITIAL_MATCH.teamB,
        name: teamBName,
        shortName: teamBName.slice(0, 5).toUpperCase(),
      };

      const newMatch: Match = {
        ...INITIAL_MATCH,
        id: `match-${Date.now()}`,
        title,
        tournament,
        venue,
        totalOvers,
        status: 'LIVE',
        teamA: customTeamA,
        teamB: customTeamB,
        battingTeamId: isTeamABatting ? customTeamA.id : customTeamB.id,
        bowlingTeamId: isTeamABatting ? customTeamB.id : customTeamA.id,
        activeStrikerId: isTeamABatting ? customTeamA.players[0].id : customTeamB.players[0].id,
        activeNonStrikerId: isTeamABatting ? customTeamA.players[1].id : customTeamB.players[1].id,
        activeBowlerId: isTeamABatting ? customTeamB.players[1].id : customTeamA.players[1].id,
        currentInnings: 1,
        innings1: {
          teamId: isTeamABatting ? customTeamA.id : customTeamB.id,
          totalRuns: 0,
          wickets: 0,
          overs: 0.0,
          ballsTotal: 0,
          currentRunRate: 0.0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
        },
        innings2: undefined,
        currentOverBalls: [],
        currentPartnership: {
          runs: 0,
          balls: 0,
          player1Id: isTeamABatting ? customTeamA.players[0].id : customTeamB.players[0].id,
          player2Id: isTeamABatting ? customTeamA.players[1].id : customTeamB.players[1].id,
        },
        lastWicket: undefined,
      };

      setMatch(newMatch);
      setCommentary([
        {
          id: `comm-start-${Date.now()}`,
          overStr: '0.0',
          ballEventId: 'start',
          runs: 0,
          eventSummary: 'MATCH INAUGURATED',
          text: `Welcome to ${title}! ${
            tossWinner === 'TEAM_A' ? teamAName : teamBName
          } won the toss and elected to ${tossDecision.toLowerCase()} first.`,
          timestamp: Date.now(),
          isHighlighted: true,
        },
      ]);
      audioAnnouncer.announce(`New match started: ${teamAName} versus ${teamBName}.`);
    },
    []
  );

  const updateMatchMeta = useCallback((updates: Partial<Match>) => {
    setMatch((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetMatchToDefault = useCallback(() => {
    setMatch(INITIAL_MATCH);
    setCameras(INITIAL_CAMERAS);
    localStorage.removeItem(STORAGE_KEY_MATCH);
    localStorage.removeItem(STORAGE_KEY_CAMERAS);
    audioAnnouncer.announce('Match reset to official default state.');
  }, []);

  // Clear score for next match (fresh 0/0 and 0.0 overs)
  const clearScoresForNextMatch = useCallback((nextMatchTitle?: string) => {
    setMatch((prev) => {
      const teamAPlayer1 = prev.teamA.players[0]?.id || 'p-agni-1';
      const teamAPlayer2 = prev.teamA.players[1]?.id || 'p-agni-2';
      const teamBPlayer1 = prev.teamB.players[0]?.id || 'p-titans-2';

      return {
        ...prev,
        id: `match-${Date.now()}`,
        title: nextMatchTitle || `THAMIYANUR AGNI SUPER 6 — MATCH #${Math.floor(Math.random() * 50 + 2)}`,
        status: 'LIVE',
        currentInnings: 1,
        activeStrikerId: teamAPlayer1,
        activeNonStrikerId: teamAPlayer2,
        activeBowlerId: teamBPlayer1,
        innings1: {
          teamId: prev.battingTeamId,
          totalRuns: 0,
          wickets: 0,
          overs: 0.0,
          ballsTotal: 0,
          currentRunRate: 0.0,
          extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0, penalties: 0, total: 0 },
        },
        innings2: undefined,
        currentOverBalls: [],
        currentPartnership: {
          runs: 0,
          balls: 0,
          player1Id: teamAPlayer1,
          player2Id: teamAPlayer2,
        },
        lastWicket: undefined,
        battingStats: {},
        bowlingStats: {},
      };
    });

    setCommentary([
      {
        id: `comm-fresh-${Date.now()}`,
        overStr: '0.0',
        ballEventId: 'ball-0',
        runs: 0,
        eventSummary: 'NEXT MATCH INAUGURATED',
        text: 'Scores cleared for the next match! Scoreboard reset to 0/0. Ready for ball 0.1.',
        timestamp: Date.now(),
        isHighlighted: true,
      },
    ]);

    audioAnnouncer.announce('Scores cleared. Fresh match ready with zero runs on the board.');
  }, []);

  // Update single player profile details
  const updatePlayerDetails = useCallback((teamId: string, playerId: string, updates: Partial<Player>) => {
    setMatch((prev) => {
      const updateTeam = (team: Team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          players: team.players.map((p) => (p.id === playerId ? { ...p, ...updates } : p)),
        };
      };

      return {
        ...prev,
        teamA: updateTeam(prev.teamA),
        teamB: updateTeam(prev.teamB),
      };
    });
    audioAnnouncer.announce('Player profile details updated.');
  }, []);

  // Update match-specific batting or bowling figures for a player
  const updatePlayerMatchStats = useCallback(
    (playerId: string, battingUpdates?: Partial<BatterMatchStats>, bowlingUpdates?: Partial<BowlerMatchStats>) => {
      setMatch((prev) => ({
        ...prev,
        battingStats: battingUpdates
          ? {
              ...prev.battingStats,
              [playerId]: {
                ...(prev.battingStats[playerId] || {
                  playerId,
                  runs: 0,
                  balls: 0,
                  fours: 0,
                  sixes: 0,
                  strikeRate: 0,
                  isOut: false,
                  isOnStrike: false,
                }),
                ...battingUpdates,
              },
            }
          : prev.battingStats,
        bowlingStats: bowlingUpdates
          ? {
              ...prev.bowlingStats,
              [playerId]: {
                ...(prev.bowlingStats[playerId] || {
                  playerId,
                  overs: 0,
                  maidens: 0,
                  runsConceded: 0,
                  wickets: 0,
                  economy: 0,
                  dots: 0,
                  wides: 0,
                  noBalls: 0,
                }),
                ...bowlingUpdates,
              },
            }
          : prev.bowlingStats,
      }));
      audioAnnouncer.announce('Player match figures updated.');
    },
    []
  );

  // Add a new player to team
  const addNewPlayerToTeam = useCallback((teamId: string, newPlayer: Player) => {
    setMatch((prev) => {
      const updateTeam = (team: Team) => {
        if (team.id !== teamId) return team;
        return {
          ...team,
          players: [...team.players, newPlayer],
        };
      };

      return {
        ...prev,
        teamA: updateTeam(prev.teamA),
        teamB: updateTeam(prev.teamB),
      };
    });
    audioAnnouncer.announce(`Added ${newPlayer.name} to team roster.`);
  }, []);

  const value = useMemo(
    () => ({
      match,
      cameras,
      activeCameraId,
      setActiveCameraId,
      programCameraId,
      setProgramCameraId,
      reviewState,
      systemHealth,
      commentary,
      viewMode,
      setViewMode,
      broadcasterCameraId,
      setBroadcasterCameraId,
      isNewMatchModalOpen,
      setIsNewMatchModalOpen,
      switchPresetMatch,
      startNewMatchCustom,
      isAudioMuted,
      setIsAudioMuted,
      isVoiceEnabled,
      setIsVoiceEnabled,
      pendingVoiceCommand,
      confirmVoiceCommand,
      cancelVoiceCommand,
      handleVoiceInput,
      recordBall,
      undoLastBall,
      startUmpireReview,
      resolveUmpireReview,
      cancelUmpireReview,
      updateCameraStatus,
      reconnectCamera,
      updateMatchMeta,
      resetMatchToDefault,
      clearScoresForNextMatch,
      updatePlayerDetails,
      updatePlayerMatchStats,
      addNewPlayerToTeam,
      switchStrike,
      setActiveBowler,
    }),
    [
      match,
      cameras,
      activeCameraId,
      programCameraId,
      reviewState,
      systemHealth,
      commentary,
      viewMode,
      broadcasterCameraId,
      isNewMatchModalOpen,
      switchPresetMatch,
      startNewMatchCustom,
      isAudioMuted,
      isVoiceEnabled,
      pendingVoiceCommand,
      confirmVoiceCommand,
      cancelVoiceCommand,
      handleVoiceInput,
      recordBall,
      undoLastBall,
      startUmpireReview,
      resolveUmpireReview,
      cancelUmpireReview,
      updateCameraStatus,
      reconnectCamera,
      updateMatchMeta,
      resetMatchToDefault,
      clearScoresForNextMatch,
      updatePlayerDetails,
      updatePlayerMatchStats,
      addNewPlayerToTeam,
      switchStrike,
      setActiveBowler,
    ]
  );

  return <CricketContext.Provider value={value}>{children}</CricketContext.Provider>;
};

export const useCricket = () => {
  const context = useContext(CricketContext);
  if (!context) {
    throw new Error('useCricket must be used within a CricketProvider');
  }
  return context;
};
