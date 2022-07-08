<script setup lang="ts">
import {
  bgColors,
  underColors,
  colorShorthandColors,
  colorShorthands,
} from "../colors";
import { store } from "../state";
import { TileColor } from "../model";

defineProps<{
  color: TileColor;
  outlined?: boolean;
  unrestrained?: boolean;
  transparent?: boolean;
}>();
</script>

<template>
  <div
    class="transition-transform hover:-translate-y-2 group isolate"
    :class="{ unrestrained: unrestrained, 'opacity-50': !!transparent }"
  >
    <div class="tile" :class="{ [bgColors[color]]: true, outline: outlined }">
      <div
        v-if="store.settings.colorBlind || color === TileColor.FIRST"
        class="flex items-center justify-center w-full h-full font-serif text-5xl font-bold select-none"
        :class="colorShorthandColors[color]"
      >
        <span>{{ colorShorthands[color] }}</span>
      </div>
      <slot></slot>
      <div
        class="absolute inset-0 transition-shadow shadow-md tile-bottom -z-10 group-hover:shadow-lg"
        :class="underColors[color]"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.tile {
  @apply inline-block w-16 h-16 rounded-2xl relative outline-4 outline-lime-500;
}
.unrestrained .tile,
.unrestrained .tile-bottom {
  @apply w-auto;
}
.tile-bottom {
  content: "";
  @apply block rounded-2xl w-16 h-16 translate-y-3;
}
</style>
