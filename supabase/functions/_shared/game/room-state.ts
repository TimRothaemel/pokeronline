export const WAITING_STATUS = "waiting";

export type GamePhase =
  | "waiting"
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "showdown"
  | "finished";

export type GameActionType = "check" | "call" | "raise" | "fold";

export type RoomGameState = {
  version: 1;
  phase: GamePhase;
  dealerPlayerId: string | null;
  dealerSeat: number;
  smallBlind: number;
  bigBlind: number;
  currentBet: number;
  pot: number;
  currentPlayerId: string | null;
  actingOrder: string[];
  pendingPlayerIds: string[];
  foldedPlayerIds: string[];
  allInPlayerIds: string[];
  playerBets: Record<string, number>;
  totalContributions: Record<string, number>;
  revealedCount: number;
  winnerIds: string[];
  winningHand: string | null;
  lastAction: {
    playerId: string;
    type: GameActionType;
    amount: number;
  } | null;
  updatedAt: string;
};

export function parseRoomGameState(status: string | null | undefined): RoomGameState | null {
  if (!status || status === WAITING_STATUS) {
    return null;
  }

  try {
    return JSON.parse(status) as RoomGameState;
  } catch (error) {
    console.error("Failed to parse room game state", error);
    return null;
  }
}

export function serializeRoomGameState(state: RoomGameState) {
  return JSON.stringify(state);
}
