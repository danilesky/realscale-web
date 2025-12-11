<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { user, logout } = useAuth()

async function handleLogout() {
  await logout()
}
</script>

<template>
  <div>
    <h1>Protected App Page</h1>
    <div v-if="user">
      <p>Welcome, {{ user.name }}!</p>
      <p>Email: {{ user.email }}</p>
      <p>Role: {{ user.role }}</p>
      <button @click="handleLogout">
        Logout
      </button>
    </div>
  </div>
</template>
