import { reactive } from "vue";

export const store = reactive<{
  settings: {
    colorBlind: boolean;
  };
}>({ settings: { colorBlind: false } });
