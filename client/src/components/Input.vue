<script lang="ts" setup>
defineProps<{
  name?: string;
  maxlength?: number;
  placeholder: string;
  password?: boolean;
  text: string;
  onInput: (input: string) => void;
}>();
</script>
<template>
  <div class="flex flex-col items-center group">
    <input
      class="pt-4 pb-2 text-4xl text-center text-gray-800 bg-transparent w-md dark:text-gray-100 dark:bg-gray-800"
      :name="name"
      :type="password ? 'password' : 'text'"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :value="text"
      @input="(e) => onInput((e.target as Record<'value', string> | null)?.['value'] ?? '')"
    />
    <div
      class="transition-[width] w-0 h-1 -mt-1 bg-gray-800 group-hover:w-full group-focus-within:w-full dark:bg-gray-100"
    />
  </div>
</template>
