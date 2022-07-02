<script setup lang="ts">
import { ref } from "vue";
import {
  TileColor,
  MessageType,
  GetStateMessage,
  MessageResponse,
  GameState,
} from "./model";
import Tile from "./components/Tile.vue";
import TileGroup from "./components/TileGroup.vue";
import PlayerBoard from "./components/PlayerBoard.vue";

const state = ref<GameState>();

const ws = new WebSocket("ws://localhost:8080");

ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data.toString()) as MessageResponse;
  if (m.type === MessageType.GET_STATE) {
    state.value = m.state;
    console.log("Updated state");
  }
});

ws.addEventListener("open", () => {
  const msg: GetStateMessage = { type: MessageType.GET_STATE };
  ws.send(JSON.stringify(msg));
  console.log("Connected to server");
});

// Absolute hack to ensure the classes are defined
let classes = "col-span-4 col-span-3 col-span-2 col-span-1";
classes = classes;

const selected = ref<[TileColor, number]>();
const selectedItems = ref<TileColor[]>();
</script>

<template>
  <!-- <div class="flex flex-wrap -space-x-12"> -->
  <div class="grid grid-cols-3 w-lg">
    <TileGroup
      v-for="(plate, i) in state?.middleBoard.plates"
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
  <div class="flex p-8">
    <template
      v-if="state"
      v-for="[color, amount] in (Object.entries(state.middleBoard.common) as [TileColor, number][])"
    >
      <Tile v-for="_ in Array(amount)" :color="color" />
    </template>
  </div>
  <PlayerBoard v-if="state" v-bind="state.playerBoards[0]" />
  <div class="h-xl"></div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  @apply flex flex-col text-gray-900 bg-white dark:bg-gray-900 dark:text-gray-200;
}
</style>
