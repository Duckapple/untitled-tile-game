import { PlayerBoard, TileColor, tablePositions, GameSettings } from ".";

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
    returned.push(element);
    board.dropped[i] = null;
    board.score += settings.pointPenalties[i];
  }

  return { board, returned };
}
