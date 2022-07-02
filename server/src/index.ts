import express from "express";
import expressWs from "express-ws";
import { createGameState } from "./create";
import { GetStateResponse, Message, MessageType } from "./model";
const { app } = expressWs(express());

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    const m = JSON.parse(msg as unknown as string) as Message;
    if (m.type === MessageType.GET_STATE) {
      const state = createGameState(["Duckapple", "Duckberry"]);
      const res: GetStateResponse = { type: MessageType.GET_STATE, state };
      ws.send(JSON.stringify(res));
    }
  });
});

app.listen(8080, () => console.log("⚡️[server]: Server is running"));
