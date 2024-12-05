// https://nuxt.com/docs/api/configuration/nuxt-config
import dotenv from 'dotenv';
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// Nạp biến môi trường từ tệp .env
dotenv.config();
export default defineNuxtConfig({
  // devtools: { enabled: true },
  hooks: {
    'pages:extend'(routes) {
      //
    }
  },
  runtimeConfig: {
    secret_DOMAIN: process.env.DOMAIN,
    public: {
      DOMAIN: process.env.DOMAIN,
    }
  },
  css: ['vuetify/lib/styles/main.sass',
    '@mdi/font/css/materialdesignicons.min.css',],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
    define: {
      'process.env.DEBUG': false,
    },
    plugins: [
      Components({
        // add option {resolveIcons: true} as parameter for resolving problem with icons
        resolvers: [AntDesignVueResolver({resolveIcons: true})],
      }),
    ],
    
    ssr: {
      noExternal: ['moment', 'compute-scroll-into-view', 'ant-design-vue','@ant-design/icons-vue'],
    },  
  },
  modules: [
    // ...
    '@pinia/nuxt',
  ]
})
