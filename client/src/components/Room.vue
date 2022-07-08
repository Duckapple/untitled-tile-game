<script lang="ts" setup>
import { ref } from "vue";
import { without } from "lodash";
import { GameSettings, TileColor } from "../model";
import Tile from "./Tile.vue";
import Settings from "./Settings.vue";
const props = defineProps<{
  username: string;
  players: string[];
  roomID: string;
  creator: string;
  settings: GameSettings;
  onReorder: (players: string[]) => void;
  onSettingsUpdate: () => void;
  onBegin: () => void;
}>();
const over = ref<number>();
const roomIDClicked = ref<boolean>();
const indicateClicked = () => {
  roomIDClicked.value = true;
  setTimeout(() => {
    roomIDClicked.value = false;
  }, 3000);
};
const onDrop = (
  players: string[],
  index: number,
  player?: string,
  dragPlayer?: string
) => {
  if (dragPlayer && dragPlayer !== player) {
    const withoutPlayer = without(players, dragPlayer);
    const reordered = [
      ...withoutPlayer.slice(0, index),
      dragPlayer,
      ...withoutPlayer.slice(index),
    ];
    props.onReorder(reordered);
  }
};
const nav = navigator;
const location = window.location.origin;
const settingsApplied = ref(true);
const applySettings = () => {
  props.onSettingsUpdate();
  settingsApplied.value = true;
};
</script>

<template>
  <div class="flex flex-col justify-center w-full h-screen text-2xl">
    <div class="flex flex-col items-center justify-center">
      <div class="flex items-center justify-center">
        <div class="w-md">
          <table>
            <tr
              v-for="(player, i) in [...players, ...Array(4 - players.length)]"
              :draggable="creator === username && !!player"
              :class="{
                'outline outline-offset-2 outline-2 outline-lime-500':
                  over === i,
                underline: player === username,
                'cursor-move': creator === username && !!player,
              }"
              @dragstart="
                (e) => {
                  if (e.dataTransfer && player) {
                    e.dataTransfer.setData('text/plain', player);
                    e.dataTransfer.dropEffect = 'move';
                  }
                }
              "
              @dragover="
                (e) => {
                  if (player) {
                    over = i;
                    e.preventDefault();
                    if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                  }
                }
              "
              @dragleave="() => (over = undefined)"
              @drop="
                (e) => {
                  e.preventDefault();
                  over = undefined;
                  onDrop(
                    players,
                    i,
                    player,
                    e.dataTransfer?.getData('text/plain')
                  );
                }
              "
            >
              <td>
                <span>{{ player }}</span>
                <span v-if="player === creator">👑</span>
              </td>
            </tr>
          </table>
        </div>
        <div class="flex flex-col items-center ml-20 w-52">
          <span
            class="text-5xl transition-colors ease-out cursor-pointer"
            :class="{
              'text-green-800 dark:text-green-400': roomIDClicked,
            }"
            @click="
              () => {
                nav.clipboard.writeText(`${location}/#${roomID}`);
                indicateClicked();
              }
            "
          >
            {{ roomID }}
          </span>
          <span class="mb-8 text-lg">Click ID to copy room link</span>
          <Tile
            v-if="username === creator"
            role="button"
            :color="TileColor.BLUE"
            :unrestrained="true"
            @click="() => onBegin()"
          >
            <span class="block px-8 py-4 cursor-pointer"> Start Game </span>
          </Tile>
        </div>
      </div>
      <div class="flex-1 mt-8">
        <div class="flex flex-col items-center">
          <Settings
            v-bind="{
              settings,
              isCreator: username === creator,
              onChanged: () => (settingsApplied = false),
            }"
          />
          <Tile
            v-if="username === creator"
            role="button"
            :color="settingsApplied ? TileColor.BLACK : TileColor.BLUE"
            :unrestrained="true"
            class="my-4"
            @click="applySettings"
          >
            <span class="block px-8 py-4 cursor-pointer"> Apply Settings </span>
          </Tile>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
table {
  @apply w-full;
}
tr {
  @apply border-x-2 border-t-2 w-full flex;
}
tr:last-child {
  @apply border-b-2;
}
td {
  @apply px-4 h-14 flex items-center justify-between grow;
}
td:not(:last-child) {
  @apply border-r-2;
}
td > span {
  @apply mr-4;
}
td > span.mr-0 {
  margin-right: 0;
}
input {
  @apply bg-transparent w-10 text-end;
}
</style>
