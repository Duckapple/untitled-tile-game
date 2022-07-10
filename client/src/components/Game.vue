<script lang="ts" setup>
import { computed, effect, ref } from "vue";
import { MakeMoveFunction } from "../App.vue";
import { GameState, TileColor, GameSettings } from "../model";
import { store } from "../state";
import TileGroup from "./TileGroup.vue";
import PlayerBoard from "./PlayerBoard.vue";
import Tile from "./Tile.vue";
import { mapValues } from "lodash";
import { setTitle } from "../title";

const props = defineProps<{
  state: GameState;
  players: string[];
  username: string;
  creator: string;
  settings: GameSettings;
  onMakeMove: MakeMoveFunction;
}>();

// Absolute hack to ensure the classes are defined
let classes = "col-span-4 col-span-3 col-span-2 col-span-1";
classes = classes;

const selectedPlate = ref<{ color: TileColor; index: number }>();
const selectedMiddle = ref<TileColor>();
const selectedItems = ref<TileColor[]>();

const makeMove = (row: number) => {
  props.onMakeMove({
    row,
    middle: selectedMiddle.value,
    plate: selectedPlate.value,
  });
  selectedPlate.value = undefined;
  selectedMiddle.value = undefined;
  selectedItems.value = undefined;
};

const me = computed(() =>
  props.state.playerBoards.find(
    ({ playerName }) => playerName === props.username
  )
);

const middleHover = ref<TileColor>();

const otherPlayers = computed(() => {
  const index = props.players.indexOf(props.username);
  return [
    ...props.state.playerBoards.slice(index + 1),
    ...props.state.playerBoards.slice(0, index),
  ];
});

const middleResult = computed(() => {
  let obj = mapValues(props.state.middleBoard.common, (v) => ({
    count: v,
    transparent: 0,
  }));
  if (selectedPlate.value != null) {
    const { color, index } = selectedPlate.value;
    const plate = props.state.middleBoard.plates[index];
    obj = plate
      .filter((c) => color !== c)
      .reduce(
        (obj, c) => ({
          ...obj,
          [c]: { ...obj[c], transparent: obj[c]?.transparent + 1 },
        }),
        obj
      );
  }
  return Object.entries(obj) as [
    TileColor,
    Record<"count" | "transparent", number>
  ][];
});
effect(() => {
  if (props.state.currentPlayer === props.players.indexOf(props.username)) {
    setTitle("Your Turn!");
  } else {
    setTitle(`Waiting on ${props.players[props.state.currentPlayer]}`);
  }
});
</script>

<template>
  <div class="flex">
    <div class="m-8 flex flex-col max-w-[58rem]">
      <div class="flex flex-wrap">
        <TileGroup
          class="-mb-8 -mr-8"
          v-for="(plate, index) in state.middleBoard.plates"
          :colors="plate"
          :selected="
            selectedPlate?.index === index ? selectedPlate.color : undefined
          "
          :onPick="
            (color) => {
              if (
                selectedPlate?.color === color &&
                selectedPlate?.index === index
              ) {
                selectedPlate = undefined;
                selectedItems = undefined;
              } else {
                selectedMiddle = undefined;
                selectedPlate = { color, index };
                selectedItems = plate.filter((c) => c === color);
              }
            }
          "
        />
      </div>
      <div class="flex flex-wrap py-8">
        <div class="h-16"></div>
        <template v-for="[color, { count, transparent }] in middleResult">
          <Tile
            v-for="_ in Array(count)"
            :color="color"
            :outlined="
              middleHover === color ||
              selectedMiddle === color ||
              (color === TileColor.FIRST && selectedItems?.includes(color))
            "
            @pointerenter="middleHover = color"
            @pointerleave="middleHover = undefined"
            @click="
              () => {
                if (selectedMiddle === color) {
                  selectedMiddle = undefined;
                  selectedItems = undefined;
                } else {
                  selectedMiddle = color;
                  selectedPlate = undefined;
                  selectedItems = Array(count).fill(color);
                  if (
                    color !== TileColor.FIRST &&
                    state.middleBoard.common[TileColor.FIRST] > 0
                  ) {
                    selectedItems.push(TileColor.FIRST);
                  }
                }
              }
            "
          />
          <Tile
            v-for="_ in Array(transparent)"
            :color="color"
            :transparent="true"
          />
        </template>
      </div>
      <PlayerBoard
        v-if="me"
        v-bind="me"
        :selected="selectedItems"
        :interactive="state.currentPlayer === players.indexOf(username)"
        :self="true"
        :creator="me.playerName === creator"
        :onMakeMove="makeMove"
        :settings="settings"
      />
      <div>
        <label
          for="colorBlindCheck"
          class="px-1 mr-2 font-serif border rounded-md"
        >
          T
        </label>
        <input
          type="checkbox"
          id="colorBlindCheck"
          v-model="store.settings.colorBlind"
        />
      </div>
    </div>
    <div class="flex flex-col w-0 h-0 m-8 scale-50">
      <PlayerBoard
        v-for="(player, i) in otherPlayers"
        v-bind="player"
        :interactive="
          state.currentPlayer === players.indexOf(player.playerName)
        "
        :self="false"
        :creator="player.playerName === creator"
        :settings="settings"
        class="hover:scale-[200%] origin-top-left transition"
        :class="{ 'z-30': i === 0, 'z-20': i === 1, 'z-10': i === 2 }"
      />
    </div>
  </div>
</template>
