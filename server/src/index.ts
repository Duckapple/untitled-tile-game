import express from "express";
import expressWs from "express-ws";
import WS from "ws";
import {
  Message,
  MessageType,
  CreateRoomResponse,
  UpdateRoomResponse,
  JoinRoomResponse,
  ErrorResponse,
  CreateRoomMessage,
  JoinRoomMessage,
  RearrangePlayersMessage,
  BeginMessage,
  AssignUUIDResponse,
  MakeMoveMessage,
  TileColor,
} from "./model";
import { createGameSettings, createGameState } from "./create";
import { rooms, Player, createRoomID, createUUID } from "./state";
import log from "./log";
const { app } = expressWs(express());

export function createError(error: string): string {
  const err: ErrorResponse = {
    type: MessageType.ERROR,
    error,
  };
  log(`Encountered error '${error}'`);
  return JSON.stringify(err);
}

function handleCreateRoom(ws: WS.WebSocket, m: CreateRoomMessage) {
  if (!m.userID || !m.userName) return ws.send(createError("No user ID"));

  let roomID: string;
  if (m.roomID && !rooms[m.roomID]) roomID = m.roomID;
  else
    do roomID = createRoomID();
    while (rooms[roomID]);

  const time = new Date();
  const player: Player = { name: m.userName, socket: ws, UUID: m.userID };
  const players: Player[] = [player];
  const settings = createGameSettings();
  rooms[roomID] = {
    creator: player,
    createdAt: time,
    updatedAt: time,
    players,
    settings,
  };
  const res: CreateRoomResponse = {
    type: MessageType.CREATE_ROOM,
    roomID,
    players: players.map(({ name }) => name),
    creator: m.userName,
    settings,
  };
  ws.send(JSON.stringify(res));
  log(`Created room ${roomID}`);
}

function handleJoinRoom(ws: WS.WebSocket, m: JoinRoomMessage) {
  if (!m.userID || !m.userName) return ws.send(createError("No user ID"));
  if (!m.roomID || !rooms[m.roomID])
    return ws.send(createError("Incorrect room ID"));

  const room = rooms[m.roomID];

  const existing = room.players.find((player) => player.name === m.userName);
  if (existing) {
    const closedStates: (0 | 1 | 2 | 3)[] = [WS.CLOSING, WS.CLOSED];
    // If connection was closed, allow hijacking
    if (closedStates.includes(existing.socket.readyState)) existing.socket = ws;
    else return ws.send(createError("User already in room"));
  } else if (room.players.length >= 4) {
    return ws.send(createError("Room full"));
  } else if (room.state) {
    return ws.send(createError("Game already in progress"));
  }

  const otherPlayers = room.players.map(({ socket }) => socket);

  // TODO: Enables hijacking, pls fix maybe
  if (!existing)
    room.players.push({ name: m.userName, socket: ws, UUID: m.userID });

  const joinRes: JoinRoomResponse = {
    type: MessageType.JOIN_ROOM,
    creator: room.creator.name,
    players: room.players.map(({ name }) => name),
    roomID: m.roomID,
    state: room.state,
    settings: room.settings,
  };
  ws.send(JSON.stringify(joinRes));
  const update: UpdateRoomResponse = {
    type: MessageType.UPDATE_ROOM,
    players: room.players.map(({ name }) => name),
    update: `User ${m.userName} joined the room`,
  };
  otherPlayers.forEach((otherPlayer) =>
    otherPlayer.send(JSON.stringify(update))
  );
  log(`Joined room ${m.roomID}`);
}
function handleRearrangePlayers(ws: WS.WebSocket, m: RearrangePlayersMessage) {
  if (!m.roomID || !rooms[m.roomID])
    return ws.send(createError("Incorrect room ID"));

  const room = rooms[m.roomID];

  if (!m.userID || room.creator.UUID !== m.userID)
    return ws.send(createError("Invalid user ID"));

  let check = true;
  const playerCheck = room.players.map(({ name }) => name);
  m.players.forEach((player) => {
    const other = playerCheck.findIndex((other) => other === player);
    if (other === -1) check = false;
    playerCheck.splice(other, 1);
  });

  if (!check || playerCheck.length > 0)
    return ws.send(createError("Invalid player list"));

  let worked = true;
  const reordered = m.players.map((name) => {
    const player = room.players.find(({ name: n }) => name === n);
    if (!player) worked = false;
    return player as Player;
  });
  if (!worked) return ws.send(createError("Could not reorder players"));

  room.players = reordered;

  const update: UpdateRoomResponse = {
    type: MessageType.UPDATE_ROOM,
    players: reordered.map(({ name }) => name),
    update: "Rearranged players",
  };
  reordered.forEach(({ socket }) => socket.send(JSON.stringify(update)));
  log(`Rearranged players in room ${m.roomID}`);
}

function handleBegin(ws: WS.WebSocket, m: BeginMessage) {
  if (!m.roomID || !rooms[m.roomID])
    return ws.send(createError("Incorrect room ID"));

  const room = rooms[m.roomID];

  if (!m.userID || room.creator.UUID !== m.userID)
    return ws.send(createError("Invalid user ID"));

  room.state = createGameState(room.players.map(({ name }) => name));
  const update: UpdateRoomResponse = {
    type: MessageType.UPDATE_ROOM,
    state: room.state,
    update: "Game started",
  };
  room.players.forEach(({ socket }) => socket.send(JSON.stringify(update)));
  log(`Began game in room ${m.roomID}`);
}

