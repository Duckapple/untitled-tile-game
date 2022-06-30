<script setup lang="ts">
import { bgColors, TileColor, underColors } from "../colors";

defineProps<{
  color: TileColor;
  outlined?: boolean;
}>();
</script>

<template>
  <div
    class="transition-transform duration-200 hover:-translate-y-2 group isolate"
  >
    <div class="tile" :class="{ [bgColors[color]]: true, outline: outlined }">
      <div
        v-if="color === TileColor.FIRST"
        class="flex items-center justify-center w-full h-full font-serif text-5xl font-bold text-blue-800 select-none"
      >
        <span>1</span>
      </div>
      <div
        class="absolute inset-0 transition-shadow duration-200 shadow-md tile-bottom -z-10 group-hover:shadow-lg"
        :class="underColors[color]"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.tile {
  @apply inline-block w-16 h-16 rounded-2xl relative outline-4 outline-lime-500;
}
.tile-bottom {
  content: "";
  @apply block rounded-2xl w-16 h-16 translate-y-3;
}
</style>
