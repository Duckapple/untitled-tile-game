import { shuffle } from "lodash";
import {
  createMiddleBoard,
  createPlayerBoard,
  GameState,
  TileColor,
} from "./model";

export function createGameState(players: string[]): GameState {
  const playerBoards = players.map(createPlayerBoard);
  const middleBoard = createMiddleBoard(players.length);
  const bag = shuffle([
    ...Array(20).fill(TileColor.BLACK),
    ...Array(20).fill(TileColor.BLUE),
    ...Array(20).fill(TileColor.RED),
    ...Array(20).fill(TileColor.YELLOW),
    ...Array(20).fill(TileColor.CYAN),
  ]);
  const discards = Array(0);

  return {
    currentPlayer: 0,
    playerBoards,
    middleBoard,
    bag,
    discards,
  };
}