function handleMakeMove(ws: WS.WebSocket, m: MakeMoveMessage) {
  // Cleanup allows us to only mutate state once we are sure the operation can be done
  const cleanup: (() => void)[] = [];

  if (!m.roomID || !rooms[m.roomID])
    return ws.send(createError("Incorrect room ID"));

  const room = rooms[m.roomID];

  const playerIndex = room.players.findIndex(
    (player) => player.UUID === m.userID
  );

  if (playerIndex === -1) return ws.send(createError("Invalid user ID"));

  if (!room.state) return ws.send(createError("Game not in progress"));

  if (
    room.state.currentPlayer !==
    room.players.findIndex(({ UUID }) => m.userID === UUID)
  )
    return ws.send(createError("Cannot make a move when not your turn"));

  if ((m.plate && m.middle) || (!m.plate && !m.middle))
    return ws.send(
      createError(
        "Cannot pick " +
          (m.plate && m.middle ? "both" : "neither of") +
          " plate and middle"
      )
    );

  let tiles: TileColor[] = [];
  let firstToken: TileColor.FIRST | null = null;
  let moveDescription: string;
  if (m.plate != null) {
    const plate = room.state.middleBoard.plates[m.plate.index] ?? [];
    tiles = plate.filter((color) => color === m.plate!.color);
    if (tiles.length === 0)
      return ws.send(
        createError("Cannot pick color from plate which is not present")
      );
    // Move plate leftovers to middle
    cleanup.push(() =>
      plate
        .filter((color) => color !== m.plate!.color)
        .forEach((color) => {
          room.state!.middleBoard.common[color] += 1;
        })
    );
    moveDescription = `picked ${
      tiles.length
    } ${m.plate.color.toLowerCase()} tile${
      tiles.length > 1 ? "s" : ""
    } from plate ${m.plate.index + 1}.`;
    // Remove items on plate
    cleanup.push(() => (room.state!.middleBoard.plates[m.plate!.index] = []));
  } else {
    const tileCount = room.state.middleBoard.common[m.middle!];
    if (tileCount <= 0)
      return ws.send(
        createError(
          "There are no tiles in the middle of the color " +
            m.middle?.toLowerCase()
        )
      );
    if (m.middle !== TileColor.FIRST) tiles = Array(tileCount).fill(m.middle);
    if (room.state.middleBoard.common[TileColor.FIRST] > 0) {
      firstToken = TileColor.FIRST;
      // Remove go-first token
      cleanup.push(() => (room.state!.middleBoard.common[TileColor.FIRST] = 0));
    }
    const pickedFirst = firstToken
      ? ", picking the first player token as well"
      : "";
    moveDescription = `picked ${tiles.length} ${m.middle?.toLowerCase()} tile${
      tiles.length > 1 ? "s" : ""
    } from middle${pickedFirst}.`;
    // Remove chosen color from middle
    cleanup.push(() => (room.state!.middleBoard.common[m.middle!] = 0));
  }

  const playerBoard = room.state.playerBoards[playerIndex];

  const row = playerBoard.rows[m.row];

  if (
    [null, undefined, tiles[0]].includes(row[row.length - 1]) &&
    !playerBoard.table[m.row].includes(tiles[0])
  )
    for (let i = row.length - 1; i >= 0; i--) {
      if (row[i] == null) {
        row[i] = tiles.pop();
      }
    }

  for (let i = 0; i < playerBoard.dropped.length; i++) {
    if (playerBoard.dropped[i] != null) continue;
    const element = firstToken ?? tiles.pop();
    if (element === firstToken) firstToken = null;
    if (!element) break;
    playerBoard.dropped[i] = element;
  }

  cleanup.forEach((f) => f());

  room.state.currentPlayer =
    (room.state.currentPlayer + 1) % room.players.length;

  const msg: UpdateRoomResponse = {
    type: MessageType.UPDATE_ROOM,
    state: room.state,
    update: `${room.players[playerIndex].name} ${moveDescription}`,
  };

  room.players.forEach(({ socket }) => socket.send(JSON.stringify(msg)));
}

app.ws("/", (ws, req) => {
  setTimeout(() => {
    const greeting: AssignUUIDResponse = {
      type: MessageType.ASSIGN_UUID,
      userID: createUUID(),
    };
    ws.send(JSON.stringify(greeting));
    log(`New connection, gave ID ${greeting.userID}`);
  }, 200);
  ws.on("message", (msg) => {
    let m: Message;
    try {
      m = JSON.parse(msg as unknown as string) as Message;
    } catch (e) {
      log(msg);
      ws.send(createError("Invalid message"));
      return;
    }
    if (m.type === MessageType.CREATE_ROOM) {
      handleCreateRoom(ws, m);
    } else if (m.type === MessageType.JOIN_ROOM) {
      handleJoinRoom(ws, m);
    } else if (m.type === MessageType.REARRANGE_PLAYERS) {
      handleRearrangePlayers(ws, m);
    } else if (m.type === MessageType.BEGIN) {
      handleBegin(ws, m);
    } else if (m.type === MessageType.MAKE_MOVE) {
      handleMakeMove(ws, m);
    } else {
      log(`Unknown message '${msg}'`);
    }
  });
  ws.on("close", (code, reason) => {
    log("close", code, reason);
  });
});

app.listen(8080, () => log("Server is running"));
