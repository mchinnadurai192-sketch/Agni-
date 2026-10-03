export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'INNINGS_BREAK' | 'REVIEW' | 'COMPLETED' | 'ABANDONED';

export type LengthCategory = 'YORKER' | 'FULL' | 'GOOD_LENGTH' | 'BACK_OF_LENGTH' | 'SHORT' | 'BOUNCER';

export type WicketType = 'BOWLED' | 'CAUGHT' | 'LBW' | 'RUN_OUT' | 'STUMPED' | 'HIT_WICKET' | 'RETIRED' | 'OTHER';

export type ExtraType = 'NONE' | 'WIDE' | 'NO_BALL' | 'BYE' | 'LEG_BYE' | 'PENALTY';

export interface Player {
  id: string;
  name: string;
  shortName: string;
  teamId: string;
  jerseyNumber: number;
  role: 'BATTER' | 'BOWLER' | 'ALL_ROUNDER' | 'WICKET_KEEPER';
  battingStyle: 'Right Hand Bat' | 'Left Hand Bat';
  bowlingStyle: 'Right Arm Fast' | 'Right Arm Medium' | 'Right Arm Off-Spin' | 'Right Arm Leg-Spin' | 'Left Arm Fast' | 'Left Arm Orthodox' | 'Left Arm Leg-Spin';
  photoUrl?: string;
  isCaptain?: boolean;
  isWicketKeeper?: boolean;
  careerMatches?: number;
  tournamentRuns?: number;
  tournamentWickets?: number;
  highestScore?: string;
  bestBowling?: string;
  strikeRateCareer?: number;
  bio?: string;
}

export interface BatterMatchStats {
  playerId: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissal?: string;
  bowlerId?: string;
  fielderId?: string;
  isOnStrike: boolean;
}

export interface BowlerMatchStats {
  playerId: string;
  overs: number; // e.g. 3.4
  maidens: number;
  runsConceded: number;
  wickets: number;
  economy: number;
  dots: number;
  wides: number;
  noBalls: number;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  color: string;
  secondaryColor: string;
  logoUrl?: string;
  players: Player[];
}

export interface AIAnalysis {
  id: string;
  ballEventId: string;
  speedKmh: number;
  length: LengthCategory;
  bounceMeters: number;
  bounceCategory: 'LOW' | 'NORMAL' | 'HIGH';
  wideProbability: number; // 0 - 100
  noBallProbability: number; // 0 - 100
  pitchX: number; // 0 (left wide) to 100 (right wide), 50 is center
  pitchY: number; // 0 (bowling crease) to 100 (batting crease)
  trajectoryPoints?: { x: number; y: number; z: number }[];
  batContactConfidence: number; // 0 - 100
  trackingConfidence: number; // 0 - 100
  isDotBall?: boolean;
  releasePoint: { x: number; y: number; height: number };
  status: 'CALCULATED' | 'VERIFIED' | 'REVIEWED';
}

export interface BallEvent {
  id: string;
  matchId: string;
  innings: 1 | 2;
  over: number; // 0-indexed over number (e.g. 16 means 17th over)
  ball: number; // 1 to 6 (or legal ball index)
  displayOver: string; // e.g. "16.4"
  batterId: string;
  bowlerId: string;
  nonStrikerId: string;
  runs: number; // batter runs
  extraRuns: number;
  extraType: ExtraType;
  isLegalDelivery: boolean;
  isWicket: boolean;
  wicketType?: WicketType;
  dismissedPlayerId?: string;
  fielderId?: string;
  timestamp: number;
  commentary: string;
  aiAnalysis?: AIAnalysis;
  videoTimestamp?: number;
  selectedCameraId?: string;
  isReviewed?: boolean;
}

export interface ReviewState {
  isActive: boolean;
  ballEventId?: string;
  reviewType: 'WIDE_CHECK' | 'NO_BALL_CHECK' | 'LBW_HAWKEYE' | 'CATCH_ULTRAEDGE' | 'RUN_OUT';
  requestedBy: 'UMPIRE' | 'AGNI_BOYS' | 'OPPONENT';
  aiPrediction: {
    result: string;
    confidence: number;
    notes: string;
  };
  cameraAngle: string;
  umpireDecision?: 'WIDE' | 'LEGAL' | 'OUT' | 'NOT_OUT' | 'NO_BALL' | 'PENDING';
  status: 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  initiatedAt: number;
}

export interface CameraFeed {
  id: string;
  number: number;
  name: string;
  purpose: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'STANDBY';
  signalQuality: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  fps: number;
  resolution: string;
  latencyMs: number;
  streamUrl?: string;
  isLocalWebcam?: boolean;
  isMobileStream?: boolean;
  mobileDeviceLabel?: string;
  facingMode?: 'environment' | 'user';
  batteryLevel?: number;
  hasActiveMediaStream?: boolean;
  streamFrameBase64?: string;
  zoomLevel?: number;
  torchOn?: boolean;
  lastPing: number;
}

export interface CommentaryItem {
  id: string;
  overStr: string;
  ballEventId: string;
  runs: number;
  eventSummary: string; // e.g. "FOUR", "WICKET", "1 RUN", "WIDE"
  text: string;
  timestamp: number;
  isHighlighted?: boolean;
}

export interface InningsScore {
  teamId: string;
  totalRuns: number;
  wickets: number;
  overs: number; // e.g. 16.3
  ballsTotal: number;
  target?: number;
  extras: {
    wides: number;
    noBalls: number;
    byes: number;
    legByes: number;
    penalties: number;
    total: number;
  };
  currentRunRate: number;
  requiredRunRate?: number;
}

export interface Match {
  id: string;
  title: string;
  tournament: string;
  venue: string;
  totalOvers: number;
  status: MatchStatus;
  teamA: Team;
  teamB: Team;
  tossWinnerId: string;
  tossDecision: 'BAT' | 'BOWL';
  currentInnings: 1 | 2;
  battingTeamId: string;
  bowlingTeamId: string;
  currentOverBalls: BallEvent[];
  activeStrikerId: string;
  activeNonStrikerId: string;
  activeBowlerId: string;
  innings1: InningsScore;
  innings2?: InningsScore;
  battingStats: Record<string, BatterMatchStats>;
  bowlingStats: Record<string, BowlerMatchStats>;
  currentPartnership: {
    runs: number;
    balls: number;
    player1Id: string;
    player2Id: string;
  };
  lastWicket?: {
    playerName: string;
    runs: number;
    balls: number;
    scoreAtFall: string;
  };
  scheduledTime: string;
}

export interface SystemHealth {
  server: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  database: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  websocket: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  aiEngine: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  mediaServer: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  activeViewers: number;
  streamLatencyMs: number;
  cpuLoadPercent: number;
  memoryUsagePercent: number;
}
