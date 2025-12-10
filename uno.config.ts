import { mergeConfigs } from '@unocss/core'
import config from './.nuxt/uno.config.mjs'
import { presetAttributify, presetWind3 } from 'unocss'

export default mergeConfigs([
  config,
  {
    presets: [
      presetWind3(),
      presetAttributify({}),
    ],

    extendTheme: theme => ({
      ...theme,

      breakpoints: {
        mobile: '640px',
        tablet: '960px',
        desktop: '1280px',
      },
    }),
  },
])
