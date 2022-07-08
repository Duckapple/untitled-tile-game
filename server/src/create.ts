import lodash from "lodash";
import log from "./log";
const { shuffle } = lodash;
import {
  GameSettings,
  GameState,
  MiddleBoard,
  PlayerBoard,
  TileColor,
  Tuple,
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
      CYAN: 0,
      YELLOW: 0,
      BLUE: 0,
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
      log("shuffling in discards...");
      shuffleDiscardsBack(state);
      plate = [...plate, ...state.bag.splice(0, 4 - plate.length)];
    }
    return plate as UpToFourColors;
  });
}

export function createPlayerBoard(playerName: string): PlayerBoard {
  const rows = Array<(TileColor | undefined)[]>(5)
    .fill([])
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

export function createGameSettings(): GameSettings {
  return {
    pointRewards: {
      column: 7,
      row: 5,
      color: 10,
    },
    pointPenalties: [-1, -1, -2, -2, -2, -3, -3],
  };
}
