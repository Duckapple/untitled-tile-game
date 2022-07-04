<script setup lang="ts">
import { ref } from "vue";
import {
  TileColor,
  MessageType,
  CreateRoomMessage,
  MessageResponse,
  RoomDetails,
  JoinRoomMessage,
  RearrangePlayersMessage,
  BeginMessage,
  MakeMoveMessage,
} from "./model";
import RoomPrompt from "./components/RoomPrompt.vue";
import Room from "./components/Room.vue";
import { omit } from "lodash";
import Game from "./components/Game.vue";

export type MakeMoveFunction = (args: {
  row?: number;
  middle?: TileColor;
  plate?: MakeMoveMessage["plate"];
}) => void;

const username = ref<string>();
const UUID = ref<string>();
const roomDetails = ref<RoomDetails>();

const errors = ref<string[]>([]);

const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("message", (e) => {
  console.log(e.data);
  const m = JSON.parse(e.data.toString()) as MessageResponse;
  if (m.type === MessageType.ASSIGN_UUID) {
    UUID.value = m.userID;
    console.log(UUID.value);
  } else if (m.type === MessageType.CREATE_ROOM) {
    location.hash = `#${m.roomID}`;
    roomDetails.value = omit(m, "type");
  } else if (m.type === MessageType.JOIN_ROOM) {
    location.hash = `#${m.roomID}`;
    roomDetails.value = omit(m, "type");
  } else if (m.type === MessageType.UPDATE_ROOM) {
    if (!roomDetails.value) {
      console.error("Got update for non-existing room details");
    } else {
      roomDetails.value = {
        ...roomDetails.value,
        ...omit(m, "type"),
      };
    }
  } else if (m.type === MessageType.ERROR) {
    errors.value.push(m.error);
    setTimeout(() => {
      errors.value.shift();
    }, 5000);
  } else {
    console.error(`Got unhandled message '${e.data}'`);
  }
});

ws.addEventListener("open", () => {
  console.log("Connected to server");
});
ws.addEventListener("close", () => {
  console.log("Disconnected from server");
  roomDetails.value = undefined;
  location.hash = "";
});

const onJoin = (userName: string, roomID: string) => {
  if (!UUID.value) return;
  username.value = userName;
  const msg: JoinRoomMessage = {
    type: MessageType.JOIN_ROOM,
    userName,
    userID: UUID.value,
    roomID,
  };
  ws.send(JSON.stringify(msg));
};
const onCreate = (userName: string) => {
  if (!UUID.value) return;
  username.value = userName;
  const msg: CreateRoomMessage = {
    type: MessageType.CREATE_ROOM,
    userName: userName,
    userID: UUID.value,
  };
  console.log(msg);
  ws.send(JSON.stringify(msg));
};
const onReorder = (players: string[]) => {
  if (!roomDetails.value || !UUID.value) return;
  const msg: RearrangePlayersMessage = {
    type: MessageType.REARRANGE_PLAYERS,
    roomID: roomDetails.value.roomID,
    players,
    userID: UUID.value,
  };
  ws.send(JSON.stringify(msg));
};
const onBegin = () => {
  if (!roomDetails.value || !UUID.value) return;
  const msg: BeginMessage = {
    type: MessageType.BEGIN,
    roomID: roomDetails.value.roomID,
    userID: UUID.value,
  };
  ws.send(JSON.stringify(msg));
};

const onMakeMove: MakeMoveFunction = (args) => {
  console.log("hello there", args);
  if (!roomDetails.value || !UUID.value) return;
  const hasPlate = args.plate?.color != null;
  const hasMiddle = args.middle != null;
  if (args.row == null || hasPlate === hasMiddle)
    return console.log({ ...args }, hasPlate);
  const msg: MakeMoveMessage = {
    type: MessageType.MAKE_MOVE,
    roomID: roomDetails.value.roomID,
    userID: UUID.value,
    row: args.row,
    plate: hasPlate ? (args.plate as MakeMoveMessage["plate"]) : undefined,
    middle: args.middle,
  };
  ws.send(JSON.stringify(msg));
};
</script>

<template>
  <RoomPrompt v-if="!roomDetails" :onJoin="onJoin" :onCreate="onCreate" />
  <Room
    v-if="username && roomDetails && !roomDetails.state"
    v-bind="roomDetails"
    :onReorder="onReorder"
    :username="username"
    :onBegin="onBegin"
  />
  <Game
    v-if="username && roomDetails?.state"
    v-bind="{
      players: roomDetails.players,
      creator: roomDetails.creator,
      state: roomDetails.state,
      username,
      onMakeMove,
    }"
  />
  <div class="fixed bottom-4 right-4">
    <div
      v-for="error in errors"
      class="p-4 mb-2 bg-white border-2 border-red-500 w-md dark:bg-gray-900"
    >
      {{ error }}
    </div>
  </div>
</template>

<style>
body {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply flex flex-col text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200 dark:border-gray-200;
}
</style>
