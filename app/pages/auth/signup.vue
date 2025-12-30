<script setup lang="ts">
import { z } from 'zod'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'

definePageMeta({
  layout: false,
})

const schema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(100),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(100),
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(72),
})

const router = useRouter()
const { register, error, isLoading } = useAuth()

const { handleSubmit, defineField, errors } = useForm({
  validationSchema: toTypedSchema(schema),
})

const [firstName] = defineField('firstName')
const [lastName] = defineField('lastName')
const [email] = defineField('email')
const [password] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    await register(values)
    router.push('/app')
  }
  catch (err) {
    console.error('Registration failed:', err)
  }
})
</script>

<template>
  <div>
    <h1>Sign Up</h1>

    <form @submit="onSubmit">
      <div>
        <label for="firstName">First Name</label>
        <input
          id="firstName"
          v-model="firstName"
          type="text"
          placeholder="John"
        >
        <span v-if="errors.firstName">{{ errors.firstName }}</span>
      </div>

      <div>
        <label for="lastName">Last Name</label>
        <input
          id="lastName"
          v-model="lastName"
          type="text"
          placeholder="Doe"
        >
        <span v-if="errors.lastName">{{ errors.lastName }}</span>
      </div>

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
        {{ isLoading ? 'Creating account...' : 'Sign Up' }}
      </button>
    </form>

    <p>
      Already have an account?
      <NuxtLink to="/auth/signin">
        Sign in
      </NuxtLink>
    </p>
  </div>
</template>
