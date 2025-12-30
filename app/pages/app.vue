<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  auth: 'required',
})
</script>

<template>
  <NuxtLayout name="app">
    <NuxtPage />
  </NuxtLayout>
</template>