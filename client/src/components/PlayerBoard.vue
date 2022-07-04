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
  onMakeMove: (row: number) => void;

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
    [null, undefined, color].includes(rowAtHover[rowAtHover.length - 1].color)
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

const addCheat = (i: number) => {
  const r = Math.floor(i / 5);
  const c = i % 5;
  props.table[r][c] =
    props.table[r][c] === TileColor.RED ? undefined : TileColor.RED;
};
// const log = console.log;
</script>

<template>
  <div class="px-8 pt-2 pb-6 border-2 border-black">
    <div class="mb-2 text-xl" :class="{ underline: self }">
      {{ playerName }}{{ creator ? " 👑" : undefined }}
    </div>
    <div class="flex mb-4 space-x-4">
      <div
        class="grid grid-cols-5 gap-1 outline-4 outline-lime-500 outline-offset-4 rounded-2xl"
        :class="{ outline: interactive && selected }"
        @pointerleave="() => interactive && (hoveredRow = undefined)"
      >
        <template v-for="(row, index) in hovered.rows">
          <div
            v-if="row.length < 5"
            :class="`col-span-${5 - row.length}`"
            @pointerenter="
              () => interactive && hoveredRow !== index && (hoveredRow = index)
            "
            @click="() => interactive && onMakeMove(index)"
          />
          <TileHolder
            v-for="color in row"
            v-bind="color"
            @pointerenter="
              () => interactive && hoveredRow !== index && (hoveredRow = index)
            "
            @click="() => interactive && onMakeMove(index)"
          />
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
        v-for="[color, penalty] in zip(
          hovered.dropped,
          [-1, -1, -2, -2, -2, -3, -3]
        )"
        v-bind="color"
        :number="penalty"
      />
    </div>
  </div>
</template>
