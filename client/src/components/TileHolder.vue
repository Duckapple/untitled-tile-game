<script setup lang="ts">
import {
  backgroundColors,
  colorShorthands,
  colorShorthandColors,
} from "../colors";
import { TileColor } from "../model";
import { store } from "../state";
import Tile from "./Tile.vue";
import { ref } from "vue";

const { background, color, hidden, transparent, number } = defineProps<{
  color?: TileColor | null;
  background?: TileColor;
  hidden?: boolean;
  transparent?: boolean;
  number?: number;
}>();
const bg = ref(background ? backgroundColors[background] : "");
</script>

<template>
  <div
    class="relative w-16 h-16 border-2 bg-opacity-80 rounded-2xl"
    :class="{
      'border-black dark:border-gray-200': !hidden,
      'border-transparent': hidden,
      [bg]: background,
      'mb-4': number != null,
    }"
  >
    <span v-if="number != null" class="absolute right-6 -bottom-7">
      {{ number }}
    </span>
    <div
      v-if="store.settings.colorBlind && !color && background"
      class="flex items-center justify-center w-full h-full font-serif text-5xl font-bold select-none text-stone-400"
    >
      <span>{{ colorShorthands[background] }}</span>
    </div>
    <Tile
      v-if="color"
      class="absolute -top-3.5 -left-0.5"
      :color="color"
      :transparent="transparent"
    />
  </div>
</template>

<style scoped></style>
