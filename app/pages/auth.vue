<script setup lang="ts">
  definePageMeta({
    middleware: 'auth',
    auth: 'guest',
  })
</script>

<template>
  <NuxtLayout name="default">
    <slot />
  </NuxtLayout>
</template>