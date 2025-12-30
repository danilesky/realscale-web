<script setup lang="ts">
const { user, isInitializing, logout } = useAuth()
</script>

<template>
  <div>
    <h1>Protected App Page</h1>

    <template v-if="!isInitializing && user">
      <p>Welcome, {{ user.fullName }}!</p>
      <p>Email: {{ user.email }}</p>

      <button @click="logout">
        Logout
      </button>
    </template>

    <p v-else>
      Loading...
    </p>
  </div>
</template>
