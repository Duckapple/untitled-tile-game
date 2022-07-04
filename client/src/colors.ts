import { TileColor } from "./model";

export const bgColors: Record<TileColor, string> = {
  BLACK: "bg-gray-800",
  BLUE: "bg-blue-700",
  CYAN: "bg-cyan-500",
  RED: "bg-red-600",
  YELLOW: "bg-amber-400",
  FIRST: "bg-stone-200",
};

export const underColors: Record<TileColor, string> = {
  BLACK: "bg-gray-900",
  BLUE: "bg-blue-800",
  CYAN: "bg-cyan-600",
  RED: "bg-red-700",
  YELLOW: "bg-amber-500",
  FIRST: "bg-stone-300",
};

export const backgroundColors: Record<TileColor, string> = {
  BLACK: "bg-black",
  BLUE: "bg-blue-900",
  CYAN: "bg-cyan-700",
  RED: "bg-red-800",
  YELLOW: "bg-amber-600",
  FIRST: "bg-stone-400",
};

export const colorShorthands: Record<TileColor, string> = {
  BLACK: "B",
  BLUE: "U",
  RED: "R",
  YELLOW: "Y",
  CYAN: "C",
  FIRST: "1",
};

export const colorShorthandColors: Record<TileColor, string> = {
  BLACK: "text-stone-200",
  BLUE: "text-stone-200",
  CYAN: "text-stone-200",
  RED: "text-stone-200",
  YELLOW: "text-stone-200",
  FIRST: "text-blue-800",
};
