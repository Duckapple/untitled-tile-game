<script setup lang="ts">
import { ref } from "vue";
import { TileColor, UpToFourColors } from "../model";
import Tile from "./Tile.vue";

const { selected } = defineProps<{
  colors: UpToFourColors;
  columns?: number;
  selected?: TileColor;
  onPick: (t: TileColor) => void;
}>();

let highlit = ref<TileColor | undefined>(undefined);
const setHighlit = (color?: TileColor) => (highlit.value = color);
</script>

<template>
  <div class="tile-plate" :class="{ selected: selected }">
    <Tile
      v-for="color in colors"
      :color="color"
      :outlined="selected === color || highlit === color"
      @click="onPick(color)"
      @pointerenter="() => setHighlit(color)"
      @pointerleave="() => setHighlit()"
    />
  </div>
</template>

<style scoped>
.tile-plate {
  @apply p-8 w-52 h-52 grid grid-cols-2 gap-[0.125rem] rounded-full border-2 border-gray-700 transition scale-50 bg-orange-600;
}

.tile-plate:hover {
  @apply scale-100;
}

.tile-plate.selected {
  @apply scale-100;
}
</style>
