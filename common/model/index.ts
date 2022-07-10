export * from "./communication";

export type RoomDetails = {
  roomID: string;
  state?: GameState;
  players: string[];
  creator: string;
  settings: GameSettings;
};

export interface GameSettings {
  pointRewards: {
    column: number;
    row: number;
    color: number;
  };
  pointPenalties: Tuple<number, 7>;
}

export interface GameState {
  currentPlayer: number;
  playerBoards: PlayerBoard[];
  middleBoard: MiddleBoard;
  bag: TileColor[];
  discards: TileColor[];
}

export enum TileColor {
  BLUE = "BLUE",
  CYAN = "CYAN",
  YELLOW = "YELLOW",
  RED = "RED",
  BLACK = "BLACK",
  FIRST = "FIRST",
}

export type UpToFourColors =
  | []
  | Tuple<TileColor, 1>
  | Tuple<TileColor, 2>
  | Tuple<TileColor, 3>
  | Tuple<TileColor, 4>;

export type Tuple<T, N extends number> = number extends N
  ? T[]
  : _TupleOf<T, N, []>;
type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;

export interface PlayerBoard {
  rows: (TileColor | undefined | null)[][];
  table: (TileColor | undefined | null)[][];
  dropped: Tuple<TileColor | undefined | null, 7>;
  playerName: string;
  score: number;
}

export interface MiddleBoard {
  plates: UpToFourColors[];
  common: Record<TileColor, number>;
}

// prettier-ignore
export const tablePositions: Tuple<Tuple<TileColor, 5>, 5> = [
  [TileColor.BLUE, TileColor.YELLOW, TileColor.RED, TileColor.BLACK, TileColor.CYAN],
  [TileColor.CYAN, TileColor.BLUE, TileColor.YELLOW, TileColor.RED, TileColor.BLACK],
  [TileColor.BLACK, TileColor.CYAN, TileColor.BLUE, TileColor.YELLOW, TileColor.RED],
  [TileColor.RED, TileColor.BLACK, TileColor.CYAN, TileColor.BLUE, TileColor.YELLOW],
  [TileColor.YELLOW, TileColor.RED, TileColor.BLACK, TileColor.CYAN, TileColor.BLUE],
];
