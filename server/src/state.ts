import { WebSocket } from "ws";
import { randomInt, randomUUID } from "crypto";
import { GameSettings, GameState } from "./model";

export type Player = {
  socket: WebSocket;
  name: string;
  UUID: string;
};

type Room = {
  players: Player[];
  creator: Player;
  createdAt: Date;
  updatedAt: Date;
  state?: GameState;
  settings: GameSettings;
};

type Rooms = Record<string, Room>;

const UUIDs = new Set<string>();

export const rooms: Rooms = {};

export function createRoomID(): string {
  return randomInt(100000, 999999).toString();
}

export function createUUID(): string {
  let uuid: string;
  do uuid = randomUUID();
  while (UUIDs.has(uuid));
  UUIDs.add(uuid);
  return uuid;
}
