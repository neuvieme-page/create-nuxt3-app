<script lang="ts" setup>
import { ref } from 'vue'
const root = ref()
onMounted(() => {
  const ctx = root.value.getContext('2d')
})
</script>

<template>
  <canvas ref="root"></canvas>
</template>
