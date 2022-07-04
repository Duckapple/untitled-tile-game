import log from "./log";
import { ErrorResponse, MessageType } from "./model";

export function createError(error: string): string {
  const err: ErrorResponse = {
    type: MessageType.ERROR,
    error,
  };
  log(`Encountered error '${error}'`);
  return JSON.stringify(err);
}
