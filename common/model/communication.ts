import { GameState } from ".";
export type Message = GetStateMessage;

export enum MessageType {
  GET_STATE = "GET_STATE",
}

export type GetStateMessage = { type: MessageType.GET_STATE };

export type MessageResponse = GetStateResponse;

export type GetStateResponse = {
  type: MessageType.GET_STATE;
  state: GameState;
};
