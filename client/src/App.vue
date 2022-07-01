<script setup lang="ts">
import { shuffle } from "lodash";
import { ref } from "vue";
import {
  TileColor,
  UpToFourColors,
  createPlayerBoard,
  MessageType,
} from "./model";
import Tile from "./components/Tile.vue";
import TileGroup from "./components/TileGroup.vue";
import PlayerBoard from "./components/PlayerBoard.vue";

const ws = new WebSocket("ws://localhost:8080");
ws.addEventListener("message", (e) => {
  console.log(e.data);
});

const bag = ref<TileColor[]>(
  shuffle([
    ...Array(20).fill(TileColor.BLACK),
    ...Array(20).fill(TileColor.BLUE),
    ...Array(20).fill(TileColor.RED),
    ...Array(20).fill(TileColor.YELLOW),
    ...Array(20).fill(TileColor.CYAN),
  ])
);

const middle = ref<TileColor[]>([TileColor.FIRST]);

const discards = ref<TileColor[]>([]);

function shuffleDiscards() {
  bag.value = shuffle(discards.value);
  discards.value = [];
}

const plates = Array(9)
  .fill(null)
  .map(() => {
    let plate = bag.value.splice(0, 4);
    if (plate.length !== 4 && discards.value.length > 0) {
      console.log("shuffling in discards...");
      shuffleDiscards();
      plate = [...plate, ...bag.value.splice(0, 4 - plate.length)];
    }
    return plate as UpToFourColors;
  });

const boardOne = ref(createPlayerBoard("Duckapple"));
boardOne.value.table[0][3] = TileColor.BLACK;
boardOne.value.table[1][1] = TileColor.BLUE;

// Absolute hack to ensure the classes are defined
let classes = "col-span-4 col-span-3 col-span-2 col-span-1";
classes = classes;

const selected = ref<[TileColor, number]>();
const selectedItems = ref<TileColor[]>();
// [].filter();
</script>

<template>
  <!-- <div class="flex flex-wrap -space-x-12"> -->
  <div class="grid grid-cols-3 w-lg">
    <TileGroup
      v-for="(plate, i) in plates"
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
    <Tile v-for="color in middle" :color="color" />
  </div>
  <PlayerBoard v-bind="boardOne" />
  <button
    @click="
      () =>
        ws.send(
          JSON.stringify({ type: MessageType.GET_STATE, payload: 'hi mom' })
        )
    "
  >
    Clicky
  </button>
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
