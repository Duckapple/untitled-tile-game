export type Message = GetStateMessage;

export enum MessageType {
  GET_STATE = "GET_STATE",
}

export type GetStateMessage = { type: MessageType.GET_STATE; payload: string };
