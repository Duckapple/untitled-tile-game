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
import { store } from "./state";
import Tile from "./components/Tile.vue";
import TileGroup from "./components/TileGroup.vue";
import PlayerBoard from "./components/PlayerBoard.vue";
import RoomPrompt from "./components/RoomPrompt.vue";
import Room from "./components/Room.vue";
import { omit } from "lodash";

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

// Absolute hack to ensure the classes are defined
let classes = "col-span-4 col-span-3 col-span-2 col-span-1";
classes = classes;

const selected = ref<[TileColor, number]>();
const selectedItems = ref<TileColor[]>();

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

type PartialMove = Partial<Pick<MakeMoveMessage, "middle" | "row">> & {
  plate: Partial<MakeMoveMessage["plate"]>;
};
const moveParams = ref<PartialMove>({ row: 0, plate: { index: 0 } });

const onMakeMove = (args: {
  row?: number;
  middle?: TileColor;
  plate?: Partial<MakeMoveMessage["plate"]>;
}) => {
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
  <template v-if="roomDetails?.state">
    <div class="flex">
      <div class="grid grid-cols-3 w-lg">
        <TileGroup
          v-for="(plate, i) in roomDetails.state.middleBoard.plates"
          :colors="plate"
          :selected="selected?.[1] === i ? selected[0] : undefined"
          :onPick="
            (t) => {
              if (selected?.[0] === t && selected?.[1] === i) {
                selected = undefined;
                selectedItems = undefined;
              } else {
                selected = [t, i];
                selectedItems = plate.filter((color) => color === t);
              }
            }
          "
        />
      </div>
    </div>
    <div class="flex p-8">
      <template
        v-for="[color, amount] in (Object.entries(roomDetails.state.middleBoard.common) as [TileColor, number][])"
      >
        <Tile v-for="_ in Array(amount)" :color="color" />
      </template>
    </div>
    <PlayerBoard
      v-for="player in roomDetails.state.playerBoards"
      v-bind="player"
    />
    <button @click="() => onMakeMove(moveParams)">Dummy message</button>
    <input
      class="w-16 ml-4 bg-transparent"
      v-model="moveParams.row"
      type="number"
      max="4"
      min="0"
    />
    <select class="w-24 ml-4 bg-transparent" v-model="moveParams.middle">
      <option :value="undefined">None</option>
      <option v-for="color in TileColor" :value="color">{{ color }}</option>
    </select>
    <select class="w-24 ml-4 bg-transparent" v-model="moveParams.plate!.color">
      <option :value="undefined">None</option>
      <option v-for="color in TileColor" :value="color">{{ color }}</option>
    </select>
    <input
      class="w-16 ml-4 bg-transparent"
      v-model="moveParams.plate!.index"
      type="number"
      :max="roomDetails.players.length * 2"
      min="0"
    />
    <div>
      <label
        for="colorBlindCheck"
        class="px-1 mr-2 font-serif border rounded-md"
        >T</label
      >
      <input
        type="checkbox"
        id="colorBlindCheck"
        v-model="store.settings.colorBlind"
      />
    </div>
    <div class="h-xl"></div>
  </template>
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
