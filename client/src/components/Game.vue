<script lang="ts" setup>
import { ref } from "vue";
import { MakeMoveFunction } from "../App.vue";
import { GameState, TileColor } from "../model";
import { store } from "../state";
import TileGroup from "./TileGroup.vue";
import PlayerBoard from "./PlayerBoard.vue";
import Tile from "./Tile.vue";

const props = defineProps<{
  state: GameState;
  players: string[];
  username: string;
  creator: string;
  onMakeMove: MakeMoveFunction;
}>();

// Absolute hack to ensure the classes are defined
let classes = "col-span-4 col-span-3 col-span-2 col-span-1";
classes = classes;

const selectedPlate = ref<{ color: TileColor; index: number }>();
const selectedMiddle = ref<TileColor>();
const selectedItems = ref<TileColor[]>();

const makeMove = (row: number) => {
  console.log(row, selectedPlate.value, selectedMiddle.value);
  props.onMakeMove({
    row,
    middle: selectedMiddle.value,
    plate: selectedPlate.value,
  });
  selectedPlate.value = undefined;
  selectedMiddle.value = undefined;
  selectedItems.value = undefined;
};
</script>

<template>
  <div class="flex">
    <div class="grid grid-cols-3 w-lg">
      <TileGroup
        v-for="(plate, index) in state.middleBoard.plates"
        :colors="plate"
        :selected="
          selectedPlate?.index === index ? selectedPlate.color : undefined
        "
        :onPick="
          (color) => {
            if (
              selectedPlate?.color === color &&
              selectedPlate?.index === index
            ) {
              selectedPlate = undefined;
              selectedItems = undefined;
            } else {
              selectedMiddle = undefined;
              selectedPlate = { color, index };
              selectedItems = plate.filter((c) => c === color);
            }
          }
        "
      />
    </div>
  </div>
  <div class="flex p-8">
    <template
      v-for="[color, amount] in (Object.entries(state.middleBoard.common) as [TileColor, number][])"
    >
      <Tile
        v-for="_ in Array(amount)"
        :color="color"
        :outlined="
          selectedMiddle === color ||
          (color === TileColor.FIRST && selectedItems?.includes(color))
        "
        @click="
          () => {
            if (selectedMiddle === color) {
              selectedMiddle = undefined;
              selectedItems = undefined;
            } else {
              selectedMiddle = color;
              selectedPlate = undefined;
              selectedItems = Array(amount).fill(color);
              if (
                color !== TileColor.FIRST &&
                state.middleBoard.common[TileColor.FIRST] > 0
              ) {
                selectedItems.push(TileColor.FIRST);
              }
            }
          }
        "
      />
    </template>
  </div>
  <PlayerBoard
    v-for="player in state.playerBoards"
    v-bind="player"
    :selected="selectedItems"
    :interactive="state.currentPlayer === players.indexOf(username)"
    :self="player.playerName === username"
    :creator="player.playerName === creator"
    :onMakeMove="makeMove"
  />
  <div>
    <label for="colorBlindCheck" class="px-1 mr-2 font-serif border rounded-md"
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
