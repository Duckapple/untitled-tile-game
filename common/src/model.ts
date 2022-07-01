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
  rows: (TileColor | undefined)[][];
  table: (TileColor | undefined)[][];
  dropped: Tuple<TileColor | undefined, 7>;
  playerName: string;
  score: number;
}

export function createPlayerBoard(playerName: string): PlayerBoard {
  const rows = Array(5)
    .fill(null)
    .map((_, i) => Array(i + 1).fill(undefined));

  const table = Array(5)
    .fill(null)
    .map(() => Array(5).fill(undefined));

  const dropped = Array(7).fill(undefined) as Tuple<TileColor | undefined, 7>;

  return {
    playerName,
    rows,
    table,
    dropped,
    score: 0,
  };
}

export interface MiddleBoard {
  plates: UpToFourColors[];
  common: Record<TileColor, number>;
}

export function createMiddleBoard(playerCount: number): MiddleBoard {
  return {
    plates: Array<UpToFourColors>(1 + playerCount * 2).fill([]),
    common: {
      BLUE: 0,
      CYAN: 0,
      YELLOW: 0,
      RED: 0,
      BLACK: 0,
      FIRST: 0,
    },
  };
}
