import express from "express";
import expressWs from "express-ws";
import { Message, MessageType } from "./model/communication";
const { app } = expressWs(express());

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    const m = JSON.parse(msg as unknown as string) as Message;
    if (m.type === MessageType.GET_STATE) {
      //
    }
    console.log(m);
    ws.send("Hi back!");
  });
});

app.listen(8080, () => console.log("We getting going"));
