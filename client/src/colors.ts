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

export const bgColors: Record<TileColor, string> = {
  BLACK: "bg-gray-800",
  BLUE: "bg-blue-600",
  CYAN: "bg-cyan-500",
  RED: "bg-red-600",
  YELLOW: "bg-amber-400",
  FIRST: "bg-stone-200",
};

export const underColors: Record<TileColor, string> = {
  BLACK: "bg-gray-900",
  BLUE: "bg-blue-700",
  CYAN: "bg-cyan-600",
  RED: "bg-red-700",
  YELLOW: "bg-amber-500",
  FIRST: "bg-stone-300",
};

export const backgroundColors: Record<TileColor, string> = {
  BLACK: "bg-black",
  BLUE: "bg-blue-800",
  CYAN: "bg-cyan-700",
  RED: "bg-red-800",
  YELLOW: "bg-amber-600",
  FIRST: "bg-stone-400",
};
