import { RoomDetails, TileColor } from ".";
export type Message =
  | CreateRoomMessage
  | JoinRoomMessage
  | RearrangePlayersMessage
  | BeginMessage
  | MakeMoveMessage;

export enum MessageType {
  CREATE_ROOM = "CREATE_ROOM",
  JOIN_ROOM = "JOIN_ROOM",
  REARRANGE_PLAYERS = "REARRANGE_PLAYERS",
  UPDATE_ROOM = "UPDATE_ROOM",
  BEGIN = "BEGIN",
  ERROR = "ERROR",
  ASSIGN_UUID = "ASSIGN_UUID",
  MAKE_MOVE = "MAKE_MOVE",
}

type UUID = string;
export type CreateRoomMessage = {
  type: MessageType.CREATE_ROOM;
  userID: UUID;
  userName: string;
  roomID?: string;
};
export type JoinRoomMessage = {
  type: MessageType.JOIN_ROOM;
  userID: UUID;
  userName: string;
  roomID: string;
};
export type RearrangePlayersMessage = {
  type: MessageType.REARRANGE_PLAYERS;
  userID: UUID;
  roomID: string;
  players: string[];
};
export type BeginMessage = {
  type: MessageType.BEGIN;
  roomID: string;
  userID: UUID;
};
export type MakeMoveMessage = {
  type: MessageType.MAKE_MOVE;
  roomID: string;
  userID: UUID;
  plate?: { index: number; color: TileColor };
  middle?: TileColor;
  row: number;
};

export type MessageResponse =
  | CreateRoomResponse
  | JoinRoomResponse
  | UpdateRoomResponse
  | AssignUUIDResponse
  | ErrorResponse;

export type CreateRoomResponse = RoomDetails & {
  type: MessageType.CREATE_ROOM;
};
export type JoinRoomResponse = RoomDetails & {
  type: MessageType.JOIN_ROOM;
};
export type UpdateRoomResponse = Partial<Omit<RoomDetails, "roomID">> & {
  type: MessageType.UPDATE_ROOM;
};
export type AssignUUIDResponse = {
  type: MessageType.ASSIGN_UUID;
  userID: UUID;
};
export type ErrorResponse = {
  type: MessageType.ERROR;
  error: string;
};
