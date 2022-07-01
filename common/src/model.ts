export interface GameState {}

export enum TileColor {
  BLUE = "BLUE",
  CYAN = "CYAN",
  YELLOW = "YELLOW",
  RED = "RED",
  BLACK = "BLACK",
  FIRST = "FIRST",
}

export type UpToFourColors =
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
  plate: (TileColor | undefined)[][];
  dropped: Tuple<TileColor | undefined, 7>;
  playerName: string;
}
