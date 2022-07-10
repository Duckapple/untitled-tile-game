import lodash from "lodash";
import log from "./log";
const { shuffle, unzip } = lodash;
import {
  GameSettings,
  GameState,
  MiddleBoard,
  PlayerBoard,
  tablePositions,
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

export function calculateAndUpdateBoard(
  oldBoard: PlayerBoard,
  settings: GameSettings
): {
  board: PlayerBoard;
  returned: TileColor[];
} {
  const board: PlayerBoard = {
    ...oldBoard,
    table: oldBoard.table.map((r) => [...r]),
    rows: oldBoard.rows.map((r) => [...r]),
    dropped: [...oldBoard.dropped],
  };
  const returned: TileColor[] = [];

  for (let i = 0; i < board.rows.length; i++) {
    const row = board.rows[i];
    if (row.includes(undefined) || row.includes(null)) continue; // skip if row is incomplete
    const color = row[0] as TileColor; // guaranteed to be defined above
    const col = tablePositions[i].indexOf(color);

    let r = 1;
    let neg = false,
      pos = false;
    for (let j = 1; j < 5; j++) {
      if (board.table[i][col + j] == null) pos = true;
      else if (!pos) r += 1;
      if (board.table[i][col - j] == null) neg = true;
      else if (!neg) r += 1;
    }
    let c = 1;
    (neg = false), (pos = false);
    for (let j = 1; j < 5; j++) {
      if (board.table[i + j]?.[col] == null) pos = true;
      else if (!pos) c += 1;
      if (board.table[i - j]?.[col] == null) neg = true;
      else if (!neg) c += 1;
    }

    board.score += r === 1 ? (c === 1 ? 1 : c) : c === 1 ? r : r + c;

    board.rows[i] = row.map(() => null);
    board.table[i][col] = color;
    returned.push(...new Array(row.length - 1).fill(color));
  }

  for (let i = 0; i < board.dropped.length; i++) {
    const element = board.dropped[i];
    if (element == null) continue;
    if (element !== TileColor.FIRST) returned.push(element);
    board.dropped[i] = null;
    board.score += settings.pointPenalties[i];
  }

  return { board, returned };
}

export function endRound(
  oldState: GameState,
  settings: GameSettings
): GameState {
  const firstGoer = oldState.playerBoards.findIndex(({ dropped }) =>
    dropped.some((c) => c === TileColor.FIRST)
  );
  const playerBoardUpdates = oldState.playerBoards.map((board) =>
    calculateAndUpdateBoard(board, settings)
  );
  const newPlayerBoards = playerBoardUpdates.map(({ board }) => board);
  const discards = [
    ...oldState.discards,
    ...playerBoardUpdates.flatMap(({ returned }) => returned),
  ];

  const state: GameState = {
    ...oldState,
    discards,
    currentPlayer: firstGoer,
    playerBoards: newPlayerBoards,
  };

  state.middleBoard.common.FIRST = 1;

  refillPlates(state);

  return state;
}

export function isEndOfRound(state: GameState): boolean {
  if (state.middleBoard.plates.some((plate) => plate.length > 0)) return false;

  const middleCount = Object.keys(TileColor).reduce(
    (prev, key) => prev + (state.middleBoard.common[key as TileColor] ?? 0),
    0
  );
  if (middleCount > 0) return false;

  return true;
}

function calculateEnd(board: PlayerBoard, settings: GameSettings): PlayerBoard {
  const allTiles = board.table.flat();
  let score = 0;
  [
    TileColor.BLACK,
    TileColor.BLUE,
    TileColor.RED,
    TileColor.YELLOW,
    TileColor.CYAN,
  ].forEach((c) => {
    if (allTiles.filter((color) => color === c).length === 5) {
      score += settings.pointRewards.color;
    }
  });
  board.table.forEach((row) => {
    if (!row.some((c) => c == null)) {
      score += settings.pointRewards.row;
    }
  });
  unzip(board.table).forEach((col) => {
    if (!col.some((c) => c == null)) {
      score += settings.pointRewards.column;
    }
  });
  return {
    ...board,
    score: board.score + score,
  };
}

export function endGame(
  oldState: GameState,
  settings: GameSettings
): { state: GameState; standings: string[] } {
  const state: GameState = {
    ...oldState,
    currentPlayer: -1,
    playerBoards: oldState.playerBoards.map((board) =>
      calculateEnd(board, settings)
    ),
  };

  const boards = state.playerBoards.slice();
  boards.sort((a, b) => b.score - a.score);
  const standings = boards.map(({ playerName }) => playerName);

  return { state, standings };
}

export function isEndOfGame(state: GameState): boolean {
  return state.playerBoards.some((board) =>
    board.table.some((row) => row.every((c) => c != null))
  );
}
