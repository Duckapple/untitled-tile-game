import express from "express";
import expressWs from "express-ws";
const { app } = expressWs(express());

app.ws("/", (ws, req) => {
  ws.on("message", (msg) => {
    console.log(msg);
  });
});

app.listen(8080, () => console.log("We getting going"));
