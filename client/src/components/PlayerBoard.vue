<script lang="ts" setup>
import { zip } from "lodash";
import { computed, ref } from "vue";
import TileHolder from "./TileHolder.vue";
import { PlayerBoard, TileColor, Tuple } from "../model";

export interface PlayerBoardProps extends PlayerBoard {
  rows: (TileColor | undefined)[][];
  table: (TileColor | undefined)[][];
  dropped: Tuple<TileColor | undefined, 7>;
  playerName: string;
  score: number;
  creator: boolean;
  self: boolean;
  interactive: boolean;
  onMakeMove?: (row: number) => void;

  selected?: TileColor[];
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

const props = defineProps<PlayerBoardProps>();

const hoveredRow = ref<number>();

type X = { color?: TileColor; transparent?: boolean };
const hovered = computed<{
  rows: X[][];
  dropped: X[];
}>(() => {
  if (hoveredRow.value == null || props.selected == null)
    return {
      rows: props.rows.map((row) => row.map((color) => ({ color }))),
      dropped: props.dropped.map((color) => ({ color })),
    };
  const tiles = props.selected.filter((color) => color !== TileColor.FIRST);
  let firstTile = props.selected.find((color) => color === TileColor.FIRST);
  const color = tiles[0];

  const rowAtHover: X[] = [
    ...props.rows[hoveredRow.value].map((color) => ({ color })),
  ];
  if (
    [null, undefined, color].includes(
      rowAtHover[rowAtHover.length - 1].color
    ) &&
    !props.table[hoveredRow.value].includes(color)
  )
    for (let i = rowAtHover.length; i >= 0; i--) {
      const el = rowAtHover[i];
      if (!el || el.color) continue;
      el.color = tiles.pop();
      el.transparent = true;
    }

  const droppedAtHover = props.dropped.map((color) => {
    if (!color) {
      if (firstTile) {
        firstTile = undefined;
        return { color: TileColor.FIRST, transparent: true };
      }
      return { color: tiles.pop(), transparent: true };
    }
    return { color };
  });

  return {
    rows: props.rows.map((row, i) => {
      if (i === hoveredRow.value) {
        return rowAtHover;
      }
      return row.map((color) => ({ color }));
    }),
    dropped: droppedAtHover,
  };
});
</script>

<template>
  <div
    class="flex flex-col px-8 pt-2 pb-6 border-2 w-4xl"
    :class="{
      'border-black dark:border-gray-200': !interactive,
      'border-lime-500': interactive,
    }"
  >
    <div class="flex justify-between mb-2 text-xl" :class="{ underline: self }">
      <span>{{ playerName }}{{ creator ? " 👑" : undefined }}</span>
      <span v-if="interactive" class="text-lime-500">Your Turn</span>
    </div>
    <div class="flex mb-4 space-x-4">
      <div
        class="grid grid-cols-5 gap-1 outline-4 outline-lime-500 outline-offset-4 rounded-2xl"
        :class="{ outline: self && interactive && selected }"
        @pointerleave="() => self && interactive && (hoveredRow = undefined)"
      >
        <template v-for="(row, index) in hovered.rows">
          <div
            v-if="row.length < 5"
            :class="`col-span-${5 - row.length}`"
            @pointerenter="
              () =>
                self &&
                interactive &&
                hoveredRow !== index &&
                (hoveredRow = index)
            "
            @click="() => self && interactive && onMakeMove?.(index)"
          />
          <TileHolder
            v-for="color in row"
            v-bind="color"
            @pointerenter="
              () =>
                self &&
                interactive &&
                hoveredRow !== index &&
                (hoveredRow = index)
            "
            @click="() => self && interactive && onMakeMove?.(index)"
          />
        </template>
      </div>
      <div class="grid grid-cols-5 gap-1">
        <TileHolder
          v-for="([color], i) in zip(table.flat())"
          :color="color"
          :background="backgrounds[i]"
        />
      </div>
    </div>
    <div class="flex items-end justify-between">
      <div class="flex">
        <TileHolder
          v-for="([color, penalty], i) in zip(
            hovered.dropped,
            [-1, -1, -2, -2, -2, -3, -3]
          )"
          v-bind="color"
          :number="penalty"
          :class="{ 'ml-4': i === 5, 'ml-1': i > 0 && i !== 5 }"
        />
      </div>
      <span class="mb-2 text-5xl">{{ score }} pts</span>
    </div>
  </div>
</template>
