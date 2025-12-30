<script setup lang="ts">
const { user, logout } = useAuth()
</script>

<template>
  <div>
    <h1>Protected App Page</h1>
    <div v-if="user">
      <p>Welcome, {{ user.fullName }}!</p>
      <p>Email: {{ user.email }}</p>

      <button @click="logout">
        Logout
      </button>
    </div>
  </div>
</template>
