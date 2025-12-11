<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  middleware: 'guest',
  layout: 'default',
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const router = useRouter()
const route = useRoute()
const { login, error, isLoading } = useAuth()

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    await login(values)
    const redirect = route.query.redirect as string
    router.push(redirect || '/app')
  }
  catch (err) {
    console.error('Login failed:', err)
  }
})
</script>

<template>
  <div>
    <h1>Sign In</h1>

    <form @submit="onSubmit">
      <div>
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="your@email.com"
        >
        <span v-if="errors.email">{{ errors.email }}</span>
      </div>

      <div>
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="Enter your password"
        >
        <span v-if="errors.password">{{ errors.password }}</span>
      </div>

      <div v-if="error">
        {{ error.message }}
      </div>

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>

    <p>
      Don't have an account?
      <NuxtLink to="/auth/signup">
        Sign up
      </NuxtLink>
    </p>
  </div>
</template>
