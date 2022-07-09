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
  UpdateSettingsMessage,
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

const notifs = ref<string[]>([]);

const host = location.origin.replace(/^http/, "ws");

const ws = new WebSocket(host + "/ws");

const addNotif = (message: string) => {
  notifs.value.push(message);
  setTimeout(() => {
    notifs.value.shift();
  }, 10000);
};

ws.addEventListener("message", (evt) => {
  let m: MessageResponse;
  try {
    m = JSON.parse(evt.data.toString());
  } catch (err) {
    addNotif(`Could not parse message '${evt.data}'`);
    return;
  }

  if (m.type === MessageType.ASSIGN_UUID) {
    UUID.value = m.userID;
  } else if (m.type === MessageType.CREATE_ROOM) {
    location.hash = `#${m.roomID}`;
    roomDetails.value = omit(m, "type");
  } else if (m.type === MessageType.JOIN_ROOM) {
    location.hash = `#${m.roomID}`;
    roomDetails.value = omit(m, "type");
  } else if (m.type === MessageType.UPDATE_ROOM) {
    if (!roomDetails.value) {
      addNotif("Got update for non-existing room details!");
    } else {
      roomDetails.value = {
        ...roomDetails.value,
        ...omit(m, "type"),
      };
    }
    if (m.update) addNotif(m.update);
  } else if (m.type === MessageType.ERROR) {
    if (m.error) addNotif(m.error);
  } else {
    addNotif(`Got unhandled message '${evt.data}'`);
  }
});

ws.addEventListener("open", () => {
  addNotif("Connected to server");
});
ws.addEventListener("close", () => {
  addNotif("Disconnected from server");
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
  ws.send(JSON.stringify(msg));
};
const onSettingsUpdate = () => {
  if (!roomDetails.value || !UUID.value) return;
  const msg: UpdateSettingsMessage = {
    type: MessageType.UPDATE_SETTINGS,
    userID: UUID.value,
    roomID: roomDetails.value.roomID,
    settings: roomDetails.value.settings,
  };
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
    :onSettingsUpdate="onSettingsUpdate"
  />
  <Game
    v-if="username && roomDetails?.state"
    v-bind="{
      players: roomDetails.players,
      creator: roomDetails.creator,
      state: roomDetails.state,
      settings: roomDetails.settings,
      username,
      onMakeMove,
    }"
  />
  <div class="fixed bottom-4 right-4">
    <div
      v-for="error in notifs"
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
