<script lang="ts" setup>
import { ref } from "vue";
import { toggleConfetti } from "../confetti";
import { TileColor } from "../model";
import Tile from "./Tile.vue";

const props = defineProps<{
  standings: string[];
  endGame?: () => void;
  username?: string;
}>();
const showEndGame = ref(false);
const revealed = ref<(string | null)[]>(props.standings.map(() => null));

[...props.standings].reverse().forEach((player, index) => {
  setTimeout(() => {
    revealed.value[props.standings.length - index - 1] = player;
    if (index === props.standings.length - 1) {
      setTimeout(() => {
        toggleConfetti();
        setTimeout(() => {
          showEndGame.value = true;
        }, 5000);
      }, 1000);
    }
  }, 3000 + 5000 * index);
});
const hide = ref(false);
</script>

<template>
  <div class="fade-in">
    <div
      class="absolute inset-0 z-40 transition-opacity bg-black opacity-60"
      :class="{ 'opacity-0': hide }"
    ></div>
    <div
      class="absolute inset-0 z-50 flex items-center justify-center transition-opacity"
      :class="{ 'opacity-0': hide }"
    >
      <div class="grid grid-cols-3 text-2xl text-center results w-xl">
        <div />
        <div
          class="flex items-end justify-center"
          :class="{ result: !!revealed[0] }"
        >
          {{ revealed[0] }}
        </div>
        <div />
        <div
          class="flex items-end justify-center"
          :class="{ result: !!revealed[1] }"
        >
          {{ revealed[1] }}
        </div>
        <div class="text-4xl text-blue-800 bg-stone-400">1st</div>
        <div />
        <template v-if="standings.length > 1">
          <div class="text-4xl text-blue-800 bg-stone-400">2nd</div>
          <div class="bg-stone-400"></div>
          <div
            class="flex items-end justify-center"
            :class="{ result: !!revealed[2] }"
          >
            {{ revealed[2] }}
          </div>
        </template>
        <template v-if="standings.length > 2">
          <div class="bg-stone-400"></div>
          <div class="bg-stone-400"></div>
          <div class="text-4xl text-blue-800 bg-stone-400">3rd</div>
        </template>
        <div
          class="col-span-3 text-sm transition-opacity text-stone-600 dark:text-stone-400"
          :class="{ 'opacity-0': !showEndGame }"
        >
          click and hold anywhere to hide results
        </div>
      </div>
    </div>
    <canvas
      class="z-[60] absolute inset-0"
      id="confetti-canvas"
      @pointerdown="() => (hide = true)"
      @pointerup="() => (hide = false)"
    ></canvas>
    <div
      class="z-[70] absolute inset-x-0 bottom-20 flex justify-center isolate text-2xl transition-opacity"
      :class="{
        'opacity-0': !showEndGame || hide,
        'opacity-100': showEndGame && !hide,
      }"
      v-if="endGame"
      @pointerup="() => (hide = false)"
    >
      <Tile
        @click="endGame"
        role="button"
        :color="TileColor.RED"
        :unrestrained="true"
      >
        <span class="block px-8 py-4 cursor-pointer">End Game</span>
      </Tile>
    </div>
  </div>
</template>

<style scoped>
.grid > div {
  @apply p-4;
}

.fade-in {
  animation: fade-in 1000ms;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.result {
  animation: reveal 3000ms;
}

@keyframes reveal {
  0% {
    @apply scale-0;
  }
  25% {
    @apply scale-[400%] rotate-12;
  }
  100% {
    @apply scale-100;
  }
}
</style>
