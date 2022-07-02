import lodash from "lodash";
const { shuffle } = lodash;
import {
  createPlayerBoard,
  GameState,
  MiddleBoard,
  TileColor,
  UpToFourColors,
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

  const state = {
    currentPlayer: 0,
    playerBoards,
    middleBoard,
    bag,
    discards,
  };

  refillPlates(state);

  return state;
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
      FIRST: 1,
    },
  };
}

function shuffleDiscardsBack(state: GameState): void {
  state.bag = shuffle(state.discards);
}

function refillPlates(state: GameState): void {
  state.bag = shuffle(state.bag);
  state.middleBoard.plates = state.middleBoard.plates.map(() => {
    let plate = state.bag.splice(0, 4);
    if (plate.length !== 4 && state.discards.length > 0) {
      console.log("shuffling in discards...");
      shuffleDiscardsBack(state);
      plate = [...plate, ...state.bag.splice(0, 4 - plate.length)];
    }
    return plate as UpToFourColors;
  });
}
