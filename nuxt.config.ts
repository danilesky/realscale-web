// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // devtools: { enabled: true },

  modules: [
    '@pinia/nuxt',
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/hints',
    '@nuxt/image',
    '@nuxt/icon',
    '@nuxt/scripts',
    '@unocss/nuxt',
    'nuxt-svgo',
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],

  devtools: {
    enabled: false,
  },

  css: [
    '~/styles/main.scss',
  ],

  runtimeConfig: {
    public: {
      apiUrl: process.env.NUXT_PUBLIC_API_URL || '/api',
      apiTimeout: Number(process.env.NUXT_PUBLIC_API_TIMEOUT) || 30000,
    },
  },

  compatibilityDate: '2025-07-15',

  typescript: {
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  unocss: {
    nuxtLayers: true,
    autoImport: true,
    // preflight: true,
  },
})
