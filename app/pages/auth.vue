<script setup lang="ts">
  definePageMeta({
    middleware: 'auth',
    auth: 'guest',
  })
</script>

<template>
  <NuxtLayout name="default">
    <NuxtPage />
  </NuxtLayout>
</template>