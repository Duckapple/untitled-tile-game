<script lang="ts" setup>
import { zip } from "lodash";
import { ref } from "vue";
import TileHolder from "./TileHolder.vue";
import { PlayerBoard, TileColor, Tuple } from "../model";

export interface PlayerBoardProps extends PlayerBoard {
  rows: (TileColor | undefined)[][];
  table: (TileColor | undefined)[][];
  dropped: Tuple<TileColor | undefined, 7>;
  playerName: string;
  score: number;

  selected?: [TileColor, number];
}

const BLACK = TileColor.BLACK;
const BLUE = TileColor.BLUE;
const RED = TileColor.RED;
const YELLOW = TileColor.YELLOW;
const CYAN = TileColor.CYAN;

// prettier-ignore
const positions = [
  [BLUE, YELLOW, RED, BLACK, CYAN],
  [CYAN, BLUE, YELLOW, RED, BLACK],
  [BLACK, CYAN, BLUE, YELLOW, RED],
  [RED, BLACK, CYAN, BLUE, YELLOW],
  [YELLOW, RED, BLACK, CYAN, BLUE],
];
const backgrounds = positions.flat();

const { table } = defineProps<PlayerBoardProps>();

const selectedDropped = ref<TileColor[]>();

const addCheat = (i: number) => {
  const r = Math.floor(i / 5);
  const c = i % 5;
  table[r][c] = table[r][c] === TileColor.RED ? undefined : TileColor.RED;
};
</script>

<template>
  <div class="px-8 pt-2 pb-6 border-2 border-black">
    <div class="mb-2 text-xl">{{ playerName }}</div>
    <div class="flex mb-4 space-x-4">
      <div
        class="grid grid-cols-5 gap-1 outline-4 outline-lime-500 outline-offset-4 rounded-2xl"
        :class="{ outline: selected }"
      >
        <template v-for="row in rows" @pointerenter="">
          <div v-if="row.length < 5" :class="`col-span-${5 - row.length}`" />
          <TileHolder v-for="color in row" :color="color" />
        </template>
      </div>
      <div class="grid grid-cols-5 gap-1">
        <TileHolder
          v-for="([color], i) in zip(table.flat())"
          :color="color"
          :background="backgrounds[i]"
          @click="addCheat(i)"
        />
      </div>
    </div>
    <div class="flex space-x-1">
      <TileHolder
        v-for="[color, penalty] in zip(dropped, [-1, -1, -2, -2, -2, -3, -3])"
        :color="color"
        :number="penalty"
      />
    </div>
  </div>
</template>
