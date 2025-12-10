<script setup lang="ts">
import Logo from '~/assets/branding/logo-base.svg'
</script>

<template>
  <div
    flex="~ items-center gap-2"
    h="[var(--header-h)] <tablet:[var(--header-h-mobile)]"
  >
    <Logo color="black" />

    Header
  </div>
</template>