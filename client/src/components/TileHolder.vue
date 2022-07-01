<script setup lang="ts">
import { backgroundColors } from "../colors";
import { TileColor } from "../model";
import Tile from "./Tile.vue";
import { ref } from "vue";

const { background, color, hidden, transparent, number } = defineProps<{
  color?: TileColor;
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
      'border-black': !hidden,
      'border-transparent': hidden,
      [bg]: background,
      'mb-4': number != null,
    }"
  >
    <span v-if="number != null" class="absolute right-6 -bottom-7">
      {{ number }}
    </span>
    <Tile
      v-if="color"
      class="absolute -top-3.5 -left-0.5"
      :class="{ 'opacity-50': transparent }"
      :color="color"
    />
  </div>
</template>

<style scoped></style>
