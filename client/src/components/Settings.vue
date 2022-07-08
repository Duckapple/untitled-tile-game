<script lang="ts" setup>
import { GameSettings } from "../model";

const props = defineProps<{
  settings: GameSettings;
  isCreator: boolean;
  onChanged: () => void;
}>();

const setReward = (e: Event, key: keyof GameSettings["pointRewards"]) => {
  const value = Number((e.target as HTMLInputElement).value);
  if (isNaN(value)) return;
  props.settings.pointRewards[key] = value;
  props.onChanged();
};
const setPenalty = (e: Event, index: number) => {
  const value = Number((e.target as HTMLInputElement).value);
  if (isNaN(value)) return;
  props.settings.pointPenalties[index] = value;
  props.onChanged();
};
</script>

<template>
  <table>
    <tr>
      <td>
        <span>Column Points:</span>
        <input
          v-if="isCreator"
          :value="settings.pointRewards.column"
          @input="(e) => setReward(e, 'column')"
        />
        <span v-if="!isCreator" class="mr-0">
          {{ settings.pointRewards.column }}
        </span>
      </td>
      <td>
        <span>Row Points:</span>
        <input
          v-if="isCreator"
          :value="settings.pointRewards.row"
          @input="(e) => setReward(e, 'row')"
        />
        <span v-if="!isCreator" class="mr-0">
          {{ settings.pointRewards.row }}
        </span>
      </td>
      <td>
        <span>All Color Points:</span>
        <input
          v-if="isCreator"
          :value="settings.pointRewards.color"
          @input="(e) => setReward(e, 'color')"
        />
        <span v-if="!isCreator" class="mr-0">
          {{ settings.pointRewards.color }}
        </span>
      </td>
    </tr>
    <tr>
      <td class="w-full">
        <span>Penalty Points</span>
        <input
          v-if="isCreator"
          v-for="(penalty, i) in settings.pointPenalties"
          :value="penalty"
          @input="(e) => setPenalty(e, i)"
        />
        <span
          v-if="!isCreator"
          v-for="(penalty, i) in settings.pointPenalties"
          :class="{ 'mr-0': i === settings.pointPenalties.length - 1 }"
        >
          {{ penalty }}
        </span>
      </td>
    </tr>
  </table>
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
